import React, { useState, useMemo } from 'react'
import { Cpu, Search, X } from 'lucide-react'
import type { DeviceDetail, Application } from '@/features/devices/components/types'

interface ApplicationsTabProps {
  device: DeviceDetail
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ device }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredApplications = useMemo(() => {
    if (!device.applications) return []
    return device.applications.filter((app) =>
      app.hrSWInstalledName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [device.applications, searchTerm])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bg-neutral-900/20 border border-white/10 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b border-white/10 bg-white/5 gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Cpu className="w-4 h-4" /> installed_applications
            </h3>
            <span className="text-[9px] text-neutral-600 font-bold uppercase bg-black/40 px-2 py-0.5 border border-white/10">
              Total: {filteredApplications.length}
            </span>
          </div>

          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_PKG..."
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40 text-[9px] uppercase text-neutral-500 font-bold tracking-wider">
                <th className="p-3 w-20">Index</th>
                <th className="p-3">Software Name</th>
                <th className="p-3 w-32">Type</th>
                <th className="p-3 w-40 text-right">Install Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[10px] font-mono text-neutral-300">
              {filteredApplications.map((app, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-neutral-500">{app.hrSWInstalledIndex}</td>
                  <td className="p-3 font-bold text-white">{app.hrSWInstalledName}</td>
                  <td className="p-3 text-neutral-400">
                    TYPE_{app.hrSWInstalledType || 'UNKNOWN'}
                  </td>
                  <td className="p-3 text-right text-neutral-500">
                    {app.hrSWInstalledDate || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-50">
                No.Applications.Found
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 border border-white/10 text-[8px] hover:bg-white hover:text-black transition-all uppercase font-bold"
                >
                  Clear.Search()
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
