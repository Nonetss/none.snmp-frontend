import React, { useEffect, useState, useMemo, useCallback } from 'react'
import axios from 'axios'
import { RefreshCcw, Shield, Filter } from 'lucide-react'
import type { MonitoringStatusResponse } from './types'
import { MonitoringDetailHeader } from './components/MonitoringDetailHeader'
import { MonitoringDetailFooter } from './components/MonitoringDetailFooter'
import { AnalyticsView } from './components/AnalyticsView'
import { DensityView } from './components/DensityView'

interface Props {
  ruleId: number
}

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
      const offsets = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      }
      const from = new Date(now.getTime() - offsets[filters.time])

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

  // Reset data when time filter changes to force a clean "zoom" visual
  useEffect(() => {
    setData(null)
    fetchData()
  }, [filters.time, ruleId])

  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // --- Processing ---
  const deviceMap = useMemo(() => {
    const map = new Map<number, any>()

    // 1. First populate with rule specific devices (which now contain status object)
    if (data?.rule?.deviceGroup?.devices) {
      data.rule.deviceGroup.devices.forEach((dg: any) => {
        if (dg.device) {
          map.set(dg.device.id, dg.device)
        }
      })
    }

    // 2. Augment with general device list
    deviceList.forEach((d) => {
      if (!map.has(d.id)) {
        map.set(d.id, d)
      } else {
        const existing = map.get(d.id)
        map.set(d.id, { ...d, ...existing })
      }
    })
    return map
  }, [deviceList, data])

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

        const deviceStatus = devInfo?.status

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

            // Ensure history is sorted OLDER -> NEWER (Newest on the right)
            const sortedHistory = [...port.statusData].sort(
              (a, b) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime()
            )

            return {
              key: `${group.deviceId}-${port.port}`,
              id: group.deviceId,
              name,
              ip,
              port: port.port,
              history: sortedHistory,
              isUp,
              deviceStatus,
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
      <MonitoringDetailHeader
        ruleId={ruleId}
        data={data}
        processedCount={processedData.length}
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        fetchData={fetchData}
        loading={loading}
      />

      <main className="flex-1 max-w-[1920px] mx-auto w-full p-4 pb-20">
        {viewMode === 'ANALYTICS' && <AnalyticsView data={processedData} />}
        {viewMode === 'DENSITY' && <DensityView data={processedData} />}

        {processedData.length === 0 && (
          <div className="py-32 text-center border border-dashed border-white/10 text-neutral-600">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <span className="text-xs uppercase tracking-widest font-bold">
              No streams match your filter
            </span>
          </div>
        )}
      </main>

      <MonitoringDetailFooter count={processedData.length} />
    </div>
  )
}

export default MonitoringDetailView
