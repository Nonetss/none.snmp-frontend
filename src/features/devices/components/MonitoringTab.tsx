import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Shield, Activity, RefreshCcw, Zap, Calendar, AlertCircle } from 'lucide-react'
import type { DeviceDetail } from '@/features/devices/components/types'

interface MonitoringTabProps {
  device: DeviceDetail
}

// We define a local subset of Monitoring types here to avoid circular dependency
// or heavy imports if the features are decoupled.
interface MonitoringStatusPoint {
  status: boolean
  checkTime: string
  responseTime?: number | null
}

interface MonitoringDeviceDataPort {
  port: number
  statusData: MonitoringStatusPoint[]
}

interface MonitoringGroupedData {
  deviceId: number
  deviceDataPort: MonitoringDeviceDataPort[]
}

interface MonitoringStatusResponse {
  rule: {
    id: number
    name: string
    cronExpression: string
    lastRun?: string
  }
  groupedData: MonitoringGroupedData[]
}

const getHealthStats = (history: MonitoringStatusPoint[]) => {
  if (!history || history.length === 0) return { percent: 0, color: 'hsl(0, 0%, 20%)' }
  const limit = 50
  const relevant = history.slice(-limit)
  if (relevant.length === 0) return { percent: 0, color: 'hsl(0, 0%, 20%)' }

  const upCount = relevant.filter((s) => s.status).length
  const total = relevant.length
  const ratio = upCount / total
  const percent = Math.round(ratio * 100)
  const hue = Math.round(ratio * 120)
  return {
    percent,
    color: `hsl(${hue}, 80%, 45%)`,
  }
}

export const MonitoringTab: React.FC<MonitoringTabProps> = ({ device }) => {
  const [rules, setRules] = useState<MonitoringStatusResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New state to hold specific detailed history if needed,
  // but for now we rely on the main endpoint to give us the "groupedData"
  // which contains status history.

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all rules status
      const response = await axios.get('/api/v0/monitor/status')
      const allRules: MonitoringStatusResponse[] = response.data || []

      // Filter for rules that include this device in their groupedData
      const deviceRules = allRules
        .filter((r) => r.groupedData.some((g) => g.deviceId === device.id))
        .map((r) => ({
          ...r,
          // Filter the groupedData to ONLY show this device's data
          groupedData: r.groupedData.filter((g) => g.deviceId === device.id),
        }))

      setRules(deviceRules)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monitoring status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [device.id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/10 border border-white/5">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          Syncing.Monitoring.Data()
        </span>
      </div>
    )
  }

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/10 border border-white/5 text-neutral-500">
        <Shield className="w-12 h-12 mb-4 opacity-20" />
        <span className="text-[10px] uppercase tracking-[0.3em] mb-2">
          No_Active_Monitoring_Rules
        </span>
        <p className="text-[9px] max-w-xs text-center">
          This device is not currently targetted by any active monitoring rules.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
          <Activity className="w-4 h-4" /> Active_Monitoring_Contexts
        </h3>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Refresh Status"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((item) => (
          <div
            key={item.rule.id}
            className="border border-white/10 bg-neutral-900/20 flex flex-col"
          >
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white">
                  {item.rule.name}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-neutral-500 font-mono flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {item.rule.cronExpression}
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.rule.lastRun ? new Date(item.rule.lastRun).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
              <a
                href={`/monitoring/${item.rule.id}?deviceId=${device.id}`}
                className="px-3 py-1.5 border border-white/10 text-[8px] font-bold uppercase hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <Zap className="w-3 h-3" />
                Deep.Analysis
              </a>
            </div>

            <div className="p-6">
              {item.groupedData.map((group) => (
                <div key={group.deviceId} className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {group.deviceDataPort.map((port) => {
                      const stats = getHealthStats(port.statusData)
                      return (
                        <div
                          key={port.port}
                          className="flex flex-col gap-2 p-3 border border-white/5 bg-black/20 min-w-[120px]"
                        >
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-bold uppercase text-neutral-400">
                              Port {port.port}
                            </span>
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${port.statusData[port.statusData.length - 1]?.status ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}
                            />
                          </div>

                          {/* Mini Heatmap for this port */}
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {port.statusData.slice(-40).map((point, idx) => (
                              <div
                                key={idx}
                                title={`${new Date(point.checkTime).toLocaleString()} - ${point.responseTime}ms`}
                                className={`w-1.5 h-3 ${point.status ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ opacity: 0.3 + (idx / 40) * 0.7 }}
                              />
                            ))}
                          </div>

                          <div className="flex justify-between items-end mt-1">
                            <span className="text-[8px] text-neutral-600 uppercase">Health</span>
                            <span className="text-[10px] font-black" style={{ color: stats.color }}>
                              {stats.percent}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
