import React from 'react'
import { ArrowUpRight, Clock, Activity } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { LatencyHistogram } from './LatencyHistogram'

interface AnalyticsViewProps {
  data: any[]
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'NEVER'
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return 'N/A'
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return 'N/A'
  }
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
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  item.deviceStatus?.status === true ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                title={item.deviceStatus?.status === true ? 'Device: UP' : 'Device: DOWN'}
              />
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
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-mono">
                <span>{item.ip}</span>
                <span className="text-neutral-700">|</span>
                <span className="text-neutral-400">PORT:{item.port}</span>
              </div>

              {item.deviceStatus && (
                <div className="flex items-center gap-3 text-[8px] text-neutral-600 font-mono uppercase tracking-tighter">
                  <div className="flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5" />
                    <span>Ping: {formatDate(item.deviceStatus.lastPing)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Up: {formatDate(item.deviceStatus.lastPingUp)}</span>
                  </div>
                </div>
              )}
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
