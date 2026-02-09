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

  // Sync selected team state when teamId or teams list changes
  useEffect(() => {
    if (!teamId || teams.length === 0) return

    const team = teams.find((t) => t.value === teamId)
    if (!team) {
      // Selected team no longer exists, default to first
      setTeamId(teams[0].value)
      return
    }

    setSelectedModel(team.model.provider || '')
    setHasStorage(!!team.storage)
    setSelectedTeamId(team.value)
    setSelectedEntityType('team')
    if (team.model.provider) focusChatInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, teams, setSelectedModel])

  const handleValueChange = (value: string) => {
    // Toggle behavior: clicking same value deselects
    const newTeamId = value === teamId ? null : value
    const selected = teams.find((t) => t.value === newTeamId)

    // Update all related state
    setSelectedModel(selected?.model.provider || '')
    setHasStorage(!!selected?.storage)
    setSelectedTeamId(newTeamId)
    setSelectedEntityType(newTeamId ? 'team' : null)
    setTeamId(newTeamId)
    setAgentId(null)
    setMessages([])
    setSessionId(null)

    if (selected?.model.provider) focusChatInput()
  }

  return (
    <Select value={teamId || ''} onValueChange={handleValueChange}>
      <SelectTrigger className="h-9 w-full rounded-xl border border-primary/15 bg-primaryAccent text-xs font-medium uppercase">
        <SelectValue placeholder="Select Team" />
      </SelectTrigger>
      <SelectContent className="border-none bg-primaryAccent font-dmmono shadow-lg">
        {teams.map((team) => (
          <SelectItem
            key={team.value}
            value={team.value}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 text-xs font-medium uppercase">
              <Icon type="user" size="xs" />
              {team.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
