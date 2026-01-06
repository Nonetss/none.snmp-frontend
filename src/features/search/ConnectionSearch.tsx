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
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/connection?${param}`
      )

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
      {/* Search Console (The Card) */}
      <div className="bg-neutral-900/20 border border-white/10 shadow-sm overflow-hidden">
        {/* Header - Dashboard Style */}
        <div className="flex justify-between items-center border-b border-white/10 p-6 bg-white/[0.02]">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Network className="w-4 h-4" /> Trace.Origin()
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
              Correlate ARP and FDB tables
            </p>
          </div>

          <div className="flex bg-black border border-white/10 p-1">
            <button
              onClick={() => setMode('ip')}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === 'ip' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              IP_Mode
            </button>
            <button
              onClick={() => setMode('mac')}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                mode === 'mac' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              MAC_Mode
            </button>
          </div>
        </div>

        {/* Search Input Area */}
        <div className="p-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={mode === 'ip' ? 'INPUT_IP_ADDRESS...' : 'INPUT_MAC_ADDRESS...'}
                className="w-full bg-black/50 border border-white/10 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 uppercase font-mono transition-all placeholder:text-neutral-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Execute_Trace'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/5 flex items-center gap-3 text-red-500 text-[11px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((res, i) => (
          <div
            key={`${res.switchId}-${i}`}
            className={`relative group border transition-all duration-300 ${
              res.isMostLikely
                ? 'border-white/40 bg-white/5 ring-1 ring-white/20'
                : 'border-white/10 bg-neutral-900/20 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
            }`}
          >
            {res.isMostLikely && (
              <div className="absolute -top-2.5 right-6 px-3 py-0.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 shadow-xl">
                <ShieldCheck className="w-3 h-3" /> Targeted_Location
              </div>
            )}

            <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Network
                      className={`w-5 h-5 ${res.isMostLikely ? 'text-white' : 'text-neutral-600'}`}
                    />
                    <h3 className="text-sm font-bold uppercase tracking-tighter">
                      {res.switchName}
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono ml-8">
                    {res.switchIp} • {res.switchLocation}
                  </p>
                </div>

                <div className="flex items-center gap-6 ml-8">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[11px] text-neutral-400 uppercase font-bold">
                      Port: {res.bridgePort}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[11px] text-neutral-400 uppercase font-bold">
                      Resolved: {res.resolvedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`px-6 py-4 border-l border-r border-white/5 min-w-[240px] ${res.isMostLikely ? 'bg-white/5' : ''}`}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">
                    Physical_Interface
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-white">
                      {res.interface?.ifName || 'N/A'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {res.interface?.ifSpeed || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 italic truncate max-w-[200px]">
                    {res.interface?.ifDescr || 'No description available'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[180px]">
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  {new Date(res.lastSeen).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-neutral-500 font-bold uppercase">
                  Other MACs on port: {res.portMacCount}
                </div>
                <a
                  href={`/devices/${res.switchId}`}
                  className="mt-2 flex items-center gap-2 px-4 py-1.5 border border-white/10 text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
                >
                  Inspect Switch <ArrowRight className="w-3 h-3" />
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
