'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import Icon from './icon'

export interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onCheckedChange, disabled = false, className, size = 'md', label }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          'border border-accent bg-primaryAccent hover:border-primary/50 rounded-xl',
          // Match the submit button size: icon size (h-9 w-9) + p-5 padding = 36px + 40px = 76px
          'h-[42px] w-[42px]',
          className
        )}
      >
        <Icon
          type={checked ? 'toggle-on' : 'toggle-off'}
          size="md"
          className={cn(
            'transition-all duration-200',
            checked ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </button>
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }
