import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Activity, Server, Share2, Database, Globe, RefreshCcw, AlertCircle } from 'lucide-react'

import { Header } from '@/features/dashboard/Header'
import { StatCard } from '@/features/dashboard/StatCard'
import { SubnetChart } from '@/features/dashboard/SubnetChart'
import { InterfaceHealthChart } from '@/features/dashboard/InterfaceHealthChart'
import { TopHubs } from '@/features/dashboard/TopHubs'
import { SnmpDistribution } from '@/features/dashboard/SnmpDistribution'
import { Footer } from '@/features/dashboard/Footer'
import type { DashboardStats } from '@/features/dashboard/types'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/v0/search/stats`)
      setStats(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const statsInterval = setInterval(fetchStats, 30000)
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)

    return () => {
      clearInterval(statsInterval)
      clearInterval(clockInterval)
    }
  }, [])

  if (loading && !stats)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Loading.Metrics()</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-white font-mono bg-black">
        <div className="border border-white/20 p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-white" />
          <p className="text-xs uppercase tracking-widest">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all"
          >
            RETRY.SYSTEM()
          </button>
        </div>
      </div>
    )

  if (!stats) return null

  return (
    <div className="p-4 md:p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full max-w-[2560px] mx-auto">
      <Header currentTime={currentTime} />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Devices"
          value={stats.devices.totalManaged + stats.devices.totalExternal}
          icon={Server}
          subtext={`${stats.devices.totalManaged} Managed / ${stats.devices.totalExternal} External`}
        />
        <StatCard
          title="Operational Status"
          value={
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                {stats.devices.up}
              </span>
              <span className="text-neutral-700 text-sm">/</span>
              <span className="text-red-500/50 text-xl">{stats.devices.down}</span>
            </div>
          }
          icon={Activity}
          subtext={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-500/80 font-bold">{stats.devices.up} UP</span>
              </div>
              <div className="flex items-center gap-1 border-l border-white/5 pl-3">
                <div className="w-1 h-1 rounded-full bg-red-500" />
                <span className="text-red-500/80 font-bold">{stats.devices.down} DOWN</span>
              </div>
            </div>
          }
        />
        <StatCard
          title="Network Edges"
          value={stats.topology.resolvedLinks}
          icon={Share2}
          subtext={`LLDP: ${stats.topology.lldpConnections} | CDP: ${stats.topology.cdpConnections}`}
        />
        <StatCard
          title="IPv4 Space"
          value={stats.network.totalIps}
          icon={Globe}
          subtext={`${stats.network.subnets} Active Subnets`}
        />
        <StatCard
          title="24H Activity"
          value={stats.activity.updatedNeighbors24h + stats.activity.arpDiscoveries24h}
          icon={Database}
          subtext={`${stats.activity.arpDiscoveries24h} ARP New Discoveries`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SubnetChart data={stats.subnetsDistribution} />
        <InterfaceHealthChart stats={stats.interfaceStatus} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopHubs hubs={stats.topHubs} />
        <SnmpDistribution
          data={stats.snmpVersionDistribution}
          totalManaged={stats.devices.totalManaged}
        />
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard
