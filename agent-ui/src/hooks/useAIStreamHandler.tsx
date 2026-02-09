import { useCallback, useRef } from 'react'

import { APIRoutes } from '@/api/routes'
import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '../store'
import {
  RunEvent,
  type RunResponse,
  type ToolCall,
  type PlaygroundChatMessage
} from '@/types/playground'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'
import useAIResponseStream from './useAIResponseStream'
import { useQueryState } from 'nuqs'
import { getJsonMarkdown } from '@/lib/utils'



const useAIChatStreamHandler = () => {
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const { addMessage, focusChatInput } = useChatActions()
  const [agentId] = useQueryState('agent')
  const [teamId] = useQueryState('team')
  const [sessionId, setSessionId] = useQueryState('session')
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const selectedEntityType = usePlaygroundStore(
    (state) => state.selectedEntityType
  )
  const setStreamingErrorMessage = usePlaygroundStore(
    (state) => state.setStreamingErrorMessage
  )
  const setIsStreaming = usePlaygroundStore((state) => state.setIsStreaming)
  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)
  const hasStorage = usePlaygroundStore((state) => state.hasStorage)
  const setActiveToolCalls = usePlaygroundStore(
    (state) => state.setActiveToolCalls
  )
  const { streamResponse } = useAIResponseStream()

  // Use ref for active tool calls to avoid stale closure issues
  const activeToolCallsRef = useRef<Record<string, ToolCall>>({})

  /** Mark the last agent message as having a streaming error */
  const markLastMessageAsError = useCallback(() => {
    setMessages((prev) => {
      const messages = [...prev]
      const last = messages[messages.length - 1]
      if (last?.role === 'agent') {
        last.streamingError = true
      }
      return messages
    })
  }, [setMessages])

  /** Remove a session from the sessions list */
  const removeSession = useCallback(
    (sessionIdToRemove: string | null) => {
      if (!hasStorage || !sessionIdToRemove) return
      setSessionsData(
        (prev) => prev?.filter((s) => s.session_id !== sessionIdToRemove) ?? null
      )
    },
    [hasStorage, setSessionsData]
  )

  /** Handle error state consistently */
  const handleError = useCallback(
    (message: string, newSessionId: string | null) => {
      setActiveToolCalls({})
      activeToolCallsRef.current = {}
      markLastMessageAsError()
      setStreamingErrorMessage(message)
      removeSession(newSessionId)
    },
    [
      setActiveToolCalls,
      markLastMessageAsError,
      setStreamingErrorMessage,
      removeSession
    ]
  )

  /** Update the last agent message with new data */
  const updateLastAgentMessage = useCallback(
    (updater: (message: PlaygroundChatMessage) => PlaygroundChatMessage) => {
      setMessages((prev) => {
        const messages = [...prev]
        const last = messages[messages.length - 1]
        if (last?.role === 'agent') {
          messages[messages.length - 1] = updater(last)
        }
        return messages
      })
    },
    [setMessages]
  )

  /** Build the API URL for the run endpoint */
  const buildRunUrl = useCallback(() => {
    const endpointUrl = constructEndpointUrl(selectedEndpoint)

    if (selectedEntityType === 'team' && teamId) {
      return APIRoutes.TeamRun(endpointUrl, teamId)
    }
    if (selectedEntityType === 'agent' && agentId) {
      return APIRoutes.AgentRun(endpointUrl).replace('{agent_id}', agentId)
    }
    return null
  }, [selectedEndpoint, selectedEntityType, teamId, agentId])

  /** Handle RunStarted/ReasoningStarted events */
  const handleRunStarted = useCallback(
    (chunk: RunResponse, messageText: string) => {
      const chunkSessionId = chunk.session_id as string
      setSessionId(chunkSessionId)

      if (
        hasStorage &&
        chunkSessionId &&
        (!sessionId || sessionId !== chunkSessionId)
      ) {
        setSessionsData((prev) => {
          if (prev?.some((s) => s.session_id === chunkSessionId)) return prev
          return [
            {
              session_id: chunkSessionId,
              title: messageText,
              created_at: chunk.created_at
            },
            ...(prev ?? [])
          ]
        })
      }

      return chunkSessionId
    },
    [hasStorage, sessionId, setSessionId, setSessionsData]
  )

  /** Handle ToolCallStarted event */
  const handleToolCallStarted = useCallback(
    (chunk: RunResponse) => {
      const toolData = chunk.tool
      if (!toolData?.tool_name || !toolData?.tool_call_id) return

      const newToolCall: ToolCall = {
        role: 'tool',
        content: null,
        tool_call_id: toolData.tool_call_id,
        tool_name: toolData.tool_name,
        tool_args: toolData.tool_args || {},
        tool_call_error: false,
        metrics: { time: 0 },
        created_at: chunk.created_at
      }

      activeToolCallsRef.current[toolData.tool_call_id] = newToolCall
      setActiveToolCalls((prev) => ({
        ...prev,
        [toolData.tool_call_id]: newToolCall
      }))
    },
    [setActiveToolCalls]
  )

  /** Handle ToolCallCompleted event */
  const handleToolCallCompleted = useCallback(
    (chunk: RunResponse) => {
      const toolData = chunk.tool
      if (!toolData?.tool_call_id) return

      const activeToolCall = activeToolCallsRef.current[toolData.tool_call_id]

      // Remove from active calls
      delete activeToolCallsRef.current[toolData.tool_call_id]
      setActiveToolCalls((prev) => {
        const updated = { ...prev }
        delete updated[toolData.tool_call_id]
        return updated
      })

      // Add completed tool call to message
      const completedToolCall: ToolCall = {
        role: 'tool',
        content: toolData.result || null,
        tool_call_id: toolData.tool_call_id,
        tool_name: activeToolCall?.tool_name || toolData.tool_name || 'unknown',
        tool_args: activeToolCall?.tool_args || toolData.tool_args || {},
        tool_call_error: toolData.tool_call_error || false,
        metrics: { time: toolData.metrics?.duration || 0 },
        created_at: chunk.created_at
      }

      updateLastAgentMessage((msg) => ({
        ...msg,
        tool_calls: [...(msg.tool_calls || []), completedToolCall]
      }))
    },
    [setActiveToolCalls, updateLastAgentMessage]
  )

  /** Handle RunResponse event (streaming content) */
  const handleRunResponse = useCallback(
    (chunk: RunResponse, lastContentRef: { current: string }) => {
      updateLastAgentMessage((msg) => {
        const updated = { ...msg }

        // Handle string content
        if (typeof chunk.content === 'string') {
          const uniqueContent = chunk.content.replace(lastContentRef.current, '')
          updated.content += uniqueContent
          lastContentRef.current = chunk.content

          if (chunk.tools?.length) {
            updated.tool_calls = [...chunk.tools]
          }
          if (chunk.extra_data?.reasoning_steps) {
            updated.extra_data = {
              ...updated.extra_data,
              reasoning_steps: chunk.extra_data.reasoning_steps
            }
          }
          if (chunk.extra_data?.references) {
            updated.extra_data = {
              ...updated.extra_data,
              references: chunk.extra_data.references
            }
          }
          updated.created_at = chunk.created_at ?? updated.created_at
          if (chunk.images) updated.images = chunk.images
          if (chunk.videos) updated.videos = chunk.videos
          if (chunk.audio) updated.audio = chunk.audio
        }
        // Handle object content (JSON)
        else if (chunk.content !== null && typeof chunk.content === 'object') {
          const jsonBlock = getJsonMarkdown(chunk.content)
          updated.content += jsonBlock
          lastContentRef.current = jsonBlock
        }
        // Handle audio transcript
        else if (chunk.response_audio?.transcript) {
          updated.response_audio = {
            ...updated.response_audio,
            transcript:
              (updated.response_audio?.transcript || '') +
              chunk.response_audio.transcript
          }
        }

        return updated
      })
    },
    [updateLastAgentMessage]
  )

  /** Handle RunCompleted event */
  const handleRunCompleted = useCallback(
    (chunk: RunResponse) => {
      setActiveToolCalls({})
      activeToolCallsRef.current = {}

      updateLastAgentMessage((msg) => {
        let content: string
        if (typeof chunk.content === 'string') {
          content = chunk.content
        } else {
          try {
            content = JSON.stringify(chunk.content)
          } catch {
            content = 'Error parsing response'
          }
        }

        return {
          ...msg,
          content,
          tool_calls:
            chunk.tools?.length ? [...chunk.tools] : msg.tool_calls,
          images: chunk.images ?? msg.images,
          videos: chunk.videos ?? msg.videos,
          response_audio: chunk.response_audio,
          created_at: chunk.created_at ?? msg.created_at,
          extra_data: {
            reasoning_steps:
              chunk.extra_data?.reasoning_steps ??
              msg.extra_data?.reasoning_steps,
            references:
              chunk.extra_data?.references ?? msg.extra_data?.references
          }
        }
      })
    },
    [setActiveToolCalls, updateLastAgentMessage]
  )

  const handleStreamResponse = useCallback(
    async (input: string | FormData, stream: boolean = true) => {
      setIsStreaming(true)

      // Prepare form data
      const formData = input instanceof FormData ? input : new FormData()
      if (typeof input === 'string') {
        formData.append('message', input)
      }
      const messageText = formData.get('message') as string

      // Remove previous error message pair if retrying
      setMessages((prev) => {
        if (prev.length >= 2) {
          const last = prev[prev.length - 1]
          const secondLast = prev[prev.length - 2]
          if (
            last.role === 'agent' &&
            last.streamingError &&
            secondLast.role === 'user'
          ) {
            return prev.slice(0, -2)
          }
        }
        return prev
      })

      // Add user and placeholder agent messages
      const now = Math.floor(Date.now() / 1000)
      addMessage({ role: 'user', content: messageText, created_at: now })
      addMessage({
        role: 'agent',
        content: '',
        tool_calls: [],
        streamingError: false,
        created_at: now + 1
      })

      // Track content for deduplication
      const lastContentRef = { current: '' }
      let newSessionId = sessionId

      try {
        const runUrl = buildRunUrl()
        if (!runUrl) {
          handleError('Please select an agent or team first.', null)
          setIsStreaming(false)
          return
        }

        formData.append('stream', stream.toString())
        formData.append('session_id', sessionId ?? '')

        // Reset active tool calls
        setActiveToolCalls({})
        activeToolCallsRef.current = {}

        await streamResponse({
          apiUrl: runUrl,
          requestBody: formData,
          onChunk: (chunk: RunResponse) => {
            switch (chunk.event) {
              // Agent events
              case RunEvent.RunStarted:
              case RunEvent.ReasoningStarted:
              // Team events
              case RunEvent.TeamRunStarted:
              case RunEvent.TeamReasoningStarted:
                newSessionId = handleRunStarted(chunk, messageText)
                break

              case RunEvent.ToolCallStarted:
              case RunEvent.TeamToolCallStarted:
                handleToolCallStarted(chunk)
                break

              case RunEvent.ToolCallCompleted:
              case RunEvent.TeamToolCallCompleted:
                handleToolCallCompleted(chunk)
                break

              case RunEvent.RunResponse:
              case RunEvent.TeamRunContent:
                handleRunResponse(chunk, lastContentRef)
                break

              case RunEvent.RunError:
              case RunEvent.TeamRunError:
                handleError(chunk.content as string, newSessionId)
                break

              case RunEvent.RunCompleted:
              case RunEvent.TeamRunCompleted:
                handleRunCompleted(chunk)
                break
            }
          },
          onError: (error) => handleError(error.message, newSessionId),
          onComplete: () => {}
        })
      } catch (error) {
        handleError(
          error instanceof Error ? error.message : String(error),
          newSessionId
        )
      } finally {
        focusChatInput()
        setIsStreaming(false)
      }
    },
    [
      setMessages,
      addMessage,
      sessionId,
      buildRunUrl,
      streamResponse,
      setIsStreaming,
      focusChatInput,
      setActiveToolCalls,
      handleError,
      handleRunStarted,
      handleToolCallStarted,
      handleToolCallCompleted,
      handleRunResponse,
      handleRunCompleted
    ]
  )

  return { handleStreamResponse }
}

export default useAIChatStreamHandler
