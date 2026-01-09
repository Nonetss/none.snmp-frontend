import React, { useEffect, useState, useMemo, useCallback } from 'react'
import axios from 'axios'
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip as ChartTooltip } from 'recharts'
import {
  RefreshCcw,
  Shield,
  Zap,
  ChevronLeft,
  Search,
  ExternalLink,
  LayoutGrid,
  LineChart as LineChartIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Filter as FilterIcon,
} from 'lucide-react'
import type { MonitoringStatusResponse } from './types'

interface Props {
  ruleId: number
}

/**
 * MonitoringStream component
 * Renders telemetry for a single Device + Port pair.
 * Optimized for high-density display.
 */
const MonitoringStream: React.FC<{
  deviceName: string
  ipv4: string
  deviceId: number
  port: number
  data: any[]
  initialView: 'matrix' | 'charts'
}> = ({ deviceName, ipv4, deviceId, port, data, initialView }) => {
  const [view, setView] = useState<'matrix' | 'charts'>(initialView)

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  // Process data for chart
  const streamChartData = useMemo(() => {
    return data.map((p) => ({
      ...p,
      // Use real responseTime. If missing, it will be undefined/null which is fine for Recharts.
      latency: p.responseTime,
      timeLabel: new Date(p.checkTime).toLocaleTimeString(),
    }))
  }, [data])

  const getCellColor = (status: boolean, latency?: number | null) => {
    if (!status) return 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]'
    if (!latency || latency < 50) return 'bg-emerald-500'
    if (latency < 150) return 'bg-amber-500'
    return 'bg-orange-600'
  }

  const lastStatus = data[data.length - 1]
  const isUp = lastStatus?.status

  return (
    <div className="border border-white/5 bg-neutral-900/10 group/row mb-1">
      <div className="px-4 py-2 flex flex-col xl:flex-row xl:items-center gap-4 hover:bg-white/[0.02] transition-colors">
        {/* Stream Info (Identity + Compact Switcher) */}
        <div className="w-72 shrink-0 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[11px] font-black uppercase text-white truncate"
                title={deviceName}
              >
                {deviceName}
              </span>
              <a
                href={`/devices/${deviceId}`}
                className="opacity-0 group-hover/row:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-3 h-3 text-neutral-600 hover:text-white" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
              />
              <span>{ipv4}</span>
              <span className="text-neutral-700">:</span>
              <span className="text-neutral-400 font-bold">{port}</span>
            </div>
          </div>

          {/* Inline Tab Switcher */}
          <div className="flex bg-black border border-white/10 overflow-hidden shrink-0">
            <button
              onClick={() => setView('matrix')}
              className={`p-1.5 transition-all ${view === 'matrix' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              title="Switch to Matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('charts')}
              className={`p-1.5 transition-all ${view === 'charts' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              title="Switch to Chart"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visualization Area - Fixed Height 20px (h-5) */}
        <div className="flex-1 flex items-center h-5 overflow-hidden">
          {view === 'matrix' ? (
            <div className="flex flex-wrap gap-0.5 items-center">
              {data.map((point, idx) => (
                <div
                  key={idx}
                  title={`${deviceName}:${port}\nTime: ${new Date(point.checkTime).toLocaleString()}\nLatency: ${point.status ? (point.responseTime || 'N/A') + 'ms' : 'DOWN'}`}
                  className={`w-1.5 h-5 ${getCellColor(point.status, point.responseTime)} cursor-help hover:scale-125 transition-all rounded-[px]`}
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full min-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streamChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${deviceId}-${port}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isUp ? '#10b981' : '#ef4444'}
                        stopOpacity={0.3}
                      />
                      <stop offset="95%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* Invisible YAxis to help Recharts scale but keep it compact */}
                  <YAxis hide domain={['auto', 'auto']} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      border: '1px solid #333',
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      padding: '4px 8px',
                    }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ color: '#fff', padding: 0 }}
                    formatter={(value: any) => [`${value}ms`, 'Latency']}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke={isUp ? '#10b981' : '#ef4444'}
                    fill={`url(#grad-${deviceId}-${port})`}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const MonitoringDetailView: React.FC<Props> = ({ ruleId }) => {
  const [data, setData] = useState<MonitoringStatusResponse | null>(null)
  const [deviceList, setDeviceList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalView, setGlobalView] = useState<'matrix' | 'charts'>('matrix')

  const [filters, setFilters] = useState({
    timeRange: '24h' as '1h' | '6h' | '24h' | '7d',
    search: '',
    statusFilter: 'all' as 'all' | 'up' | 'down',
  })

  // --- Initial Setup ---
  useEffect(() => {
    axios
      .get('/api/v0/search/device/list')
      .then((res) => {
        const flat = (res.data || []).flatMap((s: any) => s.devices || [])
        setDeviceList(flat)
      })
      .catch(console.error)
  }, [])

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const from = new Date()
      const offsets = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 }
      from.setHours(now.getHours() - offsets[filters.timeRange])

      const { data } = await axios.get(`/api/v0/monitor/status/${ruleId}`, {
        params: { from: from.toISOString(), to: now.toISOString() },
      })
      setData(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'TELEMETRY_LINK_FAILURE')
    } finally {
      setLoading(false)
    }
  }, [ruleId, filters.timeRange])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  const deviceMap = useMemo(() => {
    const map = new Map<number, any>()
    deviceList.forEach((d) => map.set(d.id, d))
    return map
  }, [deviceList])

  const getDeviceInfo = (id: number) => {
    const d = deviceMap.get(id)
    if (d) return { name: d.name || d.sysName || 'Node_' + id, ipv4: d.ipv4 }
    const ruleDev = data?.rule?.deviceGroup?.devices?.find(
      (rd: any) => (rd.id || rd.deviceId) === id
    )
    return {
      name: ruleDev?.name || ruleDev?.sysName || 'Node_' + id,
      ipv4: ruleDev?.ipv4 || '0.0.0.0',
    }
  }

  const processedStreams = useMemo(() => {
    if (!data) return []
    const query = filters.search.toLowerCase()
    const streams: any[] = []

    data.groupedData.forEach((group) => {
      const info = getDeviceInfo(group.deviceId)
      const matchesSearch =
        info.name.toLowerCase().includes(query) ||
        info.ipv4.includes(query) ||
        group.deviceId.toString().includes(query)

      if (!matchesSearch) return

      group.deviceDataPort.forEach((port) => {
        const lastStatus = port.statusData[port.statusData.length - 1]?.status
        if (filters.statusFilter === 'up' && !lastStatus) return
        if (filters.statusFilter === 'down' && lastStatus) return

        streams.push({
          deviceId: group.deviceId,
          deviceName: info.name,
          ipv4: info.ipv4,
          port: port.port,
          statusData: port.statusData,
        })
      })
    })

    return streams.sort((a, b) => a.deviceName.localeCompare(b.deviceName))
  }, [data, filters.search, filters.statusFilter, deviceMap])

  const stats = useMemo(() => {
    if (!data) return null
    let total = 0,
      up = 0,
      latencies: number[] = []
    processedStreams.forEach((s) => {
      s.statusData.forEach((p: any) => {
        total++
        if (p.status) {
          up++
          if (p.responseTime) latencies.push(p.responseTime)
        }
      })
    })
    return {
      uptime: total > 0 ? (up / total) * 100 : 0,
      avgLat: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      streams: processedStreams.length,
    }
  }, [processedStreams, data])

  if (loading && !data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black font-mono">
        <RefreshCcw className="w-10 h-10 animate-spin text-white mb-6 opacity-20" />
        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 font-black">
          Connecting_To_Telemetry_Backplane...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black p-12 font-mono text-white text-center">
        <div className="border border-red-500/20 bg-red-500/5 p-12 flex flex-col items-center gap-6 max-w-md">
          <Shield className="w-12 h-12 text-red-500" />
          <span className="text-xs font-black uppercase tracking-widest text-red-500">{error}</span>
          <a
            href="/monitoring"
            className="px-6 py-2 border border-white/20 text-[10px] uppercase font-bold hover:bg-white hover:text-black transition-all"
          >
            Emergency_Exit
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6 sm:p-10 space-y-8 pb-32">
      {/* 1. System Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="flex items-center gap-6">
          <a
            href="/monitoring"
            className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-white" />
              <h1 className="text-3xl font-black uppercase tracking-tighter">{data.rule.name}</h1>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
              <span>RULE_ID: #{ruleId}</span>
              <div className="w-1 h-1 bg-neutral-800 rounded-full" />
              <span>FREQ: {data.rule.cronExpression}</span>
            </div>
          </div>
        </div>

        {/* 2. Unified Filtering/Control Backplane */}
        <div className="flex flex-wrap items-center gap-3 bg-neutral-900/40 p-3 border border-white/5 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              type="text"
              placeholder="FILTER_BY_NAME_IP_ID..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="bg-black border border-white/10 px-10 py-2.5 text-[10px] font-black uppercase focus:outline-none focus:border-white/30 w-72 transition-all"
            />
          </div>

          {/* Global State Override */}
          <div className="flex bg-black border border-white/10 mr-2 overflow-hidden">
            <button
              onClick={() => setGlobalView('matrix')}
              className={`p-2.5 transition-all ${globalView === 'matrix' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              title="Override: All Matrix"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGlobalView('charts')}
              className={`p-2.5 transition-all ${globalView === 'charts' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              title="Override: All Charts"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-black border border-white/10 overflow-hidden">
            {(['all', 'up', 'down'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, statusFilter: s }))}
                className={`px-4 py-2 text-[9px] font-black uppercase transition-all flex items-center gap-2 ${filters.statusFilter === s ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                {s === 'all' ? (
                  <FilterIcon className="w-3.5 h-3.5" />
                ) : s === 'up' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">{s}</span>
              </button>
            ))}
          </div>

          <select
            value={filters.timeRange}
            onChange={(e) => setFilters((f) => ({ ...f, timeRange: e.target.value as any }))}
            className="bg-black border border-white/10 px-4 py-2 text-[10px] font-black uppercase focus:outline-none appearance-none pr-8 cursor-pointer"
          >
            <option value="1h">LAST_1H</option>
            <option value="6h">LAST_6H</option>
            <option value="24h">LAST_24H</option>
            <option value="7d">LAST_7D</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2.5 border border-white/10 hover:bg-white hover:text-black"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Aggregate Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-white/10 p-6 bg-neutral-900/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
              SLA_Availability
            </span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-4xl font-black">{stats?.uptime.toFixed(3)}%</div>
        </div>
        <div className="border border-white/10 p-6 bg-neutral-900/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
              Avg_Packet_Latency
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-4xl font-black">
            {stats?.avgLat.toFixed(1)}
            <span className="text-xs text-neutral-600 ml-1 font-bold">MS</span>
          </div>
        </div>
        <div className="border border-white/10 p-6 bg-neutral-900/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">
              Telemetry_Contexts
            </span>
            <Clock className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-4xl font-black">{stats?.streams}</div>
        </div>
      </div>

      {/* 4. Stream Matrix/Analytic List */}
      <div className="space-y-1 animate-in fade-in duration-500">
        {processedStreams.map((stream, idx) => (
          <MonitoringStream
            key={`${stream.deviceId}-${stream.port}-${idx}`}
            deviceName={stream.deviceName}
            ipv4={stream.ipv4}
            deviceId={stream.deviceId}
            port={stream.port}
            data={stream.statusData}
            initialView={globalView}
          />
        ))}

        {processedStreams.length === 0 && (
          <div className="py-40 text-center border border-dashed border-white/5 opacity-30">
            <span className="text-[10px] uppercase font-black tracking-[0.5em]">
              Inventory_Search_Yielded_No_Results
            </span>
          </div>
        )}
      </div>

      {/* 5. Visualization Legend */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-black border border-white/10 px-8 py-4 z-40 shadow-2xl rounded-sm">
        <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-widest text-neutral-500">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500" /> <span>Stable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-amber-500" /> <span>Delayed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-orange-600" /> <span>Degraded</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />{' '}
            <span>Down</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonitoringDetailView
