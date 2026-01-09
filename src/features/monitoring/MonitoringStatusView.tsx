import { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCcw, Shield, Zap, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react'
import type { MonitoringStatusResponse, MonitoringStatusPoint } from './types'

interface Props {
  autoRefresh: boolean
  setAutoRefresh: (val: boolean) => void
}

const getHealthStats = (history: MonitoringStatusPoint[]) => {
  if (!history || history.length === 0) return { percent: 0, avgLat: 0, color: 'hsl(0, 0%, 20%)' }

  const limit = 100
  const relevant = history.slice(-limit)
  if (relevant.length === 0) return { percent: 0, avgLat: 0, color: 'hsl(0, 0%, 20%)' }

  const upChecks = relevant.filter((s) => s.status)
  const upCount = upChecks.length
  const total = relevant.length
  const uptimeRatio = upCount / total
  const percent = Math.round(uptimeRatio * 100)

  // Calculate Average Latency for successful pings
  const avgLat =
    upCount > 0
      ? Math.round(upChecks.reduce((acc, s) => acc + (s.responseTime || 0), 0) / upCount)
      : 0

  /**
   * PERFORMANCE HUE (Latency-based)
   * < 50ms  -> 120 (Pure Green)
   * 250ms+  -> 60  (Yellow/Amber)
   */
  const latencyHue = Math.max(60, 120 - Math.max(0, (avgLat - 50) * 0.35))

  /**
   * FINAL HUE (Availability-based)
   * We multiply the performance hue by uptime ratio to pull it towards 0 (Red)
   * as availability drops.
   */
  const finalHue = Math.round(uptimeRatio * latencyHue)

  return {
    percent,
    avgLat,
    color: `hsl(${finalHue}, 80%, 45%)`,
  }
}

const MonitoringStatusView: React.FC<Props> = ({ autoRefresh, setAutoRefresh }) => {
  const [data, setData] = useState<MonitoringStatusResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRules, setExpandedRules] = useState<Record<number, boolean>>({})

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/v0/monitor/status')
      setData(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    let interval: any
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000) // Refresh every 30s
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const toggleRule = (id: number) => {
    setExpandedRules((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }))
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          Synchronizing.Telemetry()
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...data]
          .sort((a, b) => a.rule.id - b.rule.id)
          .map((item) => {
            const totalCount = item.groupedData.reduce((acc, g) => acc + g.deviceDataPort.length, 0)
            let sizeClass = 'w-5 h-5'
            if (totalCount > 1000) sizeClass = 'w-1.5 h-1.5'
            else if (totalCount > 500) sizeClass = 'w-2 h-2'
            else if (totalCount > 200) sizeClass = 'w-3 h-3'
            else if (totalCount > 100) sizeClass = 'w-4 h-4'

            return (
              <div
                key={item.rule.id}
                className="border border-white/10 bg-neutral-900/10 overflow-hidden group flex flex-col"
              >
                <div className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all text-left">
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => toggleRule(item.rule.id)}
                  >
                    <Shield className="w-4 h-4 text-neutral-400" />
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest">
                        {item.rule.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {item.rule.cronExpression}
                        </span>
                        <span className="text-[8px] text-neutral-600 font-bold uppercase">
                          Last:{' '}
                          {item.rule.lastRun
                            ? new Date(item.rule.lastRun).toLocaleTimeString()
                            : 'N/A'}
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
                      <span className="text-[9px] font-black uppercase tracking-tighter">
                        Details
                      </span>
                    </a>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
                        Targets: {totalCount}
                      </span>
                    </div>
                    {(expandedRules[item.rule.id] ?? true) ? (
                      <ChevronUp className="w-4 h-4 text-neutral-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-600" />
                    )}
                  </div>
                </div>

                {(expandedRules[item.rule.id] ?? true) && (
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
                      {item.groupedData.flatMap((group) =>
                        group.deviceDataPort.map((port) => {
                          const device = item.rule.deviceGroup?.devices?.find(
                            (d: any) => (d.id || d.deviceId) === group.deviceId
                          )
                          const stats = getHealthStats(port.statusData)
                          const deviceName =
                            device?.name ||
                            device?.sysName ||
                            device?.ipv4 ||
                            `Dev ${group.deviceId}`
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
          })}

        {data.length === 0 && !loading && (
          <div className="p-20 text-center border border-dashed border-white/10 bg-neutral-900/5 col-span-1 xl:col-span-2">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <BarChart2 className="w-12 h-12" />
              <span className="text-[10px] uppercase tracking-[0.5em]">
                No_Status_Data_Available
              </span>
              <p className="text-[8px] max-w-xs mx-auto text-neutral-500">
                Ensure monitoring rules are active and the daemon is executing checks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonitoringStatusView
