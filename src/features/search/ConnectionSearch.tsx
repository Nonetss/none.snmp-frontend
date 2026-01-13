import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Search,
  Network,
  Cpu,
  Hash,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'

interface ConnectionResult {
  switchId: number
  switchName: string
  switchIp: string
  switchLocation: string
  bridgePort: number
  resolvedBy: string
  portMacCount: number
  isMostLikely: boolean
  interface: {
    ifName: string
    ifDescr: string
    ifSpeed: string
    ifType: string
  } | null
  macAddress: string
  ipAddress: string
  lastSeen: string
}

const ConnectionSearch: React.FC = () => {
  const [mode, setMode] = useState<'ip' | 'mac'>('ip')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ConnectionResult[]>([])
  const [error, setError] = useState<string | null>(null)

  // Limpiar al cambiar modo
  useEffect(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [mode])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      const param = mode === 'mac' ? `mac=${query}` : `ip=${query}`
      const response = await axios.get(`/api/v0/search/connection?${param}`)

      setResults(response.data)
      if (response.data.length === 0) {
        setError(`No connection data found for this ${mode.toUpperCase()}.`)
      }
    } catch (err: any) {
      setError(err.message || 'Search failed. Check format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      <InfoCard
        title="Physical_Topology_Trace"
        description="Correlate ARP and FDB tables to find the physical point of entry"
        icon={Network}
        headerAction={
          <div className="flex bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setMode('ip')}
              className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'ip' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              IP_Mode
            </button>
            <button
              onClick={() => setMode('mac')}
              className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'mac' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              MAC_Mode
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 group">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/20 group-focus-within:bg-white transition-colors" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'ip'
                    ? 'INPUT_IP_ADDRESS (e.g. 172.19.3.17)'
                    : 'INPUT_MAC_ADDRESS (e.g. 00:11:22:33:44:55)'
                }
                className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px]"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Execute_Trace'}
            </button>
          </form>

          {error && (
            <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      </InfoCard>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((res, i) => (
          <div
            key={`${res.switchId}-${i}`}
            className={`relative group border transition-all duration-300 ${
              res.isMostLikely
                ? 'border-white/30 bg-white/[0.03] ring-1 ring-white/10 shadow-[0_0_30px_-15px_rgba(255,255,255,0.1)]'
                : 'border-white/10 bg-neutral-950 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-white/[0.02]'
            }`}
          >
            {res.isMostLikely && (
              <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 shadow-2xl">
                <ShieldCheck className="size-3" /> Target_Acquired
              </div>
            )}

            <div className="p-8 flex flex-col lg:flex-row lg:items-center gap-10">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 border ${res.isMostLikely ? 'border-white/20 bg-white/5' : 'border-white/5'}`}
                    >
                      <Network
                        className={`w-5 h-5 ${res.isMostLikely ? 'text-white' : 'text-neutral-600'}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white">
                        {res.switchName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-emerald-500 font-bold">
                          {res.switchIp}
                        </span>
                        <span className="text-neutral-800 font-black tracking-tighter">//</span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                          {res.switchLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 pl-[52px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                      Logical_Port
                    </span>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-neutral-500" />
                      <span className="text-[11px] font-mono text-white font-bold">
                        {res.bridgePort}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                      Protocol_Source
                    </span>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3 h-3 text-neutral-500" />
                      <span className="text-[11px] font-bold text-neutral-400 uppercase">
                        {res.resolvedBy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`px-8 py-6 border-l border-white/10 min-w-[280px] bg-white/[0.01]`}>
                <div className="flex flex-col gap-3">
                  <span className="text-[9px] text-neutral-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/30" /> Physical_Interface
                  </span>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black font-mono text-white tracking-widest">
                        {res.interface?.ifName || 'PORT_UNDEFINED'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[8px] text-neutral-400 font-black">
                        {res.interface?.ifSpeed || 'LINK_SPEED_UNKNOWN'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-600 font-medium italic truncate max-w-[220px]">
                      {res.interface?.ifDescr || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 min-w-[200px]">
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-black uppercase tracking-tighter">
                  <Clock className="w-3 h-3 text-neutral-700" />
                  Telemetry:{' '}
                  {new Date(res.lastSeen).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
                <div className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500/50 animate-pulse" />
                  MAC_COLLISIONS: {res.portMacCount}
                </div>
                <a
                  href={`/devices/${res.switchId}`}
                  className="group flex items-center gap-2 px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all border border-transparent shadow-xl"
                >
                  Inspect_Node{' '}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectionSearch
