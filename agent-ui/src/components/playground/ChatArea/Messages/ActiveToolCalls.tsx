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
        title="Click to view details"
      >
        <div className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-primary/20"></span>
          <p className="font-dmmono uppercase text-primary/80">
            {toolCall.tool_name}
          </p>
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

      <div className="flex flex-wrap gap-2">
        {toolCallsArray.map((toolCall) => (
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
  )
}

export default ActiveToolCalls
