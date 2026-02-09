export const APIRoutes = {
  GetPlaygroundAgents: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents`,
  AgentRun: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/agents/{agent_id}/runs`,
  PlaygroundStatus: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/health`,
  GetPlaygroundSessions: (PlaygroundApiUrl: string, agentId: string) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions`,
  GetPlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}`,

  DeletePlaygroundSession: (
    PlaygroundApiUrl: string,
    agentId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/agents/${agentId}/sessions/${sessionId}`,

  GetPlayGroundTeams: (PlaygroundApiUrl: string) =>
    `${PlaygroundApiUrl}/teams`,
  GetPlaygroundTeam: (PlaygroundApiUrl: string, teamId: string) =>
    `${PlaygroundApiUrl}/teams/${teamId}`,
  TeamRun: (PlaygroundApiUrl: string, teamId: string) =>
    `${PlaygroundApiUrl}/teams/${teamId}/runs`,
  GetPlaygroundTeamSessions: (PlaygroundApiUrl: string, teamId: string) =>
    `${PlaygroundApiUrl}/teams/${teamId}/sessions`,
  GetPlaygroundTeamSession: (
    PlaygroundApiUrl: string,
    teamId: string,
    sessionId: string
  ) =>
    `${PlaygroundApiUrl}/teams/${teamId}/sessions/${sessionId}`,
  DeletePlaygroundTeamSession: (
    PlaygroundApiUrl: string,
    teamId: string,
    sessionId: string
  ) => `${PlaygroundApiUrl}/teams/${teamId}/sessions/${sessionId}`
}
