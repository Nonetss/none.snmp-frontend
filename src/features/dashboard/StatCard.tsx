import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: React.ReactNode
  icon: LucideIcon
  subtext?: React.ReactNode
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtext }) => (
  <div className="bg-neutral-900/40 border border-white/10 p-5 space-y-3 hover:border-white/30 transition-all group">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-white/5 border border-white/10 group-hover:border-white/20">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
        Live.Feed
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-white tracking-tighter">{value}</div>
      <div className="text-[11px] text-neutral-300 uppercase font-bold tracking-[0.2em]">
        {title}
      </div>
    </div>
    {subtext && (
      <div className="text-[10px] text-neutral-400 border-t border-white/5 pt-2">{subtext}</div>
    )}
  </div>
)
