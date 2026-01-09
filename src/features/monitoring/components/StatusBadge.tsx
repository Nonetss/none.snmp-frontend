import React from 'react'

interface StatusBadgeProps {
  isUp: boolean
  label?: string
  pulse?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isUp, label, pulse = true }) => {
  if (isUp) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
        <div
          className={`w-1.5 h-1.5 bg-emerald-500 rounded-full ${pulse ? 'animate-pulse' : ''}`}
        />
        <span className="text-[9px] font-bold">{label || 'UP'}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded-full">
      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
      <span className="text-[9px] font-bold">{label || 'DOWN'}</span>
    </div>
  )
}
