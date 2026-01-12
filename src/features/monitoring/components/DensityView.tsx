import React from 'react'
import { HeatmapRow } from './HeatmapRow'
import { Activity, Clock } from 'lucide-react'

interface DensityViewProps {
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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return 'N/A'
  }
}

export const DensityView: React.FC<DensityViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <div
          key={item.key}
          className="p-4 bg-neutral-900/20 border border-white/5 hover:border-white/20 transition-colors flex flex-col"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.deviceStatus?.status === true ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  title={item.deviceStatus?.status === true ? 'Device: UP' : 'Device: DOWN'}
                />
                <h3 className="text-xs font-bold text-white truncate pr-2" title={item.name}>
                  {item.name}
                </h3>
              </div>
              <div className="flex gap-2 text-[9px] text-neutral-500 font-mono mt-0.5">
                <span>{item.ip}</span>
                <span>:</span>
                <span>{item.port}</span>
              </div>
            </div>
            <div
              title={`Port ${item.port} ${item.isUp ? 'UP' : 'DOWN'}`}
              className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isUp ? 'bg-emerald-500' : 'bg-red-500'} ${item.isUp ? 'animate-pulse' : ''}`}
            />
          </div>

          <div className="flex-1">
            <HeatmapRow data={item.history} />
          </div>

          {item.deviceStatus && (
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] text-neutral-600 font-mono uppercase tracking-tighter">
              <div className="flex items-center gap-1" title="Last Ping Time">
                <Activity className="w-2.5 h-2.5" />
                <span>{formatDate(item.deviceStatus.lastPing)}</span>
              </div>
              <div className="flex items-center gap-1" title="Last Up Time">
                <Clock className="w-2.5 h-2.5" />
                <span>{formatDate(item.deviceStatus.lastPingUp)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
