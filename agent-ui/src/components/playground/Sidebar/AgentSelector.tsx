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

export function AgentSelector() {
  const {
    agents,
    setMessages,
    setSelectedModel,
    setHasStorage,
    setSelectedTeamId,
    setSelectedEntityType
  } = usePlaygroundStore()
  const { focusChatInput } = useChatActions()
  const [agentId, setAgentId] = useQueryState('agent', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')
  const [, setTeamId] = useQueryState('team')
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    if (!searchValue) return agents
    return agents.filter(agent =>
      agent.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      agent.model.provider.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [agents, searchValue])

  // Get selected agent details
  const selectedAgent = agents.find(agent => agent.value === agentId)
  
  // Check if current agent is active
  const activeToolCalls = usePlaygroundStore((state) => state.activeToolCalls)
  const isSelectedAgentActive = Object.values(activeToolCalls).some(
    toolCall => toolCall.agent_id === agentId
  )

  // Set the model when the component mounts if an agent is already selected
  useEffect(() => {
    if (agentId && agents.length > 0) {
      const agent = agents.find((agent) => agent.value === agentId)
      if (agent) {
        setSelectedModel(agent.model.provider || '')
        setHasStorage(!!agent.storage)
        setSelectedEntityType('agent')
        if (agent.model.provider) {
          focusChatInput()
        }
      } else {
        setAgentId(agents[0].value)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, agents, setSelectedModel])

  const handleSelect = (value: string) => {
    const newAgentId = value === agentId ? null : value
    const selectedAgent = agents.find((agent) => agent.value === newAgentId)

    setSelectedModel(selectedAgent?.model.provider || '')
    setHasStorage(!!selectedAgent?.storage)
    setSelectedTeamId(null)
    setSelectedEntityType(newAgentId ? 'agent' : null)
    setAgentId(newAgentId)
    setTeamId(null)
    setMessages([])
    setSessionId(null)
    setOpen(false)
    setSearchValue('')
    if (selectedAgent?.model.provider) {
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
          {selectedAgent ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon type="agent" size="xs" />
                {isSelectedAgentActive && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                )}
              </div>
              <span className="truncate">{selectedAgent.label}</span>
              <Icon
                type={getProviderIcon(selectedAgent.model.provider) || 'user'}
                size="xs"
                className="text-muted ml-auto"
              />
            </div>
          ) : (
            <span className="text-muted">Select Agent</span>
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
            placeholder="Search agents..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9 border-none bg-primaryAccent text-xs"
          />
          <CommandList>
            <CommandEmpty>No agents found.</CommandEmpty>
            <CommandGroup>
              {filteredAgents.map((agent, index) => (
                <CommandItem
                  key={`${agent.value}-${index}`}
                  value={agent.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <AgentTooltip 
                    agent={{
                      ...agent,
                      agent_id: agent.value,
                      name: agent.label
                    }} 
                    side="right"
                    delayDuration={1000}
                  >
                    <div className="flex items-center gap-3 text-xs font-medium uppercase w-full">
                      <Icon type="agent" size="xs" />
                      <span className="flex-1">{agent.label}</span>
                      <div className="flex items-center gap-1">
                        <Icon
                          type={getProviderIcon(agent.model.provider) || 'user'}
                          size="xs"
                          className="text-muted"
                        />
                        <span className="text-xs text-muted">
                          {agent.model.provider}
                        </span>
                      </div>
                      <Icon
                        type="check"
                        size="xs"
                        className={cn(
                          "ml-auto",
                          agentId === agent.value ? "opacity-100" : "opacity-0"
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
