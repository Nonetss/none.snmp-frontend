import React from 'react'

interface HeaderProps {
  currentTime: Date
}

export const Header: React.FC<HeaderProps> = ({ currentTime }) => (
  <div className="flex justify-between items-end border-b border-white/10 pb-6">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-4 bg-white" />
        <h1 className="text-2xl font-bold tracking-tighter uppercase">
          Network.Intelligence-Center
        </h1>
      </div>
      <p className="text-[11px] text-neutral-400 uppercase tracking-[0.4em]">
        Autonomous Monitoring System v0.5.2
      </p>
    </div>
    <div className="text-right">
      <div className="text-xs font-bold text-white mb-1">
        LOCAL_TIME: {currentTime.toLocaleTimeString()}
      </div>
      <div className="text-[10px] text-neutral-400 uppercase tracking-widest">
        System Status: Operational
      </div>
    </div>
  </div>
)
