import React from 'react'
import { usePlaygroundStore } from '@/store'
import { ToolCall } from '@/types/playground'
import Tooltip from '@/components/ui/tooltip'
import Icon from '@/components/ui/icon'
import ToolCallModal from './ToolCallModal'

const ActiveToolCallComponent: React.FC<{ toolCall: ToolCall }> = ({
  toolCall
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div
        className="animate-pulse cursor-pointer rounded-full bg-accent/70 px-2 py-1.5 text-xs transition-colors hover:bg-accent/80"
        onClick={handleClick}
        title={`${toolCall.tool_name}${toolCall.agent_name ? ` (${toolCall.agent_name})` : ''} - Click to view details`}
      >
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-primary/20"></span>
          <div className="flex flex-col">
            <p className="font-dmmono uppercase text-primary/80">
              {toolCall.tool_name}
            </p>
            {toolCall.agent_name && (
              <p className="text-xs text-primary/60">
                {toolCall.agent_name}
              </p>
            )}
          </div>
        </div>
      </div>
      <ToolCallModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        toolCall={toolCall}
      />
    </>
  )
}

const ActiveToolCalls: React.FC = () => {
  const activeToolCalls = usePlaygroundStore((state) => state.activeToolCalls)
  const toolCallsArray = Object.values(activeToolCalls)

  if (toolCallsArray.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <Tooltip
        delayDuration={0}
        content={<p className="text-accent">Active Tool Calls</p>}
        side="top"
      >
        <Icon
          type="hammer"
          className="rounded-lg bg-background-secondary p-1"
          size="sm"
          color="secondary"
        />
      </Tooltip>

      <div className="flex flex-col gap-3">
        {(() => {
          // Group active tool calls by agent
          const groupedToolCalls = toolCallsArray.reduce((acc, toolCall) => {
            const agentKey = toolCall.agent_name || toolCall.agent_id || 'coordinator'
            if (!acc[agentKey]) {
              acc[agentKey] = []
            }
            acc[agentKey].push(toolCall)
            return acc
          }, {} as Record<string, typeof toolCallsArray>)

          return Object.entries(groupedToolCalls).map(([agentKey, toolCalls]) => (
            <div key={agentKey} className="flex flex-col gap-2">
              {toolCalls.length > 1 && (
                <p className="animate-pulse text-xs font-medium uppercase text-primary/60">
                  {agentKey} ({toolCalls.length} active)
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {toolCalls.map((toolCall) => (
                  <ActiveToolCallComponent
                    key={
                      toolCall.tool_call_id ||
                      `${toolCall.tool_name}-${toolCall.created_at}`
                    }
                    toolCall={toolCall}
                  />
                ))}
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

export default ActiveToolCalls
