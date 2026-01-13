import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Search,
  Zap,
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
  Activity,
} from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { Badge } from '@/components/ui/badge'

interface DeviceRef {
  id: number
  name: string | null
  ipv4: string
}

interface ServiceGroup {
  name: string
  devices: DeviceRef[]
}

interface ServiceSearchResult {
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

const getTechId = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6)
}

const ServiceSearch: React.FC = () => {
  // 1. Direct Search State
  const [svcName, setSvcName] = useState('')
  const [isRunning, setIsRunning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ServiceSearchResult[]>([])
  const [directError, setDirectError] = useState<string | null>(null)

  // 2. Fuzzy Search State
  const [fuzzyQuery, setFuzzyQuery] = useState('')
  const [fuzzyResults, setFuzzyResults] = useState<ServiceGroup[]>([])
  const [fuzzyLoading, setFuzzyLoading] = useState(false)
  const [fuzzyPage, setFuzzyPage] = useState(1)
  const [fuzzyMeta, setFuzzyMeta] = useState<PaginationMeta | null>(null)
  const [expandedFuzzy, setExpandedFuzzy] = useState<Record<string, boolean>>({})

  // 3. Global Inventory State
  const [inventory, setInventory] = useState<ServiceGroup[]>([])
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [invPage, setInvPage] = useState(1)
  const [invMeta, setInvMeta] = useState<PaginationMeta | null>(null)
  const [expandedInv, setExpandedInv] = useState<Record<string, boolean>>({})

  const fetchInventory = async () => {
    setInventoryLoading(true)
    try {
      const response = await axios.get(`/api/v0/search/service/inventory`, {
        params: { page: invPage, pageSize: PAGE_SIZE },
      })
      setInventory(response.data.data || [])
      setInvMeta(response.data.meta || null)
    } catch (err) {
      console.error('Failed to fetch inventory', err)
    } finally {
      setInventoryLoading(false)
    }
  }

  const handleFuzzySearch = async (e?: React.FormEvent, newPage = 1) => {
    if (e) e.preventDefault()
    if (!fuzzyQuery.trim()) return

    setFuzzyLoading(true)
    try {
      const response = await axios.get(`/api/v0/search/service/fuzzy`, {
        params: { name: fuzzyQuery, page: newPage, pageSize: PAGE_SIZE },
      })
      setFuzzyResults(response.data.data || [])
      setFuzzyMeta(response.data.meta || null)
      setFuzzyPage(newPage)
    } catch (err) {
      console.error('Fuzzy search failed', err)
    } finally {
      setFuzzyLoading(false)
    }
  }

  const handleDirectSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!svcName.trim()) return

    setLoading(true)
    setDirectError(null)
    try {
      const response = await axios.get(`/api/v0/search/service/service`, {
        params: { name: svcName, running: isRunning ? 'true' : 'false' },
      })
      setResults(response.data)
      if (response.data.length === 0) {
        setDirectError(
          `No devices found with service ${svcName} ${isRunning ? 'running' : 'missing'}.`
        )
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
        <div className="flex items-center gap-2 px-4 opacity-50">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
            Service_01 // Process_Check
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <InfoCard
          title="Service.Status_Query"
          description="Identify nodes where a specific system service or process is currently active or absent"
          icon={Zap}
        >
          <div className="space-y-6">
            <form onSubmit={handleDirectSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/20 group-focus-within:bg-white transition-colors" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="SERVICE_PROCESS_NAME"
                  className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
                  required
                />
              </div>
              <div className="flex bg-black border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setIsRunning(true)}
                  className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRunning ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Running
                </button>
                <button
                  type="button"
                  onClick={() => setIsRunning(false)}
                  className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${!isRunning ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Missing
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-10 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 min-w-[160px] flex items-center justify-center shadow-xl"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Run_Query'}
              </button>
            </form>

            {directError && (
              <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {directError}
              </div>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                {results.map((device) => (
                  <div
                    key={device.id}
                    className="border border-white/10 bg-neutral-950 p-6 flex items-center justify-between group hover:border-white/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
                        <Server className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">
                          {device.name || 'UNKNOWN_NODE'}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/70 font-bold">
                          {device.ipv4}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`/devices/${device.id}`}
                      className="p-2 border border-white/5 text-neutral-700 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </InfoCard>
      </div>

      {/* TOOL 2: FUZZY SEARCH */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4 opacity-50">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
            Service_02 // Fuzzy_Locator
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <InfoCard
          title="Smart.Fuzzy_Service_Search"
          description="Pattern matching across all running processes using partial identifiers"
          icon={Activity}
          headerAction={
            fuzzyMeta &&
            fuzzyMeta.totalPages > 1 && (
              <div className="flex bg-black border border-white/10 p-1">
                <button
                  onClick={() => handleFuzzySearch(undefined, fuzzyPage - 1)}
                  disabled={fuzzyPage === 1 || fuzzyLoading}
                  className="p-1.5 hover:bg-white hover:text-black text-neutral-500 transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 flex items-center text-[9px] font-black text-white uppercase tracking-widest border-l border-r border-white/10">
                  PG {fuzzyPage} <span className="text-neutral-700 mx-1">/</span>{' '}
                  {fuzzyMeta.totalPages}
                </div>
                <button
                  onClick={() => handleFuzzySearch(undefined, fuzzyPage + 1)}
                  disabled={fuzzyPage >= fuzzyMeta.totalPages || fuzzyLoading}
                  className="p-1.5 hover:bg-white hover:text-black text-neutral-500 transition-all disabled:opacity-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )
          }
        >
          <div className="space-y-8">
            <form onSubmit={(e) => handleFuzzySearch(e, 1)} className="flex gap-2">
              <div className="relative flex-1 group">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/20 group-focus-within:bg-white transition-colors" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={fuzzyQuery}
                  onChange={(e) => setFuzzyQuery(e.target.value)}
                  placeholder="SEARCH_PROCESS_NAME (e.g. ssh, httpd, systemd)"
                  className="w-full bg-black border border-white/10 px-12 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
                />
              </div>
              <button
                type="submit"
                disabled={fuzzyLoading}
                className="px-10 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-xl"
              >
                {fuzzyLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            <div className="divide-y divide-white/5 bg-black border border-white/10">
              {fuzzyResults.map((svc) => (
                <div key={svc.name} className="group/item">
                  <button
                    onClick={() =>
                      setExpandedFuzzy((prev) => ({ ...prev, [svc.name]: !prev[svc.name] }))
                    }
                    className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-2 border border-white/5 bg-white/[0.01] group-hover:border-white/10 transition-colors">
                        <Zap className="w-4 h-4 text-neutral-600 group-hover:text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[11px] font-black text-neutral-200 group-hover:text-white uppercase tracking-widest transition-colors">
                          {svc.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-tighter">
                            Hits: {svc.devices.length} Nodes
                          </span>
                          <span className="text-[8px] text-neutral-600 font-mono tracking-tighter">
                            UID_{getTechId(svc.name)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedFuzzy[svc.name] ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  {expandedFuzzy[svc.name] && (
                    <div className="p-6 bg-white/[0.01] border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                      {svc.devices.map((device) => (
                        <a
                          key={device.id}
                          href={`/devices/${device.id}`}
                          className="p-4 border border-white/5 bg-black hover:border-white/20 transition-all group/node relative overflow-hidden shadow-2xl"
                        >
                          <div className="flex flex-col gap-1.5 relative z-10">
                            <span className="text-[10px] font-black text-neutral-300 group-hover/node:text-white truncate uppercase tracking-widest">
                              {device.name || 'UNNAMED_NODE'}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/50 font-bold">
                              <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
                              {device.ipv4}
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover/node:w-full transition-all duration-300" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}{' '}
              {!fuzzyLoading && fuzzyResults.length === 0 && fuzzyQuery && (
                <div className="py-12 text-center text-[10px] text-neutral-600 uppercase tracking-[0.3em]">
                  No_Matches_Stored_In_Archive
                </div>
              )}
            </div>
          </div>
        </InfoCard>
      </div>

      {/* TOOL 3: GLOBAL INVENTORY */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4 opacity-50">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">
            Service_03 // Global_Registry
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <InfoCard
          title="Running_Processes.Registry_Log"
          description="Master inventory of all unique system processes detected across the managed network"
          icon={Database}
          headerAction={
            <div className="flex items-center gap-4">
              {inventoryLoading && <RefreshCcw className="w-3 h-3 animate-spin text-neutral-700" />}
              <div className="flex bg-black border border-white/10 p-1">
                <button
                  onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                  disabled={invPage === 1 || inventoryLoading}
                  className="p-1.5 hover:bg-white hover:text-black text-neutral-500 transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {invMeta && (
                  <div className="px-4 flex items-center text-[9px] font-black text-white uppercase tracking-widest border-l border-r border-white/10">
                    PG {invPage} <span className="text-neutral-700 mx-1">/</span>{' '}
                    {invMeta.totalPages}
                  </div>
                )}
                <button
                  onClick={() => setInvPage((p) => p + 1)}
                  disabled={(invMeta && invPage >= invMeta.totalPages) || inventoryLoading}
                  className="p-1.5 hover:bg-white hover:text-black text-neutral-500 transition-all disabled:opacity-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          }
        >
          <div className="divide-y divide-white/5 bg-black border border-white/10 max-h-[800px] overflow-y-auto custom-scrollbar">
            {inventory.map((svc) => (
              <div key={svc.name} className="group/item border-b border-white/5 last:border-0">
                <button
                  onClick={() =>
                    setExpandedInv((prev) => ({ ...prev, [svc.name]: !prev[svc.name] }))
                  }
                  className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 border border-white/5 bg-white/[0.01] flex items-center justify-center group-hover:border-white/10 transition-colors">
                      <Activity className="w-5 h-5 text-neutral-500 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-black text-neutral-200 group-hover:text-white uppercase tracking-widest transition-colors">
                        {svc.name}
                      </span>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                          <span className="text-[9px] text-white font-black uppercase tracking-tighter">
                            {svc.devices.length} Nodes
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 font-mono font-bold tracking-widest bg-white/[0.02] px-2 py-0.5 border border-white/5">
                          ID_{getTechId(svc.name)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] text-neutral-500 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                      Expand_Telemetry
                    </span>
                    {expandedInv[svc.name] ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </button>
                {expandedInv[svc.name] && (
                  <div className="p-6 bg-white/[0.01] border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                    {svc.devices.map((device) => (
                      <a
                        key={device.id}
                        href={`/devices/${device.id}`}
                        className="p-4 border border-white/5 bg-black hover:border-white/20 transition-all group/node relative overflow-hidden shadow-2xl"
                      >
                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className="text-[10px] font-black text-neutral-300 group-hover/node:text-white truncate uppercase tracking-widest">
                            {device.name || 'UNNAMED_NODE'}
                          </span>
                          <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/50 font-bold">
                            <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
                            {device.ipv4}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover/node:w-full transition-all duration-300" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  )
}

export default ServiceSearch
