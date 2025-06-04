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
      <DialogContent className="max-h-[80vh] max-w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Tool Call: {toolCall.tool_name}
          </DialogTitle>
          <DialogDescription>
            ID: {toolCall.tool_call_id || 'N/A'} • Time:{' '}
            {toolCall.metrics?.time
              ? `${(toolCall.metrics.time / 1000).toFixed(2)}s`
              : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-md mb-2 font-semibold">Parameters</h3>
            <div className="overflow-x-auto rounded-md bg-background-secondary p-3">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(toolCall.tool_args, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-md mb-2 font-semibold">Response</h3>
            <div
              className={cn(
                'overflow-x-auto rounded-md bg-background-secondary p-3',
                toolCall.tool_call_error ? 'border-l-2 border-destructive' : ''
              )}
            >
              <pre
                className={cn(
                  'whitespace-pre-wrap break-words text-sm',
                  toolCall.tool_call_error ? 'text-destructive' : ''
                )}
              >
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
