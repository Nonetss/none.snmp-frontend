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
import type { MonitoringStatusRule } from './types'

const MonitoringStatusView: React.FC = () => {
  const [data, setData] = useState<MonitoringStatusRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
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

  // Pre-process data for a specific rule and port to work with Recharts
  const getChartData = (rule: MonitoringStatusRule, port: number) => {
    const portData = rule.ports.find((p) => p.port === port)
    if (!portData) return []

    // Collect all unique check times to create the X-Axis
    const timePoints = new Set<string>()
    portData.devices.forEach((dev) => {
      dev.history.forEach((h) => timePoints.add(h.checkTime))
    })

    const sortedTimes = Array.from(timePoints).sort()

    return sortedTimes.map((time) => {
      const point: any = { time: new Date(time).toLocaleTimeString() }
      portData.devices.forEach((dev) => {
        const historyPoint = dev.history.find((h) => h.checkTime === time)
        // We use responseTime for the Y axis, or 0 if status is false (or some other logic)
        // If status is false, let's treat it as a spike or high value to indicate "down"
        // Or simply null if we want to show breaks in the line
        point[`${dev.name}_latency`] = historyPoint?.status ? historyPoint.responseTime : null
        point[`${dev.name}_status`] = historyPoint?.status ? 1 : 0
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
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">LIVE.TELEMETRY</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Real-time Response Time & Availability Metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] font-bold uppercase transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                : 'border-white/10 text-neutral-500'
            }`}
          >
            <RefreshCcw className={`w-3 h-3 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
            {autoRefresh ? 'Live_Feed_ON' : 'Live_Feed_OFF'}
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((rule) => (
          <div
            key={rule.id}
            className="border border-white/10 bg-neutral-900/10 overflow-hidden group"
          >
            <button
              onClick={() => toggleRule(rule.id)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <Shield className="w-4 h-4 text-neutral-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">{rule.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-neutral-500 font-mono">
                      {rule.cronExpression}
                    </span>
                    <span className="text-[8px] text-neutral-600 font-bold uppercase">
                      Last: {rule.lastRun ? new Date(rule.lastRun).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 border border-white/5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
                    Monitoring {rule.ports.reduce((acc, p) => acc + p.devices.length, 0)} Nodes
                  </span>
                </div>
                {(expandedRules[rule.id] ?? true) ? (
                  <ChevronUp className="w-4 h-4 text-neutral-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-600" />
                )}
              </div>
            </button>

            {(expandedRules[rule.id] ?? true) && (
              <div className="p-6 space-y-12 animate-in slide-in-from-top-2 duration-300">
                {rule.ports.map((port) => {
                  const chartData = getChartData(rule, port.port)
                  return (
                    <div key={port.portGroupItemId} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            PORT {port.port}
                            <span className="ml-2 text-neutral-600 font-bold">
                              ({port.expectedStatus ? 'EXPECTED_OPEN' : 'EXPECTED_CLOSED'})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 bg-white/40" />
                            <span className="text-[8px] text-neutral-500 font-bold uppercase">
                              Latency (ms)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              {port.devices.map((dev, i) => (
                                <linearGradient
                                  key={dev.id}
                                  id={`grad-${dev.id}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor={COLORS[i % COLORS.length]}
                                    stopOpacity={0.1}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={COLORS[i % COLORS.length]}
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#1f1f1f"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="time"
                              stroke="#404040"
                              fontSize={9}
                              tickLine={false}
                              axisLine={false}
                              minTickGap={30}
                            />
                            <YAxis
                              stroke="#404040"
                              fontSize={9}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(val) => `${val}ms`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#000',
                                border: '1px solid #333',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                              }}
                              itemStyle={{ padding: '2px 0' }}
                            />
                            <Legend
                              verticalAlign="top"
                              align="right"
                              iconType="circle"
                              iconSize={6}
                              wrapperStyle={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                paddingBottom: '20px',
                                fontFamily: 'monospace',
                              }}
                            />
                            {port.devices.map((dev, i) => (
                              <Area
                                key={dev.id}
                                type="monotone"
                                dataKey={`${dev.name}_latency`}
                                name={dev.name || dev.ipv4}
                                stroke={COLORS[i % COLORS.length]}
                                fillOpacity={1}
                                fill={`url(#grad-${dev.id})`}
                                strokeWidth={2}
                                connectNulls={false} // Breaks indicate down
                                isAnimationActive={false}
                              />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Availability mini-grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-4">
                        {port.devices.map((dev) => {
                          const lastStatus = dev.history[dev.history.length - 1]?.status
                          return (
                            <div
                              key={dev.id}
                              className={`p-2 border ${lastStatus ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} flex flex-col gap-1`}
                            >
                              <span className="text-[8px] font-black uppercase truncate text-neutral-400">
                                {dev.name}
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-neutral-500">
                                  {dev.ipv4}
                                </span>
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${lastStatus ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
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
