import React from 'react'

interface MonitoringDetailFooterProps {
  count: number
}

export const MonitoringDetailFooter: React.FC<MonitoringDetailFooterProps> = ({ count }) => {
  return (
    <footer className="fixed bottom-0 w-full bg-black border-t border-white/10 px-6 py-2 flex justify-between items-center text-[9px] font-bold uppercase text-neutral-500 z-50">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-emerald-600" /> <span>&lt;50ms</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-emerald-400" /> <span>&lt;150ms</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-amber-500" /> <span>&gt;150ms</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 bg-red-600" /> <span>Offline</span>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">Streams: {count}</div>
    </footer>
  )
}
