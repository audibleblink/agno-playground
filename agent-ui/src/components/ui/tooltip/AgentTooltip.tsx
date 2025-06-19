import React from 'react'
import Tooltip from '@/components/ui/tooltip'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import { TeamMember, Agent } from '@/types/playground'

interface AgentTooltipProps {
  agent: TeamMember | Agent
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayDuration?: number
}

const AgentTooltip: React.FC<AgentTooltipProps> = ({
  agent,
  children,
  side = 'top',
  delayDuration = 700
}) => {
  const isTeam = 'team_id' in agent && agent.team_id
  const agentId = 'agent_id' in agent ? agent.agent_id : agent.agent_id || (agent as any).value
  const memberCount = 'members' in agent && agent.members ? agent.members.length : 0

  const tooltipContent = (
    <div className="max-w-64 space-y-3 p-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon
          type={isTeam ? 'users' : 'agent'}
          size="sm"
          className={isTeam ? 'text-blue-400' : 'text-primary'}
        />
        <div>
          <p className="font-medium text-white">{agent.name}</p>
          {isTeam && (
            <p className="text-xs text-blue-300">Team • {memberCount} members</p>
          )}
        </div>
      </div>

      {/* Model Information */}
      {agent.model && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary/80">Model</p>
          <div className="flex items-center gap-2 rounded-md bg-background-secondary/50 p-2">
            <Icon
              type={getProviderIcon(agent.model.provider) || 'user'}
              size="xs"
              className="text-muted"
            />
            <div className="text-xs">
              <p className="text-white">{agent.model.name || agent.model.model}</p>
              <p className="text-muted uppercase">{agent.model.provider}</p>
            </div>
          </div>
        </div>
      )}

      {/* Agent ID */}
      {agentId && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary/80">ID</p>
          <p className="text-xs font-mono text-muted">{agentId}</p>
        </div>
      )}

      {/* Description (if available) */}
      {'description' in agent && agent.description && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary/80">Description</p>
          <p className="text-xs text-muted">{agent.description}</p>
        </div>
      )}

      {/* Storage indicator */}
      {'storage' in agent && agent.storage !== undefined && (
        <div className="flex items-center gap-2">
          <Icon
            type={agent.storage ? 'check' : 'x'}
            size="xs"
            className={agent.storage ? 'text-green-400' : 'text-red-400'}
          />
          <p className="text-xs text-muted">
            {agent.storage ? 'Memory enabled' : 'Memory disabled'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <Tooltip
      content={tooltipContent}
      side={side}
      delayDuration={delayDuration}
    >
      {children}
    </Tooltip>
  )
}

export default AgentTooltip