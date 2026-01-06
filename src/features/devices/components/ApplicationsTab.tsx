import React, { useState, useMemo } from 'react'
import { Cpu, Layers, Search, X } from 'lucide-react'
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
      <section className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
              <Cpu className="w-4 h-4" /> installed_applications_matrix
            </h3>
            <span className="text-[9px] text-neutral-600 font-bold uppercase bg-white/5 px-2 py-0.5 border border-white/5">
              Packages: {filteredApplications.length}
            </span>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_APPLICATIONS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-2 pl-9 pr-8 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredApplications.map((app: Application, i: number) => (
            <div
              key={i}
              className="p-4 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4
                    className="text-[10px] font-bold text-white uppercase truncate"
                    title={app.hrSWInstalledName}
                  >
                    {app.hrSWInstalledName}
                  </h4>
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">
                    TYPE_{app.hrSWInstalledType || 'SOFTWARE'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-neutral-600 uppercase">Index</span>
                  <span className="text-neutral-300 font-mono">{app.hrSWInstalledIndex}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-neutral-600 uppercase">Install Date</span>
                  <span className="text-neutral-300">{app.hrSWInstalledDate || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredApplications.length === 0 && (
            <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-white/10 text-neutral-600">
              <Layers className="w-8 h-8 mb-4 opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.4em]">No.Applications.Found</span>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 border border-white/10 text-[8px] hover:bg-white hover:text-black transition-all uppercase font-bold"
              >
                Clear.Search()
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
