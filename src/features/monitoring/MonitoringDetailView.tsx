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
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import {
  Activity,
  RefreshCcw,
  Shield,
  Clock,
  Zap,
  ChevronLeft,
  Calendar,
  Filter,
  AlertCircle,
  Download,
  Search,
} from 'lucide-react'
import type { MonitoringStatusRule } from './types'

interface Props {
  ruleId: number
}

const MonitoringDetailView: React.FC<Props> = ({ ruleId }) => {
  const [data, setData] = useState<MonitoringStatusRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [deviceFilter, setDeviceFilter] = useState<number | null>(null)
  const [portFilter, setPortFilter] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'down'>('all')
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

  const fetchData = async () => {
    setLoading(true)
    try {
      let url = `/api/v0/monitor/status/${ruleId}?`

      const now = new Date()
      let fromDate = new Date()
      if (timeRange === '1h') fromDate.setHours(now.getHours() - 1)
      else if (timeRange === '6h') fromDate.setHours(now.getHours() - 6)
      else if (timeRange === '24h') fromDate.setHours(now.getHours() - 24)
      else if (timeRange === '7d') fromDate.setDate(now.getDate() - 7)

      url += `from=${fromDate.toISOString()}&to=${now.toISOString()}`

      const response = await axios.get(url)
      setData(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch detail telemetry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [ruleId, timeRange])

  // Get unique devices and ports from data for filters
  const availableDevices = useMemo(() => {
    if (!data) return []
    const devices = new Map<number, { id: number; name: string; ipv4: string }>()
    data.ports.forEach((p) => {
      p.devices.forEach((d) => {
        devices.set(d.id, { id: d.id, name: d.name, ipv4: d.ipv4 })
      })
    })
    return Array.from(devices.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [data])

  const availablePorts = useMemo(() => {
    if (!data) return []
    const ports = Array.from(new Set(data.ports.map((p) => p.port)))
    return ports.sort((a, b) => a - b)
  }, [data])

  const filteredData = useMemo(() => {
    if (!data) return null

    return {
      ...data,
      ports: data.ports
        .filter((p) => !portFilter || p.port === portFilter)
        .map((port) => ({
          ...port,
          devices: port.devices.filter((dev) => {
            // Device ID filter
            if (deviceFilter && dev.id !== deviceFilter) return false

            // Status filter (based on last history point)
            if (statusFilter !== 'all') {
              const lastStatus = dev.history[dev.history.length - 1]?.status
              if (statusFilter === 'up' && !lastStatus) return false
              if (statusFilter === 'down' && lastStatus) return false
            }

            return true
          }),
        }))
        .filter((p) => p.devices.length > 0),
    }
  }, [data, deviceFilter, portFilter, statusFilter])

  const chartData = useMemo(() => {
    if (!filteredData) return []

    // Find the maximum number of history points among all devices/ports in filtered data
    let maxPoints = 0
    filteredData.ports.forEach((port) => {
      port.devices.forEach((dev) => {
        if (dev.history.length > maxPoints) maxPoints = dev.history.length
      })
    })

    return Array.from({ length: maxPoints }).map((_, idx) => {
      const point: any = { index: idx }
      let timeSet = false

      filteredData.ports.forEach((port) => {
        port.devices.forEach((dev) => {
          // Access history from oldest to newest
          const historyIdx = dev.history.length - 1 - (maxPoints - 1 - idx)
          const historyPoint = dev.history[historyIdx]

          if (historyPoint) {
            point[`${dev.name}_${port.port}`] = historyPoint.status
              ? historyPoint.responseTime
              : null
            if (!timeSet) {
              const dt = new Date(historyPoint.checkTime)
              point.time = dt.toLocaleString([], { hour: '2-digit', minute: '2-digit' })
              point.fullTime = dt.toLocaleString()
              timeSet = true
            }
          }
        })
      })
      return point
    })
  }, [filteredData])

  const stats = useMemo(() => {
    if (!filteredData) return null
    let totalChecks = 0
    let successfulChecks = 0
    let totalResponseTime = 0
    let maxResponseTime = 0

    filteredData.ports.forEach((p) => {
      p.devices.forEach((d) => {
        d.history.forEach((h) => {
          totalChecks++
          if (h.status) {
            successfulChecks++
            totalResponseTime += h.responseTime || 0
            if ((h.responseTime || 0) > maxResponseTime) maxResponseTime = h.responseTime || 0
          }
        })
      })
    })

    return {
      availability: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
      avgLatency: successfulChecks > 0 ? totalResponseTime / successfulChecks : 0,
      maxLatency: maxResponseTime,
      totalPoints: totalChecks,
    }
  }, [filteredData])

  const COLORS = ['#ffffff', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading && !data)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          Deep_Telemetry_Analysis...
        </span>
      </div>
    )

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/monitoring"
              className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white" />
                <h1 className="text-xl font-black tracking-[0.3em] uppercase">
                  {data?.name || 'Loading Rule...'}
                </h1>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-tighter">
                  Live_Analysis
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 tracking-widest uppercase mt-1">
                Rule ID: {ruleId} • Detailed Performance Analysis & Historical Logs
              </p>
            </div>
          </div>
        </div>
        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white/5 p-4 border border-white/5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-neutral-600 font-black uppercase ml-1">Device:</span>
            <select
              value={deviceFilter || ''}
              onChange={(e) => setDeviceFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold uppercase focus:outline-none focus:border-white/40 appearance-none"
            >
              <option value="">All Devices</option>
              {availableDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.ipv4}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-neutral-600 font-black uppercase ml-1">Port:</span>
            <select
              value={portFilter || ''}
              onChange={(e) => setPortFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold uppercase focus:outline-none focus:border-white/40 appearance-none"
            >
              <option value="">All Ports</option>
              {availablePorts.map((p) => (
                <option key={p} value={p}>
                  Port {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-neutral-600 font-black uppercase ml-1">Status:</span>
            <div className="flex flex-1 p-0.5 bg-black border border-white/10">
              {['all', 'up', 'down'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`flex-1 py-1 text-[8px] font-black uppercase transition-all ${
                    statusFilter === s ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] text-neutral-600 font-black uppercase ml-1">
              Time_Range:
            </span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold uppercase focus:outline-none focus:border-white/40"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 justify-end">
            <button
              onClick={fetchData}
              className="h-[34px] flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase transition-all"
            >
              <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Sync_Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-white/10 p-6 bg-white/[0.02] space-y-2">
          <span className="text-[9px] text-neutral-600 uppercase font-black">Availability</span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${stats && stats.availability > 99 ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              {stats?.availability.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02] space-y-2">
          <span className="text-[9px] text-neutral-600 uppercase font-black">Avg Latency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.avgLatency.toFixed(1)}
              <span className="text-xs text-neutral-600 ml-1">ms</span>
            </span>
          </div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02] space-y-2">
          <span className="text-[9px] text-neutral-600 uppercase font-black">Max Latency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats?.maxLatency}
              <span className="text-xs text-neutral-600 ml-1">ms</span>
            </span>
          </div>
        </div>
        <div className="border border-white/10 p-6 bg-white/[0.02] space-y-2">
          <span className="text-[9px] text-neutral-600 uppercase font-black">Data Points</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{stats?.totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Detailed Chart */}
      <div className="border border-white/10 p-8 bg-neutral-900/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-widest text-white">
              Latency.Time.Series
            </span>
          </div>
          <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">
            Showing {filteredData?.ports.reduce((acc, p) => acc + p.devices.length, 0)} Active
            Streams
          </span>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {filteredData?.ports.flatMap((port, pIdx) =>
                  port.devices.map((dev, dIdx) => {
                    const colorIdx = (pIdx * 3 + dIdx) % COLORS.length
                    return (
                      <linearGradient
                        key={`${dev.id}-${port.port}`}
                        id={`grad-${dev.id}-${port.port}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={COLORS[colorIdx]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS[colorIdx]} stopOpacity={0} />
                      </linearGradient>
                    )
                  })
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="index"
                stroke="#404040"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={false}
              />
              <YAxis
                stroke="#404040"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}ms`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                labelFormatter={(idx) => chartData[idx]?.fullTime || ''}
                itemStyle={{ padding: '1px 0' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  paddingBottom: '30px',
                }}
              />
              {filteredData?.ports.flatMap((port, pIdx) =>
                port.devices.map((dev, dIdx) => {
                  const colorIdx = (pIdx * 3 + dIdx) % COLORS.length
                  return (
                    <Area
                      key={`${dev.id}-${port.port}`}
                      type="monotone"
                      dataKey={`${dev.name}_${port.port}`}
                      name={`${dev.name}:${port.port}`}
                      stroke={COLORS[colorIdx]}
                      fillOpacity={1}
                      fill={`url(#grad-${dev.id}-${port.port})`}
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
      </div>
    </div>
  )
}

export default MonitoringDetailView
