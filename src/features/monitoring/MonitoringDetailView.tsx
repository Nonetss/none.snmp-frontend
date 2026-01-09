import React, { useEffect, useState, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
  Activity,
  RefreshCcw,
  Shield,
  Zap,
  ChevronLeft,
  Search,
  LayoutGrid,
  List,
  Clock,
  Server,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import type { MonitoringStatusResponse } from './types'

interface Props {
  ruleId: number
}

// --- High Performance Components ---

/**
 * LatencyHistogram
 * Replaces heavy SVG charts with CSS-based bar graphs.
 * Optimized to never overflow the screen.
 */
const LatencyHistogram: React.FC<{ data: any[]; height: number }> = React.memo(
  ({ data, height }) => {
    // Normalize latency for bar height
    const values = data.filter((d) => d.status && d.responseTime != null).map((d) => d.responseTime)
    const maxLat = Math.max(...values, 100)

    return (
      <div className="flex items-end w-full h-full overflow-hidden" style={{ height }}>
        {data.map((point, i) => {
          const latency = point.responseTime ?? 0
          const h = point.status ? Math.min((latency / maxLat) * 100, 100) : 100
          const color = !point.status
            ? 'bg-red-600'
            : latency > 150
              ? 'bg-amber-500'
              : latency > 50
                ? 'bg-emerald-400'
                : 'bg-emerald-600'

          return (
            <div
              key={i}
              title={`${new Date(point.checkTime).toLocaleTimeString()} - ${point.status ? latency + 'ms' : 'DOWN'}`}
              // Removed min-width and gap to prevent overflow.
              // flex-grow allows it to fill space, min-w-0 allows it to shrink below 1px if needed.
              className={`flex-grow h-full min-w-0 ${color} opacity-80 hover:opacity-100 transition-opacity`}
              style={{ height: `${Math.max(h, 15)}%` }}
            />
          )
        })}
      </div>
    )
  }
)

const HeatmapRow: React.FC<{ data: any[] }> = React.memo(({ data }) => (
  <div className="flex flex-wrap gap-[2px]">
    {data.map((point, i) => {
      const latency = point.responseTime ?? 0
      const color = !point.status ? 'bg-red-600' : latency > 150 ? 'bg-amber-500' : 'bg-emerald-600'
      return (
        <div
          key={i}
          title={`${new Date(point.checkTime).toLocaleTimeString()} - ${point.status ? 'UP (' + latency + 'ms)' : 'DOWN'}`}
          className={`w-3 h-3 ${color} rounded-[1px] hover:scale-125 transition-transform`}
        />
      )
    })}
  </div>
))

// --- Main View ---

const MonitoringDetailView: React.FC<Props> = ({ ruleId }) => {
  const [data, setData] = useState<MonitoringStatusResponse | null>(null)
  const [deviceList, setDeviceList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // View State
  const [viewMode, setViewMode] = useState<'DENSITY' | 'ANALYTICS'>('ANALYTICS')

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL' as 'ALL' | 'UP' | 'DOWN',
    time: '24h' as '1h' | '6h' | '24h' | '7d',
  })

  // --- Data Sync ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const from = new Date()
      const offsets = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 }
      from.setHours(now.getHours() - offsets[filters.time])

      const [statusRes, listRes] = await Promise.all([
        axios.get(`/api/v0/monitor/status/${ruleId}`, {
          params: { from: from.toISOString(), to: now.toISOString() },
        }),
        deviceList.length === 0
          ? axios.get('/api/v0/search/device/list')
          : Promise.resolve({ data: null }),
      ])

      setData(statusRes.data)
      if (listRes.data) {
        setDeviceList((listRes.data || []).flatMap((s: any) => s.devices || []))
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'SYNC_FAILED')
    } finally {
      setLoading(false)
    }
  }, [ruleId, filters.time, deviceList.length])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // --- Processing ---
  const deviceMap = useMemo(() => {
    const map = new Map<number, any>()
    deviceList.forEach((d) => map.set(d.id, d))
    return map
  }, [deviceList])

  const processedData = useMemo(() => {
    if (!data) return []
    const query = filters.search.toLowerCase()

    return data.groupedData
      .flatMap((group) => {
        const devInfo = deviceMap.get(group.deviceId)
        const name = devInfo?.name || devInfo?.sysName || `Node_${group.deviceId}`
        const ip = devInfo?.ipv4 || '0.0.0.0'
        const searchMatch = name.toLowerCase().includes(query) || ip.includes(query)

        if (!searchMatch) return []

        return group.deviceDataPort
          .map((port) => {
            const lastPt = port.statusData[port.statusData.length - 1]
            const isUp = lastPt?.status ?? false

            if (filters.status === 'UP' && !isUp) return null
            if (filters.status === 'DOWN' && isUp) return null

            // Stats
            const upPoints = port.statusData.filter((p) => p.status).length
            const total = port.statusData.length
            const uptime = total ? (upPoints / total) * 100 : 0
            const avgLat = upPoints
              ? port.statusData.reduce((a, b) => a + (b.responseTime || 0), 0) / upPoints
              : 0

            return {
              key: `${group.deviceId}-${port.port}`,
              id: group.deviceId,
              name,
              ip,
              port: port.port,
              history: port.statusData,
              isUp,
              uptime,
              avgLat,
              lastCheck: lastPt?.checkTime,
            }
          })
          .filter(Boolean) as any[]
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data, deviceMap, filters])

  if (loading && !data) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white font-mono">
        <RefreshCcw className="w-12 h-12 animate-spin text-neutral-600 mb-4" />
        <span className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          Initializing_Telemetry_Engine...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-red-500 font-mono text-center">
        <div className="border border-red-900/50 bg-red-900/10 p-8">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase tracking-widest mb-2">Critical Error</h2>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col overflow-x-hidden">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <a
              href="/monitoring"
              className="p-2 border border-white/10 hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h1 className="text-xl font-black uppercase tracking-widest truncate max-w-md">
                  {data?.rule.name}
                </h1>
              </div>
              <div className="flex gap-4 text-[10px] text-neutral-500 font-bold uppercase mt-1">
                <span>ID: {ruleId}</span>
                <span>•</span>
                <span>{data?.rule.cronExpression}</span>
                <span>•</span>
                <span>Streams: {processedData.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-white" />
              <input
                type="text"
                placeholder="SEARCH_NODES..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="bg-black border border-white/10 pl-9 pr-4 py-2 text-[10px] font-bold uppercase w-48 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-black border border-white/10">
              {(['ALL', 'UP', 'DOWN'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, status: s }))}
                  className={`px-3 py-2 text-[9px] font-bold uppercase transition-colors ${filters.status === s ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Time Range */}
            <div className="flex bg-black border border-white/10">
              {(['1h', '6h', '24h', '7d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters((f) => ({ ...f, time: t }))}
                  className={`px-3 py-2 text-[9px] font-bold uppercase transition-colors ${filters.time === t ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex bg-black border border-white/10">
              <button
                onClick={() => setViewMode('ANALYTICS')}
                className={`p-2 transition-colors ${viewMode === 'ANALYTICS' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                title="Analytics View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('DENSITY')}
                className={`p-2 transition-colors ${viewMode === 'DENSITY' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                title="Density View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchData}
              className="p-2 border border-white/10 hover:bg-white hover:text-black"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-[1920px] mx-auto w-full p-4 pb-20">
        {/* Analytics View (List + Histogram) */}
        {viewMode === 'ANALYTICS' && (
          <div className="grid grid-cols-1 gap-1">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[9px] font-black uppercase text-neutral-600 border-b border-white/10">
              <div className="col-span-3">Node_Identity</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Uptime</div>
              <div className="col-span-1 text-right">Avg_Lat</div>
              <div className="col-span-6 pl-4">Latency_Distribution_Log</div>
            </div>

            {processedData.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-4 px-4 py-3 bg-neutral-900/20 border border-white/5 items-center hover:bg-white/5 transition-colors group"
              >
                {/* Identity */}
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

                {/* Metrics */}
                <div className="col-span-1 flex justify-center">
                  {item.isUp ? (
                    <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold">UP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 border border-red-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span className="text-[9px] font-bold">DOWN</span>
                    </div>
                  )}
                </div>

                <div className="col-span-1 text-right font-mono text-xs text-white">
                  {item.uptime.toFixed(1)}%
                </div>
                <div className="col-span-1 text-right font-mono text-xs text-neutral-300">
                  {item.avgLat.toFixed(0)}ms
                </div>

                {/* Histogram - Guaranteed NO OVERFLOW */}
                <div className="col-span-6 pl-4 h-8 flex items-center overflow-hidden">
                  <LatencyHistogram data={item.history} height={32} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Density View (Heatmap Matrix) */}
        {viewMode === 'DENSITY' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {processedData.map((item) => (
              <div
                key={item.key}
                className="p-4 bg-neutral-900/20 border border-white/5 hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white truncate pr-2" title={item.name}>
                      {item.name}
                    </h3>
                    <div className="flex gap-2 text-[9px] text-neutral-500 font-mono mt-0.5">
                      <span>{item.ip}</span>
                      <span>:</span>
                      <span>{item.port}</span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                </div>
                <HeatmapRow data={item.history} />
              </div>
            ))}
          </div>
        )}

        {processedData.length === 0 && (
          <div className="py-32 text-center border border-dashed border-white/10 text-neutral-600">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <span className="text-xs uppercase tracking-widest font-bold">
              No streams match your filter
            </span>
          </div>
        )}
      </main>

      {/* FOOTER LEGEND */}
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
        <div className="flex-shrink-0 ml-4">Streams: {processedData.length}</div>
      </footer>
    </div>
  )
}

export default MonitoringDetailView
