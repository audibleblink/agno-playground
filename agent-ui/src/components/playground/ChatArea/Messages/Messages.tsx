import type { PlaygroundChatMessage } from '@/types/playground'

import { AgentMessage, UserMessage } from './MessageItem'
import Tooltip from '@/components/ui/tooltip'
import { memo, useState } from 'react'
import {
  ToolCallProps,
  ReasoningStepProps,
  ReasoningProps,
  ReferenceData,
  Reference
} from '@/types/playground'
import React, { type FC } from 'react'
import ChatBlankState from './ChatBlankState'
import Icon from '@/components/ui/icon'
import ToolCallModal from './ToolCallModal'
import ActiveToolCalls from './ActiveToolCalls'
import { usePlaygroundStore } from '@/store'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'

interface MessageListProps {
  messages: PlaygroundChatMessage[]
}

interface MessageWrapperProps {
  message: PlaygroundChatMessage
  isLastMessage: boolean
}

interface ReferenceProps {
  references: ReferenceData[]
}

interface ReferenceItemProps {
  reference: Reference
}

const ReferenceItem: FC<ReferenceItemProps> = ({ reference }) => (
  <div className="relative flex h-[63px] w-[190px] cursor-default flex-col justify-between overflow-hidden rounded-md bg-background-secondary p-3 transition-colors hover:bg-background-secondary/80">
    <p className="text-sm font-medium text-primary">{reference.name}</p>
    <p className="truncate text-xs text-primary/40">{reference.content}</p>
  </div>
)

const References: FC<ReferenceProps> = ({ references }) => (
  <div className="flex flex-col gap-4">
    {references.map((referenceData, index) => (
      <div
        key={`${referenceData.query}-${index}`}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-wrap gap-3">
          {referenceData.references.map((reference, refIndex) => (
            <ReferenceItem
              key={`${reference.name}-${reference.meta_data.chunk}-${refIndex}`}
              reference={reference}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const AgentMessageWrapper = ({
  message,
  isLastMessage
}: MessageWrapperProps) => {
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)

  return (
    <div className="flex flex-col gap-y-9">
      {message.extra_data?.reasoning_steps &&
        message.extra_data.reasoning_steps.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">Reasoning</p>}
              side="top"
            >
              <Icon type="reasoning" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase">Reasoning</p>
              <Reasonings reasoning={message.extra_data.reasoning_steps} />
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">References</p>}
              side="top"
            >
              <Icon type="references" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <References references={message.extra_data.references} />
            </div>
          </div>
        )}
      {/* Show active tool calls only for the last message when streaming */}
      {isLastMessage && isStreaming && <ActiveToolCalls />}

      {/* Show completed tool calls */}
      {message.tool_calls && message.tool_calls.length > 0 && (
        <div className="flex items-center gap-3">
          <Tooltip
            delayDuration={0}
            content={<p className="text-accent">Tool Calls</p>}
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
            {message.tool_calls.map((toolCall, index) => (
              <ToolComponent
                key={
                  toolCall.tool_call_id ||
                  `${toolCall.tool_name}-${toolCall.created_at}-${index}`
                }
                tools={toolCall}
              />
            ))}
          </div>
        </div>
      )}
      <AgentMessage message={message} />
    </div>
  )
}
const Reasoning: FC<ReasoningStepProps> = ({ index, step }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-2 text-secondary">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex h-[20px] items-center rounded-md bg-background-secondary p-2">
          <p className="text-xs">STEP {index + 1}</p>
        </div>
        <p className="text-xs font-medium">{step.title}</p>
        <Icon
          type={isExpanded ? 'chevron-down' : 'chevron-up'}
          size="xs"
          className={`text-muted-foreground ${!isExpanded ? 'rotate-180 transform' : ''}`}
        />
      </div>

      {isExpanded && (
        <div className="border-l border-border pl-8">
          {step.reasoning && (
            <div className="mb-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Reasoning:
              </p>
              <div className="rounded-md bg-background-secondary/50 p-3">
                <MarkdownRenderer classname="text-xs prose-p:my-1">
                  {step.reasoning}
                </MarkdownRenderer>
              </div>
            </div>
          )}

          {step.result && (
            <div className="mb-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Result:
              </p>
              <div className="rounded-md bg-background-secondary/50 p-3">
                <MarkdownRenderer classname="text-xs prose-p:my-1">
                  {step.result}
                </MarkdownRenderer>
              </div>
            </div>
          )}

          {step.action && (
            <div className="mb-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Action:
              </p>
              <div className="rounded-md bg-background-secondary/50 p-3">
                <p className="text-xs">{step.action}</p>
              </div>
            </div>
          )}

          {step.next_action && (
            <div className="mb-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Next Action:
              </p>
              <div className="rounded-md bg-background-secondary/50 p-3">
                <p className="text-xs">{step.next_action}</p>
              </div>
            </div>
          )}

          {step.confidence !== undefined && (
            <div className="mb-2">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Confidence:
              </p>
              <div className="rounded-md bg-background-secondary/50 p-3">
                <p className="text-xs">{step.confidence}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
const Reasonings: FC<ReasoningProps> = ({ reasoning }) => (
  <div className="flex flex-col items-start justify-center gap-4">
    {reasoning.map((step, index) => (
      <Reasoning
        key={`${step.title}-${step.action}-${index}`}
        step={step}
        index={index}
      />
    ))}
  </div>
)

const ToolComponent = memo(({ tools }: ToolCallProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div
        className="cursor-pointer rounded-full bg-accent px-2 py-1.5 text-xs transition-colors hover:bg-accent/80"
        onClick={handleClick}
        title="Click to view details"
      >
        <p className="font-dmmono uppercase text-primary/80">
          {tools.tool_name}
        </p>
      </div>
      <ToolCallModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        toolCall={tools}
      />
    </>
  )
})
ToolComponent.displayName = 'ToolComponent'
const Messages = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return <ChatBlankState />
  }

  return (
    <>
      {messages.map((message, index) => {
        const key = `${message.role}-${message.created_at}-${index}`
        const isLastMessage = index === messages.length - 1

        if (message.role === 'agent') {
          return (
            <AgentMessageWrapper
              key={key}
              message={message}
              isLastMessage={isLastMessage}
            />
          )
        }
        return <UserMessage key={key} message={message} />
      })}
    </>
  )
}

export default Messages
