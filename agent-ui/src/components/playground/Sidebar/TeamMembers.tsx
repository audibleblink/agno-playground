'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { usePlaygroundStore } from '@/store'
import { getPlaygroundTeamAPI } from '@/api/playground'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'

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
        <div className="flex w-full flex-col gap-2">
          <AnimatePresence>
            {selectedTeamDetails.members.map((member, index) => (
              <motion.div
                key={`${member.agent_id || member.team_id}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primaryAccent p-3 text-xs font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: 'easeInOut'
                }}
              >
                <Icon
                  type={member.team_id ? 'user' : 'user'}
                  size="xs"
                  className={member.team_id ? 'text-blue-400' : 'text-primary'}
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-xs font-medium uppercase text-white">
                    {member.name}
                    {member.team_id && (
                      <span className="ml-1 text-xs text-muted">(Team)</span>
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
                  {member.members && member.members.length > 0 && (
                    <div className="mt-1 text-xs text-muted">
                      {member.members.length} member
                      {member.members.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
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
