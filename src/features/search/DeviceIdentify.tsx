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
import { InfoCard } from '@/components/ui/info-card'

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
      const response = await axios.get(`/api/v0/search/device/identify?${param}`)

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
      <InfoCard
        title="Identity_Signature_Resolver"
        description="Database signature cross-reference to identify registered managed nodes"
        icon={Fingerprint}
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
          <form onSubmit={handleIdentify} className="flex gap-2">
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
                    : 'INPUT_MAC_ADDRESS (e.g. 00:11:22:AA:BB:CC)'
                }
                className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px]"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Identify_Node'}
            </button>
          </form>

          {error && (
            <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>
      </InfoCard>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((device) => (
          <div
            key={device.id}
            className="border border-white/10 bg-neutral-950 p-8 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:border-white/30 hover:bg-white/[0.01] transition-all group"
          >
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
                <Server className="w-7 h-7 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">
                    {device.name || device.sysName || 'MANAGED_NODE_UNNAMED'}
                  </h3>
                  <span className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase tracking-widest shadow-xl">
                    DB_ID: {device.id}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-mono text-neutral-500">
                  <span className="flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-emerald-500/50" />
                    <span className="text-white font-bold">{device.managementIp}</span>
                  </span>
                  <span className="text-neutral-800 font-black tracking-tighter">||</span>
                  <span className="flex items-center gap-2 uppercase font-bold tracking-tight">
                    <Database className="w-3.5 h-3.5 text-neutral-700" />
                    SIGNATURE_MATCH:{' '}
                    <span className="text-neutral-300">{device.matchType.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block border-r border-white/10 pr-6">
                <div className="text-[9px] text-neutral-600 uppercase font-black tracking-[0.2em] mb-1">
                  Node_Integrity
                </div>
                <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2 justify-end">
                  <CheckCircle2 className="size-3" /> VERIFIED_SYSTEM
                </div>
              </div>
              <a
                href={`/devices/${device.id}`}
                className="group flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all border border-transparent shadow-2xl"
              >
                Launch_Inspector{' '}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceIdentify
