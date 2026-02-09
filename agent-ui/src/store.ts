import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  type PlaygroundChatMessage,
  type SessionEntry,
  type ToolCall,
  type Team as TeamDetails,
  type ComboboxAgent,
  type ComboboxTeam
} from '@/types/playground'

// Helper type for setters that accept either a value or an updater function
type SetterOrUpdater<T> = T | ((prev: T) => T)

interface PlaygroundStore {
  // Hydration state
  hydrated: boolean
  setHydrated: () => void

  // Streaming state
  isStreaming: boolean
  setIsStreaming: (value: boolean) => void
  streamingEnabled: boolean
  setStreamingEnabled: (value: boolean) => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (value: string) => void

  // Endpoint state
  selectedEndpoint: string
  setSelectedEndpoint: (value: string) => void
  isEndpointActive: boolean
  setIsEndpointActive: (value: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (value: boolean) => void

  // Entity selection state
  agents: ComboboxAgent[]
  setAgents: (value: ComboboxAgent[]) => void
  teams: ComboboxTeam[]
  setTeams: (value: ComboboxTeam[]) => void
  selectedModel: string
  setSelectedModel: (value: string) => void
  selectedTeamId: string | null
  setSelectedTeamId: (value: string | null) => void
  selectedEntityType: 'agent' | 'team' | null
  setSelectedEntityType: (value: 'agent' | 'team' | null) => void
  selectedTeamDetails: TeamDetails | null
  setSelectedTeamDetails: (value: TeamDetails | null) => void
  hasStorage: boolean
  setHasStorage: (value: boolean) => void

  // Chat state
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>
  messages: PlaygroundChatMessage[]
  setMessages: (value: SetterOrUpdater<PlaygroundChatMessage[]>) => void
  activeToolCalls: Record<string, ToolCall>
  setActiveToolCalls: (
    value: SetterOrUpdater<Record<string, ToolCall>>
  ) => void

  // Session state
  sessionsData: SessionEntry[] | null
  setSessionsData: (value: SetterOrUpdater<SessionEntry[] | null>) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (value: boolean) => void
}

// Helper to resolve setter-or-updater pattern
const resolveValue = <T>(value: SetterOrUpdater<T>, prev: T): T =>
  typeof value === 'function' ? (value as (prev: T) => T)(prev) : value

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set) => ({
      // Hydration
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      // Streaming
      isStreaming: false,
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      streamingEnabled: true,
      setStreamingEnabled: (streamingEnabled) => set({ streamingEnabled }),
      streamingErrorMessage: '',
      setStreamingErrorMessage: (streamingErrorMessage) =>
        set({ streamingErrorMessage }),

      // Endpoint
      selectedEndpoint: 'http://localhost:7777',
      setSelectedEndpoint: (selectedEndpoint) => set({ selectedEndpoint }),
      isEndpointActive: false,
      setIsEndpointActive: (isEndpointActive) => set({ isEndpointActive }),
      isEndpointLoading: true,
      setIsEndpointLoading: (isEndpointLoading) => set({ isEndpointLoading }),

      // Entity selection
      agents: [],
      setAgents: (agents) => set({ agents }),
      teams: [],
      setTeams: (teams) => set({ teams }),
      selectedModel: '',
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      selectedTeamId: null,
      setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
      selectedEntityType: null,
      setSelectedEntityType: (selectedEntityType) =>
        set({ selectedEntityType }),
      selectedTeamDetails: null,
      setSelectedTeamDetails: (selectedTeamDetails) =>
        set({ selectedTeamDetails }),
      hasStorage: false,
      setHasStorage: (hasStorage) => set({ hasStorage }),

      // Chat
      chatInputRef: { current: null },
      messages: [],
      setMessages: (value) =>
        set((state) => ({ messages: resolveValue(value, state.messages) })),
      activeToolCalls: {},
      setActiveToolCalls: (value) =>
        set((state) => ({
          activeToolCalls: resolveValue(value, state.activeToolCalls)
        })),

      // Sessions
      sessionsData: null,
      setSessionsData: (value) =>
        set((state) => ({
          sessionsData: resolveValue(value, state.sessionsData)
        })),
      isSessionsLoading: false,
      setIsSessionsLoading: (isSessionsLoading) => set({ isSessionsLoading })
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
