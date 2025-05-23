import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { ToolCall } from '@/types/playground'
import { cn } from '@/lib/utils'

interface ToolCallModalProps {
  isOpen: boolean
  onClose: () => void
  toolCall: ToolCall | null
}

const ToolCallModal: React.FC<ToolCallModalProps> = ({
  isOpen,
  onClose,
  toolCall
}) => {
  if (!toolCall) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Tool Call: {toolCall.tool_name}
          </DialogTitle>
          <DialogDescription>
            ID: {toolCall.tool_call_id || 'N/A'} • 
            Time: {toolCall.metrics?.time ? `${(toolCall.metrics.time / 1000).toFixed(2)}s` : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2">Parameters</h3>
            <div className="bg-background-secondary rounded-md p-3 overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(toolCall.tool_args, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">Response</h3>
            <div className={cn(
              "bg-background-secondary rounded-md p-3 overflow-x-auto",
              toolCall.tool_call_error ? "border-l-2 border-destructive" : ""
            )}>
              <pre className={cn(
                "text-sm whitespace-pre-wrap break-words",
                toolCall.tool_call_error ? "text-destructive" : ""
              )}>
                {toolCall.content || 'No response content'}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ToolCallModal
