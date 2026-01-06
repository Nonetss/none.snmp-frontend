import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Search,
  Box,
  Server,
  Network,
  ArrowRight,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Database,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

interface DeviceRef {
  id: number
  name: string | null
  ipv4: string
}

interface ApplicationGroup {
  name: string
  devices: DeviceRef[]
}

interface ResourceSearchResult {
  id: number
  ipv4: string
  name: string | null
}

interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const PAGE_SIZE = 50

const ApplicationSearch: React.FC = () => {
  // 1. Direct Search State
  const [appName, setAppName] = useState('')
  const [isInstalled, setIsInstalled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ResourceSearchResult[]>([])
  const [directError, setDirectError] = useState<string | null>(null)

  // 2. Fuzzy Search State
  const [fuzzyQuery, setFuzzyQuery] = useState('')
  const [fuzzyResults, setFuzzyResults] = useState<ApplicationGroup[]>([])
  const [fuzzyLoading, setFuzzyLoading] = useState(false)
  const [fuzzyPage, setFuzzyPage] = useState(1)
  const [fuzzyMeta, setFuzzyMeta] = useState<PaginationMeta | null>(null)
  const [expandedFuzzy, setExpandedFApps] = useState<Record<string, boolean>>({})

  // 3. Global Inventory State
  const [inventory, setInventory] = useState<ApplicationGroup[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [invPage, setInvPage] = useState(1)
  const [invMeta, setInvMeta] = useState<PaginationMeta | null>(null)
  const [expandedInv, setExpandedInv] = useState<Record<string, boolean>>({})

  // Fetch Inventory (All)
  const fetchInventory = async () => {
    setInventoryLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/resource/inventory`,
        { params: { page: invPage, pageSize: PAGE_SIZE } }
      )
      setInventory(response.data.data || [])
      setInvMeta(response.data.meta || null)
    } catch (err) {
      console.error('Failed to fetch inventory', err)
    } finally {
      setInventoryLoading(false)
    }
  }

  // Fetch Fuzzy Search
  const handleFuzzySearch = async (e?: React.FormEvent, newPage = 1) => {
    if (e) e.preventDefault()
    if (!fuzzyQuery.trim()) return

    setFuzzyLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/resource/fuzzy`,
        { params: { name: fuzzyQuery, page: newPage, pageSize: PAGE_SIZE } }
      )
      setFuzzyResults(response.data.data || [])
      setFuzzyMeta(response.data.meta || null)
      setFuzzyPage(newPage)
    } catch (err) {
      console.error('Fuzzy search failed', err)
    } finally {
      setFuzzyLoading(false)
    }
  }

  // Handle Direct Query
  const handleDirectSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appName.trim()) return

    setLoading(true)
    setDirectError(null)
    try {
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/resource/resource`,
        { params: { name: appName, installed: isInstalled ? 'true' : 'false' } }
      )
      setResults(response.data)
      if (response.data.length === 0) {
        setDirectError(`No devices found with ${appName} ${isInstalled ? 'installed' : 'missing'}.`)
      }
    } catch (err: any) {
      setDirectError(err.message || 'Search failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [invPage])

  return (
    <div className="space-y-16 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      {/* TOOL 1: DIRECT QUERY */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4">
          <span className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em]">
            Service_01 // Binary_Check
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="bg-neutral-900/40 border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-white" /> Software.Binary_Query()
              </h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                Find nodes where a specific package is either present or missing.
              </p>
            </div>
            <form onSubmit={handleDirectSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="EXACT_APP_NAME"
                  className="w-full bg-black border border-white/10 pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-white/40 uppercase font-mono"
                  required
                />
              </div>
              <div className="flex bg-black border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setIsInstalled(true)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${isInstalled ? 'bg-white text-black' : 'text-neutral-500'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstalled(false)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${!isInstalled ? 'bg-white text-black' : 'text-neutral-500'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Missing
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-10 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 min-w-[160px] flex items-center justify-center"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Run_Query'}
              </button>
            </form>
          </div>
        </div>
        {directError && (
          <div className="p-4 border border-red-500/50 bg-red-500/5 flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest">
            <AlertCircle className="w-4 h-4" /> {directError}
          </div>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((device) => (
              <div
                key={device.id}
                className="border border-white/10 bg-neutral-900/40 p-6 flex items-center justify-between group hover:border-white/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-neutral-500 group-hover:text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white uppercase">
                      {device.name || 'UNKNOWN'}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                      <Network className="w-3 h-3" /> {device.ipv4}
                    </div>
                  </div>
                </div>
                <a
                  href={`/devices/${device.id}`}
                  className="p-2 border border-white/5 text-neutral-700 hover:text-white hover:border-white/40"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOOL 2: FUZZY SEARCH */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4">
          <span className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em]">
            Service_02 // Fuzzy_Locator
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="bg-neutral-950 border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 bg-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4" /> Smart.Fuzzy_Search()
              </h3>
              <div className="flex items-center gap-4">
                {fuzzyMeta && fuzzyMeta.totalPages > 1 && (
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => handleFuzzySearch(undefined, fuzzyPage - 1)}
                      disabled={fuzzyPage === 1 || fuzzyLoading}
                      className="p-1 border border-white/10 hover:bg-white hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-[9px] font-bold text-neutral-500 uppercase">
                      PG {fuzzyPage}/{fuzzyMeta.totalPages}
                    </span>
                    <button
                      onClick={() => handleFuzzySearch(undefined, fuzzyPage + 1)}
                      disabled={fuzzyPage >= fuzzyMeta.totalPages || fuzzyLoading}
                      className="p-1 border border-white/10 hover:bg-white hover:text-black transition-all disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {fuzzyMeta && (
                  <span className="text-[9px] text-neutral-500 font-bold uppercase border-l border-white/10 pl-4">
                    Hits: {fuzzyMeta.total}
                  </span>
                )}
              </div>
            </div>
            <form onSubmit={(e) => handleFuzzySearch(e, 1)} className="flex gap-2">
              <input
                type="text"
                value={fuzzyQuery}
                onChange={(e) => setFuzzyQuery(e.target.value)}
                placeholder="SEARCH_PARTIAL_NAME (e.g. Google, Office, Adobe)"
                className="flex-1 bg-black border border-white/10 px-4 py-3 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={fuzzyLoading}
                className="px-8 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2"
              >
                {fuzzyLoading ? <RefreshCcw className="w-3 h-3 animate-spin" /> : 'Search'}
              </button>
            </form>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar bg-black/40">
            {fuzzyResults.map((app) => (
              <div key={app.name} className="bg-black/20">
                <button
                  onClick={() =>
                    setExpandedFApps((prev) => ({ ...prev, [app.name]: !prev[app.name] }))
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Box className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    <span className="text-xs font-bold text-neutral-300 group-hover:text-white uppercase">
                      {app.name}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-[8px] text-neutral-600 font-black border border-white/5">
                      {app.devices.length} Nodes
                    </span>
                  </div>
                  {expandedFuzzy[app.name] ? (
                    <ChevronUp className="w-4 h-4 text-neutral-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-700" />
                  )}
                </button>
                {expandedFuzzy[app.name] && (
                  <div className="p-4 bg-neutral-900/20 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {app.devices.map((device) => (
                      <a
                        key={device.id}
                        href={`/devices/${device.id}`}
                        className="p-3 border border-white/5 bg-black/40 flex flex-col gap-1 hover:border-white/20 transition-all group/item"
                      >
                        <span className="text-[10px] font-bold text-neutral-400 group-hover/item:text-white truncate uppercase">
                          {device.name || 'Unnamed'}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-600">{device.ipv4}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOOL 3: GLOBAL INVENTORY */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4">
          <span className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em]">
            Service_03 // Global_Registry
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <div className="bg-neutral-950 border border-white/5 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4" /> Software Registry
            </span>
            <div className="flex items-center gap-4">
              {inventoryLoading && <RefreshCcw className="w-3 h-3 animate-spin text-neutral-500" />}
              <div className="flex gap-1">
                <button
                  onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                  disabled={invPage === 1 || inventoryLoading}
                  className="p-1 border border-white/10 hover:bg-white hover:text-black transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {invMeta && (
                  <span className="px-3 flex items-center text-[9px] font-bold text-neutral-500">
                    PG {invPage}/{invMeta.totalPages}
                  </span>
                )}
                <button
                  onClick={() => setInvPage((p) => p + 1)}
                  disabled={(invMeta && invPage >= invMeta.totalPages) || inventoryLoading}
                  className="p-1 border border-white/10 hover:bg-white hover:text-black transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
            {inventory.map((app) => (
              <div key={app.name} className="bg-black/20">
                <button
                  onClick={() =>
                    setExpandedInv((prev) => ({ ...prev, [app.name]: !prev[app.name] }))
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Box className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                    <span className="text-xs font-bold text-neutral-300 group-hover:text-white uppercase">
                      {app.name}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-[8px] text-neutral-600 font-black border border-white/5">
                      {app.devices.length} Units
                    </span>
                  </div>
                  {expandedInv[app.name] ? (
                    <ChevronUp className="w-4 h-4 text-neutral-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-700" />
                  )}
                </button>
                {expandedInv[app.name] && (
                  <div className="p-4 bg-neutral-900/20 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {app.devices.map((device) => (
                      <a
                        key={device.id}
                        href={`/devices/${device.id}`}
                        className="p-3 border border-white/5 bg-black/40 flex flex-col gap-1 hover:border-white/20 transition-all group/item"
                      >
                        <span className="text-[10px] font-bold text-neutral-400 group-hover/item:text-white truncate uppercase">
                          {device.name || 'Unnamed'}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-600">{device.ipv4}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationSearch
