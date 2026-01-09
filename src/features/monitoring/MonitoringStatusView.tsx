import { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCcw, BarChart2 } from 'lucide-react'
import type { MonitoringStatusResponse, MonitoringStatusPoint } from './types'
import { MonitoringStatusCard } from './components/MonitoringStatusCard'

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

const MonitoringStatusView: React.FC<Props> = ({ autoRefresh }) => {
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
          .map((item) => (
            <MonitoringStatusCard
              key={item.rule.id}
              item={item}
              isExpanded={expandedRules[item.rule.id] ?? true}
              onToggle={toggleRule}
              getHealthStats={getHealthStats}
            />
          ))}

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
