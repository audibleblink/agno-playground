import { toast } from 'sonner'

import { APIRoutes } from './routes'

import type {
  Agent,
  ComboboxAgent,
  SessionEntry,
  ComboboxTeam,
  Team,
  ChatEntry
} from '@/types/playground'

// Session response structure from the API
export interface SessionResponse {
  session_id: string
  agent_id: string
  user_id: string | null
  runs?: ChatEntry[]
  memory: {
    runs?: ChatEntry[]
    chats?: ChatEntry[]
  }
  agent_data: Record<string, unknown>
}

/**
 * Helper to perform a fetch with consistent error handling.
 * Returns null on error instead of throwing (unless throwOnError is true).
 */
async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  config: {
    errorMessage?: string
    showToast?: boolean
    return404AsEmpty?: boolean
  } = {}
): Promise<T | null> {
  const { errorMessage, showToast = false, return404AsEmpty = false } = config

  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      if (return404AsEmpty && response.status === 404) {
        return null
      }
      if (showToast && errorMessage) {
        toast.error(`${errorMessage}: ${response.statusText}`)
      }
      return null
    }

    return response.json()
  } catch {
    if (showToast && errorMessage) {
      toast.error(errorMessage)
    }
    return null
  }
}

/**
 * Transforms raw API entity data into combobox format
 */
const toComboboxItem = (
  item: Agent | Team
): ComboboxAgent | ComboboxTeam => ({
  value: item.id || '',
  label: item.name || '',
  model: item.model || { provider: '' },
  storage: item.storage || false
})

// ============================================================================
// Agent APIs
// ============================================================================

export const getPlaygroundAgentsAPI = async (
  endpoint: string
): Promise<ComboboxAgent[]> => {
  const data = await apiFetch<Agent[]>(
    APIRoutes.GetPlaygroundAgents(endpoint),
    { method: 'GET' },
    { errorMessage: 'Failed to fetch playground agents', showToast: true }
  )
  return data?.map(toComboboxItem) ?? []
}

export const getPlaygroundStatusAPI = async (base: string): Promise<number> => {
  try {
    const response = await fetch(APIRoutes.PlaygroundStatus(base))
    return response.status
  } catch {
    return 503
  }
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string
): Promise<SessionEntry[]> => {
  const data = await apiFetch<SessionEntry[]>(
    APIRoutes.GetPlaygroundSessions(base, agentId),
    { method: 'GET' },
    { return404AsEmpty: true }
  )
  return data ?? []
}

export const getPlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
): Promise<SessionResponse | null> => {
  return apiFetch<SessionResponse>(
    APIRoutes.GetPlaygroundSession(base, agentId, sessionId),
    { method: 'GET' }
  )
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string
) => {
  return fetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId),
    { method: 'DELETE' }
  )
}

// ============================================================================
// Team APIs
// ============================================================================

export const getPlaygroundTeamsAPI = async (
  endpoint: string
): Promise<ComboboxTeam[]> => {
  const data = await apiFetch<Team[]>(
    APIRoutes.GetPlayGroundTeams(endpoint),
    { method: 'GET' },
    { errorMessage: 'Failed to fetch playground teams', showToast: true }
  )
  return data?.map(toComboboxItem) ?? []
}

export const getPlaygroundTeamAPI = async (
  endpoint: string,
  teamId: string
): Promise<Team | null> => {
  return apiFetch<Team>(
    APIRoutes.GetPlaygroundTeam(endpoint, teamId),
    { method: 'GET' },
    { errorMessage: 'Failed to fetch team details', showToast: true }
  )
}

export const getPlaygroundTeamSessionsAPI = async (
  base: string,
  teamId: string
): Promise<SessionEntry[]> => {
  const data = await apiFetch<SessionEntry[]>(
    APIRoutes.GetPlaygroundTeamSessions(base, teamId),
    { method: 'GET' },
    {
      errorMessage: 'Error fetching team sessions',
      showToast: true,
      return404AsEmpty: true
    }
  )
  return data ?? []
}

export const getPlaygroundTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string
): Promise<SessionResponse | null> => {
  return apiFetch<SessionResponse>(
    APIRoutes.GetPlaygroundTeamSession(base, teamId, sessionId),
    { method: 'GET' }
  )
}

export const deletePlaygroundTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string
) => {
  const response = await fetch(
    APIRoutes.DeletePlaygroundTeamSession(base, teamId, sessionId),
    { method: 'DELETE' }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete team session: ${response.statusText}`)
  }
  return response
}
