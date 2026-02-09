'use client'

import { useEffect } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { usePlaygroundStore } from '@/store'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import useChatActions from '@/hooks/useChatActions'

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

  // Sync selected agent state when agentId or agents list changes
  useEffect(() => {
    if (!agentId || agents.length === 0) return

    const agent = agents.find((a) => a.value === agentId)
    if (!agent) {
      // Selected agent no longer exists, default to first
      setAgentId(agents[0].value)
      return
    }

    setSelectedModel(agent.model.provider || '')
    setHasStorage(!!agent.storage)
    setSelectedEntityType('agent')
    if (agent.model.provider) focusChatInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, agents, setSelectedModel])

  const handleValueChange = (value: string) => {
    // Toggle behavior: clicking same value deselects
    const newAgentId = value === agentId ? null : value
    const selected = agents.find((a) => a.value === newAgentId)

    // Update all related state
    setSelectedModel(selected?.model.provider || '')
    setHasStorage(!!selected?.storage)
    setSelectedTeamId(null)
    setSelectedEntityType(newAgentId ? 'agent' : null)
    setAgentId(newAgentId)
    setTeamId(null)
    setMessages([])
    setSessionId(null)

    if (selected?.model.provider) focusChatInput()
  }

  return (
    <Select value={agentId || ''} onValueChange={handleValueChange}>
      <SelectTrigger className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase">
        <SelectValue placeholder="Select Agent" />
      </SelectTrigger>
      <SelectContent className="border-none bg-primaryAccent font-dmmono shadow-lg">
        {agents.length === 0 ? (
          <SelectItem
            value="no-agents"
            className="cursor-not-allowed select-none text-center"
          >
            No agents found
          </SelectItem>
        ) : (
          agents.map((agent) => (
            <SelectItem
              key={agent.value}
              value={agent.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 text-xs font-medium uppercase">
                <Icon type="agent" size="xs" />
                {agent.label}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
