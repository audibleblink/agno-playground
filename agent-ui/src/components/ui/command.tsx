"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface CommandContextValue {
  search: string
  setSearch: (search: string) => void
  filtered: { [key: string]: number }
  setFiltered: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
}

const CommandContext = React.createContext<CommandContextValue | undefined>(
  undefined
)

const useCommand = () => {
  const context = React.useContext(CommandContext)
  if (!context) {
    throw new Error("useCommand must be used within a Command")
  }
  return context
}

interface CommandProps {
  children?: React.ReactNode
  className?: string
}

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CommandProps
>(({ className, children, ...props }, ref) => {
  const [search, setSearch] = React.useState("")
  const [filtered, setFiltered] = React.useState<{ [key: string]: number }>({})

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
        filtered,
        setFiltered,
      }}
    >
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
})
Command.displayName = "Command"

interface CommandInputProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & CommandInputProps
>(({ className, placeholder, value, onValueChange, ...props }, ref) => {
  const { setSearch } = useCommand()

  const handleValueChange = (newValue: string) => {
    setSearch(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        {...props}
      />
    </div>
  )
})
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  >
    {children}
  </div>
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
))
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
CommandGroup.displayName = "CommandGroup"

interface CommandItemProps {
  value?: string
  onSelect?: (value: string) => void
  children?: React.ReactNode
  className?: string
}

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CommandItemProps
>(({ className, children, value, onSelect, ...props }, ref) => {
  const handleSelect = () => {
    if (value && onSelect) {
      onSelect(value)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      {children}
    </div>
  )
})
CommandItem.displayName = "CommandItem"

const CommandDialog = ({
  children,
  ...props
}: React.ComponentProps<typeof Dialog>) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
}