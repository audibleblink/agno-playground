import { useCallback } from 'react'

import { usePlaygroundStore } from '../store'

import type {
  ComboboxAgent,
  ComboboxTeam,
  PlaygroundChatMessage
} from '@/types/playground'
import {
  getPlaygroundAgentsAPI,
  getPlaygroundStatusAPI,
  getPlaygroundTeamsAPI
} from '@/api/playground'
import { useQueryState } from 'nuqs'

const useChatActions = () => {
  const { chatInputRef } = usePlaygroundStore()
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const [, setSessionId] = useQueryState('session')
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive
  )
  const setIsEndpointLoading = usePlaygroundStore(
    (state) => state.setIsEndpointLoading
  )
  const setAgents = usePlaygroundStore((state) => state.setAgents)
  const setTeams = usePlaygroundStore((state) => state.setTeams)
  const setSelectedModel = usePlaygroundStore((state) => state.setSelectedModel)
  const setHasStorage = usePlaygroundStore((state) => state.setHasStorage)
  const setSelectedTeamId = usePlaygroundStore(
    (state) => state.setSelectedTeamId
  )
  const setSelectedEntityType = usePlaygroundStore(
    (state) => state.setSelectedEntityType
  )
  const [agentId, setAgentId] = useQueryState('agent')
  const [teamId, setTeamId] = useQueryState('team')

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusChatInput = useCallback(() => {
    requestAnimationFrame(() => chatInputRef?.current?.focus())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addMessage = useCallback(
    (message: PlaygroundChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message])
    },
    [setMessages]
  )

  /** Reset selection state to empty/inactive */
  const resetSelectionState = useCallback(() => {
    setSelectedModel('')
    setHasStorage(false)
    setSelectedTeamId(null)
    setSelectedEntityType(null)
  }, [setSelectedModel, setHasStorage, setSelectedTeamId, setSelectedEntityType])

  /** Select an entity (team or agent) and update related state */
  const selectEntity = useCallback(
    (
      entity: ComboboxAgent | ComboboxTeam,
      type: 'agent' | 'team'
    ) => {
      setSelectedModel(entity.model.provider || '')
      setHasStorage(!!entity.storage)
      setSelectedEntityType(type)

      if (type === 'team') {
        setTeamId(entity.value)
        setSelectedTeamId(entity.value)
      } else {
        setAgentId(entity.value)
        setSelectedTeamId(null)
      }
    },
    [
      setSelectedModel,
      setHasStorage,
      setSelectedEntityType,
      setTeamId,
      setSelectedTeamId,
      setAgentId
    ]
  )

  const initializePlayground = useCallback(async () => {
    setIsEndpointLoading(true)

    try {
      const status = await getPlaygroundStatusAPI(selectedEndpoint)

      if (status !== 200) {
        setIsEndpointActive(false)
        resetSelectionState()
        setAgentId(null)
        setTeamId(null)
        setAgents([])
        setTeams([])
        return { agents: [], teams: [] }
      }

      setIsEndpointActive(true)

      // Fetch agents and teams in parallel
      const [teams, agents] = await Promise.all([
        getPlaygroundTeamsAPI(selectedEndpoint),
        getPlaygroundAgentsAPI(selectedEndpoint)
      ])

      setAgents(agents)
      setTeams(teams)

      // Auto-select first entity if none selected
      if (!agentId && !teamId) {
        if (teams.length > 0) {
          selectEntity(teams[0], 'team')
        } else if (agents.length > 0) {
          selectEntity(agents[0], 'agent')
        } else {
          resetSelectionState()
        }
      }

      return { agents, teams }
    } catch (error) {
      console.error('Error initializing playground:', error)
      setIsEndpointActive(false)
      resetSelectionState()
      setAgentId(null)
      setTeamId(null)
      setAgents([])
      setTeams([])
      return { agents: [], teams: [] }
    } finally {
      setIsEndpointLoading(false)
    }
  }, [
    selectedEndpoint,
    agentId,
    teamId,
    setIsEndpointActive,
    setIsEndpointLoading,
    setAgents,
    setTeams,
    setAgentId,
    setTeamId,
    selectEntity,
    resetSelectionState
  ])

  return {
    clearChat,
    addMessage,
    focusChatInput,
    initializePlayground
  }
}

export default useChatActions
