import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  Activity,
  RefreshCcw,
  Shield,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart2,
} from 'lucide-react'
import type { MonitoringStatusResponse } from './types'

interface Props {
  autoRefresh: boolean
  setAutoRefresh: (val: boolean) => void
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

  // Pre-process data for a specific rule combining all ports
  const getRuleChartData = (item: MonitoringStatusResponse) => {
    // Find the maximum number of history points among all devices/ports
    let maxPoints = 0
    item.groupedData.forEach((group) => {
      group.deviceDataPort.forEach((port) => {
        if (port.statusData.length > maxPoints) maxPoints = port.statusData.length
      })
    })

    // Create an array of that size
    return Array.from({ length: maxPoints }).map((_, idx) => {
      const point: any = { index: idx }
      let timeSet = false

      item.groupedData.forEach((group) => {
        // We don't have device names in groupedData, we might need to get them from rule.deviceGroup
        const device = item.rule.deviceGroup?.devices?.find(
          (d: any) => (d.id || d.deviceId) === group.deviceId
        )
        const deviceName =
          device?.name || device?.sysName || device?.ipv4 || `Dev ${group.deviceId}`

        group.deviceDataPort.forEach((port) => {
          const historyPoint = port.statusData[idx]

          if (historyPoint) {
            point[`${deviceName}_${port.port}_latency`] = historyPoint.status
              ? historyPoint.responseTime || 1
              : null
            if (!timeSet) {
              point.time = new Date(historyPoint.checkTime).toLocaleTimeString()
              timeSet = true
            }
          }
        })
      })
      return point
    })
  }

  const COLORS = [
    '#ffffff', // White
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ]

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
        {data.map((item) => (
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
                  <h3 className="text-xs font-black uppercase tracking-widest">{item.rule.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-neutral-500 font-mono">
                      {item.rule.cronExpression}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">
                      Last:{' '}
                      {item.rule.lastRun ? new Date(item.rule.lastRun).toLocaleTimeString() : 'N/A'}
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
                    Deep.Analysis
                  </span>
                </a>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
                    Monitoring{' '}
                    {item.groupedData.reduce((acc, g) => acc + g.deviceDataPort.length, 0)} Targets
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
              <div className="p-6 space-y-8 animate-in slide-in-from-top-2 duration-300 flex-1 flex flex-col">
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Consolidated Metrics
                        <span className="ml-2 text-neutral-600 font-bold">
                          ({item.rule.portGroup?.items?.map((p) => `:${p.port}`).join(', ')})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getRuleChartData(item)}>
                        <defs>
                          {item.groupedData.flatMap((group, gIdx) =>
                            group.deviceDataPort.map((port, pIdx) => {
                              const colorIdx = (gIdx * 3 + pIdx) % COLORS.length
                              return (
                                <linearGradient
                                  key={`${group.deviceId}-${port.port}`}
                                  id={`grad-${group.deviceId}-${port.port}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={COLORS[colorIdx]}
                                    stopOpacity={0.1}
                                  />
                                  <stop offset="95%" stopColor={COLORS[colorIdx]} stopOpacity={0} />
                                </linearGradient>
                              )
                            })
                          )}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis
                          dataKey="index"
                          stroke="#404040"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                          tick={false}
                        />
                        <YAxis
                          stroke="#404040"
                          fontSize={8}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}ms`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#000',
                            border: '1px solid #333',
                            fontSize: '9px',
                            fontFamily: 'monospace',
                          }}
                          itemStyle={{ padding: '1px 0' }}
                          labelFormatter={(val, items) => {
                            if (items && items.length > 0) {
                              return items[0].payload.time
                            }
                            return val
                          }}
                          isAnimationActive={false}
                          cursor={{ stroke: '#ffffff', strokeWidth: 0.5, strokeDasharray: '4 4' }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="circle"
                          iconSize={4}
                          wrapperStyle={{
                            fontSize: '8px',
                            textTransform: 'uppercase',
                            paddingBottom: '10px',
                            fontFamily: 'monospace',
                          }}
                        />
                        {item.groupedData.flatMap((group, gIdx) =>
                          group.deviceDataPort.map((port, pIdx) => {
                            const device = item.rule.deviceGroup?.devices?.find(
                              (d: any) => (d.id || d.deviceId) === group.deviceId
                            )
                            const deviceName =
                              device?.name ||
                              device?.sysName ||
                              device?.ipv4 ||
                              `Dev ${group.deviceId}`
                            const colorIdx = (gIdx * 3 + pIdx) % COLORS.length
                            return (
                              <Area
                                key={`${group.deviceId}-${port.port}`}
                                type="monotone"
                                dataKey={`${deviceName}_${port.port}_latency`}
                                name={`${deviceName}:${port.port}`}
                                stroke={COLORS[colorIdx]}
                                fillOpacity={1}
                                fill={`url(#grad-${group.deviceId}-${port.port})`}
                                strokeWidth={1.5}
                                connectNulls={false}
                                isAnimationActive={false}
                              />
                            )
                          })
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Availability mini-grid or Heatmap */}
                  <div className="mt-auto pt-4">
                    {item.groupedData.reduce((acc, g) => acc + g.deviceDataPort.length, 0) > 20 ? (
                      <div className="flex flex-wrap gap-1 border border-white/5 p-2 bg-black/20">
                        {item.groupedData.flatMap((group) =>
                          group.deviceDataPort.map((port) => {
                            const lastStatus = port.statusData[port.statusData.length - 1]?.status
                            const device = item.rule.deviceGroup?.devices?.find(
                              (d: any) => (d.id || d.deviceId) === group.deviceId
                            )
                            return (
                              <div
                                key={`${group.deviceId}-${port.port}`}
                                title={`${device?.ipv4 || group.deviceId}:${port.port} (${device?.name || ''}) - ${lastStatus ? 'UP' : 'DOWN'}`}
                                className={`w-2.5 h-2.5 border border-white/5 ${lastStatus ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
                              />
                            )
                          })
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {item.groupedData.flatMap((group) =>
                          group.deviceDataPort.map((port) => {
                            const device = item.rule.deviceGroup?.devices?.find(
                              (d: any) => (d.id || d.deviceId) === group.deviceId
                            )
                            const lastStatus = port.statusData[port.statusData.length - 1]?.status
                            return (
                              <div
                                key={`${group.deviceId}-${port.port}`}
                                className={`p-1.5 border ${lastStatus ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} flex flex-col gap-0.5`}
                              >
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[7px] font-black uppercase truncate text-neutral-400">
                                    {device?.name || device?.sysName || `Dev ${group.deviceId}`}
                                  </span>
                                  <span className="text-[7px] font-bold text-neutral-600">
                                    :{port.port}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] font-mono text-neutral-500">
                                    {device?.ipv4 || 'N/A'}
                                  </span>
                                  <div
                                    className={`w-1 h-1 rounded-full ${lastStatus ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
                                  />
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {data.length === 0 && !loading && (
          <div className="p-20 text-center border border-dashed border-white/10 bg-neutral-900/5">
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
