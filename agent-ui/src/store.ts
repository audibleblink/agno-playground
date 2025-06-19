import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  type PlaygroundChatMessage,
  type SessionEntry,
  type ToolCall,
  type Team as TeamDetails,
  type ComboboxTeam
} from '@/types/playground'

interface Agent {
  value: string
  label: string
  model: {
    provider: string
  }
  storage?: boolean
}

interface PlaygroundStore {
  hydrated: boolean
  setHydrated: () => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (streamingErrorMessage: string) => void
  endpoints: {
    endpoint: string
    id_playground_endpoint: string
  }[]
  setEndpoints: (
    endpoints: {
      endpoint: string
      id_playground_endpoint: string
    }[]
  ) => void
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  streamingEnabled: boolean
  setStreamingEnabled: (streamingEnabled: boolean) => void
  isEndpointActive: boolean
  setIsEndpointActive: (isActive: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (isLoading: boolean) => void
  messages: PlaygroundChatMessage[]
  setMessages: (
    messages:
      | PlaygroundChatMessage[]
      | ((prevMessages: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) => void
  activeToolCalls: Record<string, ToolCall>
  setActiveToolCalls: (
    activeToolCalls:
      | Record<string, ToolCall>
      | ((prevToolCalls: Record<string, ToolCall>) => Record<string, ToolCall>)
  ) => void
  hasStorage: boolean
  setHasStorage: (hasStorage: boolean) => void
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>
  selectedEndpoint: string
  setSelectedEndpoint: (selectedEndpoint: string) => void
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
  teams: ComboboxTeam[]
  setTeams: (teams: ComboboxTeam[]) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  selectedTeamId: string | null
  setSelectedTeamId: (teamId: string | null) => void
  selectedEntityType: 'agent' | 'team' | null
  setSelectedEntityType: (type: 'agent' | 'team' | null) => void
  selectedTeamDetails: TeamDetails | null
  setSelectedTeamDetails: (team: TeamDetails | null) => void
  getAgentNameById: (agentId: string) => string | null
  sessionsData: SessionEntry[] | null
  setSessionsData: (
    sessionsData:
      | SessionEntry[]
      | ((prevSessions: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (isSessionsLoading: boolean) => void
}

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      streamingErrorMessage: '',
      setStreamingErrorMessage: (streamingErrorMessage) =>
        set(() => ({ streamingErrorMessage })),
      endpoints: [],
      setEndpoints: (endpoints) => set(() => ({ endpoints })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
      streamingEnabled: true,
      setStreamingEnabled: (streamingEnabled) =>
        set(() => ({ streamingEnabled })),
      isEndpointActive: false,
      setIsEndpointActive: (isActive) =>
        set(() => ({ isEndpointActive: isActive })),
      isEndpointLoading: true,
      setIsEndpointLoading: (isLoading) =>
        set(() => ({ isEndpointLoading: isLoading })),
      messages: [],
      setMessages: (messages) =>
        set((state) => ({
          messages:
            typeof messages === 'function' ? messages(state.messages) : messages
        })),
      activeToolCalls: {},
      setActiveToolCalls: (activeToolCalls) =>
        set((state) => ({
          activeToolCalls:
            typeof activeToolCalls === 'function'
              ? activeToolCalls(state.activeToolCalls)
              : activeToolCalls
        })),
      hasStorage: false,
      setHasStorage: (hasStorage) => set(() => ({ hasStorage })),
      chatInputRef: { current: null },
      selectedEndpoint: 'http://localhost:7777',
      setSelectedEndpoint: (selectedEndpoint) =>
        set(() => ({ selectedEndpoint })),
      agents: [],
      setAgents: (agents) => set({ agents }),
      teams: [],
      setTeams: (teams) => set({ teams }),
      selectedModel: '',
      setSelectedModel: (selectedModel) => set(() => ({ selectedModel })),
      selectedTeamId: null,
      setSelectedTeamId: (teamId) => set(() => ({ selectedTeamId: teamId })),
      selectedEntityType: null,
      setSelectedEntityType: (type) =>
        set(() => ({ selectedEntityType: type })),
      selectedTeamDetails: null,
      setSelectedTeamDetails: (team) =>
        set(() => ({ selectedTeamDetails: team })),
      getAgentNameById: (agentId) => {
        const state = usePlaygroundStore.getState()
        
        // Check if it's the current agent
        const agents = state.agents
        const agent = agents.find(a => a.value === agentId)
        if (agent) return agent.label
        
        // Check if it's the current team
        const teams = state.teams
        const team = teams.find(t => t.value === agentId)
        if (team) return team.label
        
        // Check in team members (recursive function to handle nested teams)
        const findInMembers = (members: TeamDetails['members']): string | null => {
          if (!members) return null
          
          for (const member of members) {
            if (member.agent_id === agentId || member.team_id === agentId) {
              return member.name
            }
            // Check nested team members
            if (member.members) {
              const found = findInMembers(member.members)
              if (found) return found
            }
          }
          return null
        }
        
        if (state.selectedTeamDetails?.members) {
          const found = findInMembers(state.selectedTeamDetails.members)
          if (found) return found
        }
        
        return null
      },
      sessionsData: null,
      setSessionsData: (sessionsData) =>
        set((state) => ({
          sessionsData:
            typeof sessionsData === 'function'
              ? sessionsData(state.sessionsData)
              : sessionsData
        })),
      isSessionsLoading: false,
      setIsSessionsLoading: (isSessionsLoading) =>
        set(() => ({ isSessionsLoading }))
    }),
    {
      name: 'endpoint-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedEndpoint: state.selectedEndpoint,
        streamingEnabled: state.streamingEnabled
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.()
      }
    }
  )
)
