import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { LatencyHistogram } from './LatencyHistogram'

interface AnalyticsViewProps {
  data: any[]
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-1">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-black uppercase text-neutral-600 border-b border-white/10">
        <div className="col-span-3">Node_Identity</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-1 text-right">Uptime</div>
        <div className="col-span-1 text-right">Avg_Lat</div>
        <div className="col-span-6 pl-4">Latency_Distribution_Log</div>
      </div>

      {data.map((item) => (
        <div
          key={item.key}
          className="grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-900/20 border border-white/5 items-center hover:bg-white/5 transition-colors group"
        >
          <div className="col-span-3 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate" title={item.name}>
                {item.name}
              </span>
              <a
                href={`/devices/${item.id}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowUpRight className="w-3 h-3 text-neutral-500 hover:text-white" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono">
              <span>{item.ip}</span>
              <span className="text-neutral-700">|</span>
              <span className="text-neutral-400">PORT:{item.port}</span>
            </div>
          </div>

          <div className="col-span-1 flex justify-center">
            <StatusBadge isUp={item.isUp} />
          </div>

          <div className="col-span-1 text-right font-mono text-xs text-white">
            {item.uptime.toFixed(1)}%
          </div>
          <div className="col-span-1 text-right font-mono text-xs text-neutral-300">
            {item.avgLat.toFixed(0)}ms
          </div>

          <div className="col-span-6 pl-4 h-8 flex items-center overflow-hidden">
            <LatencyHistogram data={item.history} height={32} />
          </div>
        </div>
      ))}
    </div>
  )
}
