import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      onChange={(e) => {
        onValueChange?.(e.target.value)
        props.onChange?.(e)
      }}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

// 简化的子组件，直接返回children
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    className={cn("px-2 py-1", className)}
    ref={ref}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

// SelectTrigger 不需要，因为我们使用原生select
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SelectValue = ({ placeholder }: { placeholder?: string }) => <>{placeholder}</>

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
