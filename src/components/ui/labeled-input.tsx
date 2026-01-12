import * as React from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, id, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label
          htmlFor={id}
          className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter"
        >
          {label}
        </label>
        <Input id={id} ref={ref} className={className} {...props} />
      </div>
    )
  }
)
LabeledInput.displayName = 'LabeledInput'
