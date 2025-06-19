'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { usePlaygroundStore } from '@/store'
import { getPlaygroundTeamAPI } from '@/api/playground'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { TeamMember } from '@/types/playground'
import AgentTooltip from '@/components/ui/tooltip/AgentTooltip'

interface TeamMemberItemProps {
  member: TeamMember
  depth: number
  index: number
}

const TeamMemberItem: React.FC<TeamMemberItemProps> = ({ member, depth, index }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = member.members && member.members.length > 0
  const indentPx = depth * 16 // 16px per level
  
  // Check if this agent is currently active based on tool calls
  const activeToolCalls = usePlaygroundStore((state) => state.activeToolCalls)
  const isActive = Object.values(activeToolCalls).some(
    toolCall => toolCall.agent_id === member.agent_id || toolCall.agent_id === member.team_id
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: 'easeInOut'
      }}
    >
      <div
        className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primaryAccent p-3 text-xs font-medium"
        style={{ marginLeft: `${indentPx}px` }}
      >
        {/* Tree connector lines */}
        {depth > 0 && (
          <div 
            className="absolute border-l border-primary/20"
            style={{ 
              left: `${indentPx - 8}px`,
              top: 0,
              bottom: hasChildren && isExpanded ? '50%' : 0,
              width: '1px'
            }}
          />
        )}
        
        {/* Expand/collapse button for teams with members */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-primary/10"
          >
            <Icon
              type={isExpanded ? 'chevron-down' : 'chevron-right'}
              size="xs"
              className="text-primary/60"
            />
          </button>
        ) : (
          <div className="w-4" /> // Spacer for alignment
        )}

        <div className="relative">
          <Icon
            type={member.team_id ? 'users' : 'user'}
            size="xs"
            className={member.team_id ? 'text-blue-400' : 'text-primary'}
          />
          {isActive && (
            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          )}
        </div>
        
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <AgentTooltip agent={member} side="right">
              <span className="text-xs font-medium uppercase text-white cursor-help hover:text-primary/80">
                {member.name}
              </span>
            </AgentTooltip>
            {member.team_id && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                Team
              </span>
            )}
          </div>
          
          {member.model && (
            <div className="flex items-center gap-2">
              <Icon
                type={getProviderIcon(member.model.provider) || 'user'}
                size="xs"
                className="text-muted"
              />
              <span className="text-xs uppercase text-muted">
                {member.model.provider}
              </span>
            </div>
          )}
          
          {hasChildren && (
            <div className="text-xs text-muted">
              {member.members!.length} member{member.members!.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Render nested members */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex flex-col gap-2"
          >
            {member.members!.map((nestedMember, nestedIndex) => (
              <TeamMemberItem
                key={`${nestedMember.agent_id || nestedMember.team_id}-${nestedIndex}`}
                member={nestedMember}
                depth={depth + 1}
                index={nestedIndex}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function TeamMembers() {
  const {
    selectedTeamId,
    selectedEndpoint,
    selectedTeamDetails,
    setSelectedTeamDetails,
    isEndpointActive
  } = usePlaygroundStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!selectedTeamId || !selectedEndpoint || !isEndpointActive) {
        setSelectedTeamDetails(null)
        return
      }

      setIsLoading(true)
      try {
        const teamDetails = await getPlaygroundTeamAPI(
          selectedEndpoint,
          selectedTeamId
        )
        setSelectedTeamDetails(teamDetails)
      } catch (error) {
        console.error('Error fetching team details:', error)
        setSelectedTeamDetails(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamDetails()
  }, [
    selectedTeamId,
    selectedEndpoint,
    isEndpointActive,
    setSelectedTeamDetails
  ])

  if (!selectedTeamId || !isEndpointActive) {
    return null
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="mb-2 w-full text-xs font-medium uppercase text-primary">
        Team Members
      </div>

      {isLoading ? (
        <div className="flex w-full flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-xl" />
          ))}
        </div>
      ) : selectedTeamDetails?.members &&
        selectedTeamDetails.members.length > 0 ? (
        <div className="flex w-full flex-col gap-2 relative">
          <AnimatePresence>
            {selectedTeamDetails.members.map((member, index) => (
              <TeamMemberItem
                key={`${member.agent_id || member.team_id}-${index}`}
                member={member}
                depth={0}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex h-9 w-full items-center justify-center rounded-xl border border-primary/15 bg-accent p-3 text-xs font-medium uppercase text-muted">
          No Members Found
        </div>
      )}
    </motion.div>
  )
}
