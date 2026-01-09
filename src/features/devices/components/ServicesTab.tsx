import React, { useState, useMemo } from 'react'
import { List, Search, X, Shield, ShieldOff } from 'lucide-react'
import type { DeviceDetail, Service } from '@/features/devices/components/types'

interface ServicesTabProps {
  device: DeviceDetail
}

type ServiceStatusFilter = 'all' | 'running' | 'other'

export const ServicesTab: React.FC<ServicesTabProps> = ({ device }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>('all')

  const filteredServices = useMemo(() => {
    if (!device.services) return []
    return device.services.filter((svc) => {
      const matchesSearch =
        svc.hrSWRunName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.hrSWRunPath.toLowerCase().includes(searchTerm.toLowerCase())

      if (statusFilter === 'all') return matchesSearch
      const isRunning = svc.hrSWRunStatus === 1
      const matchesStatus = statusFilter === 'running' ? isRunning : !isRunning

      return matchesSearch && matchesStatus
    })
  }, [device.services, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const total = device.services?.length || 0
    const running = device.services?.filter((s) => s.hrSWRunStatus === 1).length || 0
    return { total, running, other: total - running }
  }, [device.services])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bg-neutral-900/20 border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-white/10 bg-white/5 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <List className="w-4 h-4" /> running_services
            </h3>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-0.5">
              {(['all', 'running', 'other'] as ServiceStatusFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2 py-0.5 text-[8px] uppercase font-bold transition-all ${
                    statusFilter === f ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {f} ({f === 'all' ? stats.total : f === 'running' ? stats.running : stats.other})
                </button>
              ))}
            </div>
          </div>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_SERVICES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 py-1.5 pl-9 pr-8 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-white/30 transition-all text-white placeholder:text-neutral-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-white text-neutral-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40 text-[9px] uppercase text-neutral-500 font-bold tracking-wider">
                <th className="p-3 w-20 text-center">Status</th>
                <th className="p-3 w-24">Index</th>
                <th className="p-3">Service Name</th>
                <th className="p-3">Path / Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[10px] font-mono text-neutral-300">
              {filteredServices.map((svc, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      {svc.hrSWRunStatus === 1 ? (
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ShieldOff className="w-3.5 h-3.5 text-neutral-600" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-neutral-500">#{svc.hrSWRunIndex}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-white uppercase">{svc.hrSWRunName}</span>
                      <span className="text-[8px] text-neutral-600 uppercase">
                        STATUS_{svc.hrSWRunStatus === 1 ? 'RUNNING' : 'OTHER'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5 max-w-xl">
                      <span className="text-neutral-400 truncate italic" title={svc.hrSWRunPath}>
                        {svc.hrSWRunPath || '-'}
                      </span>
                      {svc.hrSWRunParameters && (
                        <span className="text-[8px] text-neutral-600 truncate bg-white/5 px-1 w-fit border border-white/5">
                          ARGS: {svc.hrSWRunParameters}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-50">
                No.Matching.Services.Found
              </span>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="mt-4 px-4 py-2 border border-white/10 text-[8px] hover:bg-white hover:text-black transition-all uppercase font-bold"
                >
                  Reset.Filters()
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
