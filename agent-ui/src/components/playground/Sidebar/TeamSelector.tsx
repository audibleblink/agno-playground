'use client'

import * as React from 'react'
import { useState, useEffect, useMemo } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { usePlaygroundStore } from '@/store'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import useChatActions from '@/hooks/useChatActions'
import { cn } from '@/lib/utils'
import AgentTooltip from '@/components/ui/tooltip/AgentTooltip'

export function TeamSelector() {
  const {
    teams,
    setMessages,
    setSelectedModel,
    setHasStorage,
    setSelectedTeamId,
    setSelectedEntityType
  } = usePlaygroundStore()
  const { focusChatInput } = useChatActions()
  const [teamId, setTeamId] = useQueryState('team', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')
  const [, setAgentId] = useQueryState('agent')
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchValue) return teams
    return teams.filter(team =>
      team.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      team.model.provider.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [teams, searchValue])

  // Get selected team details
  const selectedTeam = teams.find(team => team.value === teamId)
  
  // Check if current team is active
  const activeToolCalls = usePlaygroundStore((state) => state.activeToolCalls)
  const isSelectedTeamActive = Object.values(activeToolCalls).some(
    toolCall => toolCall.agent_id === teamId || toolCall.is_team
  )

  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find((t) => t.value === teamId)
      if (team) {
        setSelectedModel(team.model.provider || '')
        setHasStorage(!!team.storage)
        setSelectedTeamId(team.value)
        setSelectedEntityType('team')
        if (team.model.provider) {
          focusChatInput()
        }
      } else {
        setTeamId(teams[0].value) // Default to first team if selected one not found
      }
    } else if (teams.length > 0 && !teamId) {
      // Optionally select the first team if none is selected in the URL
      // setTeamId(teams[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, teams, setSelectedModel])

  const handleSelect = (value: string) => {
    const newTeam = value === teamId ? null : value
    const selectedTeam = teams.find((team) => team.value === newTeam)

    setSelectedModel(selectedTeam?.model.provider || '')
    setHasStorage(!!selectedTeam?.storage)
    setSelectedTeamId(newTeam)
    setSelectedEntityType(newTeam ? 'team' : null)
    setTeamId(newTeam)
    setAgentId(null) // Clear agent selection
    setMessages([])
    setSessionId(null)
    setOpen(false)
    setSearchValue('')

    if (selectedTeam?.model.provider) {
      focusChatInput()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase hover:bg-primaryAccent/80"
        >
          {selectedTeam ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon type="users" size="xs" />
                {isSelectedTeamActive && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                )}
              </div>
              <span className="truncate">{selectedTeam.label}</span>
              <Icon
                type={getProviderIcon(selectedTeam.model.provider) || 'user'}
                size="xs"
                className="text-muted ml-auto"
              />
            </div>
          ) : (
            <span className="text-muted">Select Team</span>
          )}
          <Icon 
            type={open ? "chevron-up" : "chevron-down"}
            size="xs" 
            className="ml-2 opacity-50" 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none bg-primaryAccent font-dmmono shadow-lg">
        <Command>
          <CommandInput
            placeholder="Search teams..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9 border-none bg-primaryAccent text-xs"
          />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup>
              {filteredTeams.map((team, index) => (
                <CommandItem
                  key={`${team.value}-${index}`}
                  value={team.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <AgentTooltip 
                    agent={{
                      ...team,
                      team_id: team.value,
                      name: team.label
                    }} 
                    side="right"
                    delayDuration={1000}
                  >
                    <div className="flex items-center gap-3 text-xs font-medium uppercase w-full">
                      <Icon type="users" size="xs" />
                      <span className="flex-1">{team.label}</span>
                      <div className="flex items-center gap-1">
                        <Icon
                          type={getProviderIcon(team.model.provider) || 'user'}
                          size="xs"
                          className="text-muted"
                        />
                        <span className="text-xs text-muted">
                          {team.model.provider}
                        </span>
                      </div>
                      <Icon
                        type="check"
                        size="xs"
                        className={cn(
                          "ml-auto",
                          teamId === team.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </AgentTooltip>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
