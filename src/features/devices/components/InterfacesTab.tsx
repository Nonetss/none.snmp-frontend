import React, { useState, useMemo } from 'react'
import { Network, Activity, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import type { DeviceDetail, Interface, AddrEntry } from '@/features/devices/components/types'

interface InterfacesTabProps {
  device: DeviceDetail
}

type StatusFilter = 'all' | 'up' | 'down'

export const InterfacesTab: React.FC<InterfacesTabProps> = ({ device }) => {
  const [showAllInterfaces, setShowAllInterfaces] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredInterfaces = useMemo(() => {
    if (!device.interfaces) return []
    return device.interfaces.filter((iface) => {
      if (statusFilter === 'all') return true
      const isUp = iface.latestData?.ifOperStatus === 1
      return statusFilter === 'up' ? isUp : !isUp
    })
  }, [device.interfaces, statusFilter])

  // Sort interfaces by index naturally
  const sortedInterfaces = useMemo(() => {
    return [...filteredInterfaces].sort((a, b) => a.ifIndex - b.ifIndex)
  }, [filteredInterfaces])

  const displayedInterfaces = showAllInterfaces ? sortedInterfaces : sortedInterfaces.slice(0, 50) // Show 50 by default in table mode

  const stats = useMemo(() => {
    const total = device.interfaces?.length || 0
    const up = device.interfaces?.filter((i) => i.latestData?.ifOperStatus === 1).length || 0
    return { total, up, down: total - up }
  }, [device.interfaces])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Visual Heatmap Summary */}
      <section className="bg-neutral-900/20 border border-white/10 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
            <Activity className="w-4 h-4" /> Interface_Status_Map
          </h3>
          <div className="flex items-center gap-2 text-[9px] uppercase font-mono text-neutral-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500"></div> UP ({stats.up})
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500/50"></div> DOWN ({stats.down})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-0.5">
          {device.interfaces
            ?.sort((a, b) => a.ifIndex - b.ifIndex)
            .map((iface) => {
              const isUp = iface.latestData?.ifOperStatus === 1
              return (
                <div
                  key={iface.id}
                  title={`${iface.ifName || iface.ifDescr} (Index: ${iface.ifIndex}) - ${isUp ? 'UP' : 'DOWN'}`}
                  className={`w-3 h-3 ${isUp ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-900/30 hover:bg-red-500'} cursor-help transition-colors`}
                />
              )
            })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-neutral-900/20 border border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Network className="w-4 h-4" /> interface_table
            </h3>
            <div className="flex items-center gap-2 bg-black/40 p-1 border border-white/10">
              {(['all', 'up', 'down'] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 text-[8px] uppercase font-bold transition-all ${
                    statusFilter === f ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-[9px] uppercase text-neutral-500 font-bold tracking-wider">
                  <th className="p-3 w-12 text-center">St</th>
                  <th className="p-3 w-16">Idx</th>
                  <th className="p-3">Name/Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Speed</th>
                  <th className="p-3">MTU</th>
                  <th className="p-3">Phys Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px] font-mono text-neutral-300">
                {displayedInterfaces.map((iface) => {
                  const isUp = iface.latestData?.ifOperStatus === 1
                  return (
                    <tr key={iface.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-3 text-center">
                        <div
                          className={`w-1.5 h-1.5 mx-auto rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500/50'}`}
                        />
                      </td>
                      <td className="p-3 text-neutral-500">{iface.ifIndex}</td>
                      <td className="p-3 font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {iface.ifName || iface.ifDescr || '-'}
                        {iface.ifAlias && (
                          <div className="text-[8px] text-neutral-500 font-normal">
                            {iface.ifAlias}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-neutral-500">{iface.ifType}</td>
                      <td className="p-3">
                        {iface.ifSpeed
                          ? `${(parseInt(iface.ifSpeed) / 1000000).toFixed(0)} Mbps`
                          : '-'}
                      </td>
                      <td className="p-3 text-neutral-500">{iface.ifMtu}</td>
                      <td className="p-3 text-neutral-500">{iface.ifPhysAddress || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {sortedInterfaces.length === 0 && (
              <div className="py-12 text-center text-[10px] uppercase text-neutral-600 tracking-widest">
                No interfaces match filter
              </div>
            )}
          </div>

          {sortedInterfaces.length > 50 && (
            <div className="p-2 border-t border-white/10 bg-white/5 text-center">
              <button
                onClick={() => setShowAllInterfaces(!showAllInterfaces)}
                className="text-[9px] uppercase font-bold text-neutral-400 hover:text-white transition-colors"
              >
                {showAllInterfaces
                  ? 'Show Less'
                  : `Show All (${sortedInterfaces.length}) Interfaces`}
              </button>
            </div>
          )}
        </section>

        <section className="bg-neutral-900/10 border border-white/5 flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Activity className="w-4 h-4" /> IP_Address_Table
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-white/5 text-[10px] font-mono">
                {device.ipSnmp?.addrEntries?.map((addr, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white font-bold">{addr.ipAdEntAddr}</td>
                    <td className="p-3 text-right text-neutral-500">IF: {addr.ipAdEntIfIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!device.ipSnmp?.addrEntries || device.ipSnmp.addrEntries.length === 0) && (
              <div className="text-center py-8 text-[8px] text-neutral-700 uppercase italic">
                No IP entries found
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
