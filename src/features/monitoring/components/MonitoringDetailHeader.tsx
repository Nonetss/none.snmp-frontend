import React from 'react'
import { ChevronLeft, Activity, Search, List, LayoutGrid, RefreshCcw } from 'lucide-react'
import type { MonitoringStatusResponse } from '../types'

interface MonitoringDetailHeaderProps {
  ruleId: number
  data: MonitoringStatusResponse | null
  processedCount: number
  filters: any
  setFilters: React.Dispatch<React.SetStateAction<any>>
  viewMode: 'DENSITY' | 'ANALYTICS'
  setViewMode: (mode: 'DENSITY' | 'ANALYTICS') => void
  fetchData: () => void
  loading: boolean
}

export const MonitoringDetailHeader: React.FC<MonitoringDetailHeaderProps> = ({
  ruleId,
  data,
  processedCount,
  filters,
  setFilters,
  viewMode,
  setViewMode,
  fetchData,
  loading,
}) => {
  return (
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
              <span>Streams: {processedCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600 group-focus-within:text-white" />
            <input
              type="text"
              placeholder="SEARCH_NODES..."
              value={filters.search}
              onChange={(e) => setFilters((f: any) => ({ ...f, search: e.target.value }))}
              className="bg-black border border-white/10 pl-9 pr-4 py-2 text-[10px] font-bold uppercase w-48 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="flex bg-black border border-white/10">
            {(['ALL', 'UP', 'DOWN'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f: any) => ({ ...f, status: s }))}
                className={`px-3 py-2 text-[9px] font-bold uppercase transition-colors ${filters.status === s ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex bg-black border border-white/10">
            {(['1h', '6h', '24h', '7d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters((f: any) => ({ ...f, time: t }))}
                className={`px-3 py-2 text-[9px] font-bold uppercase transition-colors ${filters.time === t ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

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
  )
}
