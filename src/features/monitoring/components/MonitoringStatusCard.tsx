import React from 'react'
import { Shield, BarChart2, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import type { MonitoringStatusResponse, MonitoringStatusPoint } from '../types'

interface MonitoringStatusCardProps {
  item: MonitoringStatusResponse
  isExpanded: boolean
  onToggle: (id: number) => void
  getHealthStats: (history: MonitoringStatusPoint[]) => any
}

export const MonitoringStatusCard: React.FC<MonitoringStatusCardProps> = ({
  item,
  isExpanded,
  onToggle,
  getHealthStats,
}) => {
  const totalCount = item.groupedData.reduce((acc, g) => acc + g.deviceDataPort.length, 0)
  let sizeClass = 'w-5 h-5'
  if (totalCount > 1000) sizeClass = 'w-1.5 h-1.5'
  else if (totalCount > 500) sizeClass = 'w-2 h-2'
  else if (totalCount > 200) sizeClass = 'w-3 h-3'
  else if (totalCount > 100) sizeClass = 'w-4 h-4'

  return (
    <div className="border border-white/10 bg-neutral-900/10 overflow-hidden group flex flex-col">
      <div className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all text-left">
        <div
          className="flex items-center gap-4 flex-1 cursor-pointer"
          onClick={() => onToggle(item.rule.id)}
        >
          <Shield className="w-4 h-4 text-neutral-400" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest">{item.rule.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] text-neutral-500 font-mono">
                {item.rule.cronExpression}
              </span>
              <span className="text-[8px] text-neutral-600 font-bold uppercase">
                Last: {item.rule.lastRun ? new Date(item.rule.lastRun).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/monitoring/${item.rule.id}`}
            className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-2"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Details</span>
          </a>
          <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
              Targets: {totalCount}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-600" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Device Health Map (Last 100 Checks)
              </span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="flex flex-wrap gap-1 p-4 bg-black/20 border border-white/5 min-h-[100px] content-start">
            {[...item.groupedData]
              .sort((a, b) => a.deviceId - b.deviceId)
              .flatMap((group) =>
                [...group.deviceDataPort]
                  .sort((a, b) => a.port - b.port)
                  .map((port) => {
                    const device = item.rule.deviceGroup?.devices?.find(
                      (d: any) => (d.id || d.deviceId) === group.deviceId
                    )
                    const stats = getHealthStats(port.statusData)
                    const deviceName =
                      device?.name || device?.sysName || device?.ipv4 || `Dev ${group.deviceId}`
                    const title = `${deviceName}:${port.port}\nAvailability: ${stats.percent}%\nAvg Latency: ${stats.avgLat}ms\n(Based on last 100 checks)`

                    return (
                      <div
                        key={`${group.deviceId}-${port.port}`}
                        title={title}
                        style={{ backgroundColor: stats.color }}
                        className={`${sizeClass} border border-white/10 hover:border-white hover:scale-110 transition-all cursor-help rounded-[1px]`}
                      />
                    )
                  })
              )}
          </div>
        </div>
      )}
    </div>
  )
}
