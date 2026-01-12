import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerAction,
}) => (
  <div
    className={cn(
      'bg-neutral-900/40 border border-white/10 p-6 space-y-4 font-mono flex flex-col',
      className
    )}
  >
    <div className="flex justify-between items-start border-b border-white/5 pb-4 shrink-0">
      <div className="flex gap-4">
        {Icon && (
          <div className="p-2 bg-white/5 border border-white/10 shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title}</h3>
          {description && (
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
    </div>
    <div className="w-full flex-1 min-h-0">{children}</div>
  </div>
)
