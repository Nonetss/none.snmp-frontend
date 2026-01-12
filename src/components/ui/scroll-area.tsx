import * as React from 'react'
import { cn } from '@/lib/utils'

export function ScrollArea({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
        className
      )}
    >
      {children}
    </div>
  )
}
