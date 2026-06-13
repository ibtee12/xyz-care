"use client"

import * as React from "react"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={`peer size-4 shrink-0 rounded-md border border-gray-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
          ref={ref}
          data-state={props.checked ? "checked" : "unchecked"}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <Check className="absolute size-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 transition-opacity" />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
