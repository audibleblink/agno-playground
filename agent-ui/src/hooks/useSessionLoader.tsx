import { useCallback } from 'react'
import {
  getPlaygroundSessionAPI,
  getAllPlaygroundSessionsAPI,
  getPlaygroundTeamSessionsAPI,
  getPlaygroundTeamSessionAPI
} from '@/api/playground'
import { usePlaygroundStore } from '../store'
import { toast } from 'sonner'
import type {
  PlaygroundChatMessage,
  ToolCall,
  ReasoningMessage,
  ChatEntry
} from '@/types/playground'
import { getJsonMarkdown } from '@/lib/utils'

interface LoaderArgs {
  entityType: 'agent' | 'team' | null
  agentId?: string | null
  teamId?: string | null
}

/** Extract tool calls from reasoning messages */
const extractToolCallsFromReasoning = (
  reasoningMessages: ReasoningMessage[] = []
): ToolCall[] =>
  reasoningMessages
    .filter((msg) => msg.role === 'tool')
    .map((msg) => ({
      role: 'tool' as const,
      content: msg.content,
      tool_call_id: msg.tool_call_id ?? '',
      tool_name: msg.tool_name ?? '',
      tool_args: msg.tool_args ?? {},
      tool_call_error: msg.tool_call_error ?? false,
      metrics: msg.metrics ?? { time: 0 },
      created_at: msg.created_at ?? Math.floor(Date.now() / 1000)
    }))

/** Convert a chat run to playground messages */
const chatRunToMessages = (run: ChatEntry): PlaygroundChatMessage[] => {
  const messages: PlaygroundChatMessage[] = []

  if (run.message) {
    messages.push({
      role: 'user',
      content: run.message.content ?? '',
      created_at: run.message.created_at
    })
  }

  if (run.response) {
    const toolCalls = [
      ...(run.response.tools ?? []),
      ...extractToolCallsFromReasoning(run.response.extra_data?.reasoning_messages)
    ]

    messages.push({
      role: 'agent',
      content: (run.response.content as string) ?? '',
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      extra_data: run.response.extra_data,
      images: run.response.images,
      videos: run.response.videos,
      audio: run.response.audio,
      response_audio: run.response.response_audio,
      created_at: run.response.created_at
    })
  }

  return messages
}

/** Normalize message content to string format */
const normalizeMessageContent = (
  message: PlaygroundChatMessage
): PlaygroundChatMessage => {
  // Handle array content (multimodal messages)
  if (Array.isArray(message.content)) {
    const textContent = (message.content as Array<{ type: string; text?: string }>)
      .filter((item) => item.type === 'text')
      .map((item) => item.text ?? '')
      .join(' ')
    return { ...message, content: textContent }
  }

  // Handle object content
  if (typeof message.content !== 'string') {
    return { ...message, content: getJsonMarkdown(message.content) }
  }

  return message
}

const useSessionLoader = () => {
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const setIsSessionsLoading = usePlaygroundStore(
    (state) => state.setIsSessionsLoading
  )
  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)

  const getSessions = useCallback(
    async ({ entityType, agentId, teamId }: LoaderArgs) => {
      if (!selectedEndpoint) return

      try {
        setIsSessionsLoading(true)

        const sessions =
          entityType === 'team'
            ? await getPlaygroundTeamSessionsAPI(selectedEndpoint, teamId!)
            : await getAllPlaygroundSessionsAPI(selectedEndpoint, agentId!)

        setSessionsData(sessions)
      } catch {
        toast.error('Error loading sessions')
        setSessionsData([])
      } finally {
        setIsSessionsLoading(false)
      }
    },
    [selectedEndpoint, setSessionsData, setIsSessionsLoading]
  )

  const getSession = useCallback(
    async ({ entityType, agentId, teamId }: LoaderArgs, sessionId: string) => {
      if (!selectedEndpoint || !sessionId) return null

      try {
        const response =
          entityType === 'team'
            ? await getPlaygroundTeamSessionAPI(
                selectedEndpoint,
                teamId!,
                sessionId
              )
            : await getPlaygroundSessionAPI(
                selectedEndpoint,
                agentId!,
                sessionId
              )

        if (!response) return null

        const sessionHistory = response.runs ?? response.memory.runs
        if (!Array.isArray(sessionHistory)) return null

        const messages = sessionHistory
          .flatMap(chatRunToMessages)
          .map(normalizeMessageContent)

        setMessages(messages)
        return messages
      } catch {
        return null
      }
    },
    [selectedEndpoint, setMessages]
  )

  return { getSession, getSessions }
}

export default useSessionLoader
