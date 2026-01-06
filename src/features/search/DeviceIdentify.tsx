import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Fingerprint,
  Search,
  Cpu,
  Database,
  ShieldAlert,
  CheckCircle2,
  RefreshCcw,
  Network,
  ArrowRight,
  Server,
} from 'lucide-react'

interface IdentifiedDevice {
  id: number
  name: string | null
  managementIp: string
  sysName: string | null
  matchType: string
  matchedValue: string
}

const DeviceIdentify: React.FC = () => {
  const [mode, setMode] = useState<'ip' | 'mac'>('ip')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<IdentifiedDevice[]>([])
  const [error, setError] = useState<string | null>(null)

  // Limpiar al cambiar modo
  useEffect(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [mode])

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      const param = mode === 'mac' ? `mac=${query}` : `ip=${query}`
      const response = await axios.get(
        `${import.meta.env.PUBLIC_BACKEND_URL}/api/v1/search/device/identify?${param}`
      )

      const data = response.data
      setResults(Array.isArray(data) ? data : [])

      if (Array.isArray(data) && data.length === 0) {
        setError(`No registered devices match this ${mode.toUpperCase()}.`)
      }
    } catch (err: any) {
      setError(err.message || 'Identification failed. Check identifier format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full">
      {/* Identity Console Card */}
      <div className="bg-neutral-900/20 border border-white/10 shadow-sm overflow-hidden">
        {/* Header - Dashboard Style */}
        <div className="flex justify-between items-center border-b border-white/10 p-6 bg-white/[0.02]">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Identity.Resolver()
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
              Database signature cross-reference
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

        {/* Input Area */}
        <div className="p-8">
          <form onSubmit={handleIdentify} className="flex gap-2">
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
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Identify_Now'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/5 flex items-center gap-3 text-red-500 text-[11px] font-bold uppercase tracking-widest animate-in slide-in-from-top-2">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((device) => (
          <div
            key={device.id}
            className="border border-white/10 bg-neutral-900/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/30 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                <Server className="w-6 h-6 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">
                    {device.name || device.sysName || 'UNKNOWN_DEVICE'}
                  </h3>
                  <span className="px-2 py-0.5 bg-white text-black text-[10px] font-black uppercase tracking-widest">
                    ID: {device.id}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Network className="w-3 h-3" /> {device.managementIp}
                  </span>
                  <span className="text-neutral-800">|</span>
                  <span className="flex items-center gap-1.5 uppercase">
                    <Database className="w-3 h-3" /> Match: {device.matchType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-[10px] text-neutral-500 uppercase font-black tracking-[0.2em]">
                  Verified_Identity
                </div>
                <div className="text-[11px] text-emerald-500 font-bold uppercase">
                  System.Managed
                </div>
              </div>
              <a
                href={`/devices/${device.id}`}
                className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 text-xs font-bold uppercase hover:bg-white hover:text-black transition-all"
              >
                Inspect_Node <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceIdentify
