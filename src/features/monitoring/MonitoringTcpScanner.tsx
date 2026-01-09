import React, { useState } from 'react'
import axios from 'axios'
import {
  Zap,
  RefreshCcw,
  ShieldAlert,
  Network,
  Clock,
  CheckCircle2,
  AlertCircle,
  Monitor,
} from 'lucide-react'
import type { TcpScanResponse } from './types'

const MonitoringTcpScanner: React.FC = () => {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TcpScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Advanced options
  const [timeout, setTimeoutVal] = useState(100)
  const [concurrency, setConcurrency] = useState(100)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('/api/v0/monitor/tcp/scan', {
        ip,
        timeout,
        concurrency,
      })
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Config Panel */}
      <div className="bg-neutral-900/20 border border-white/10 p-6 space-y-6">
        <form onSubmit={handleScan} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                Target IP Address
              </label>
              <div className="relative">
                <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  placeholder="E.G. 127.0.0.1"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/40 uppercase font-mono tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeoutVal(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40 font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                  Concurrency
                </label>
                <input
                  type="number"
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ip}
            className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-[0.4em] hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)]"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {loading ? 'Executing_Port_Scan...' : 'Initiate_Network_Scan'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase font-bold animate-in slide-in-from-top-2">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Scan Results: {result.ip}
              </h2>
            </div>
            <div className="text-[10px] text-neutral-500 font-bold uppercase">
              Total Ports Scanned: {result.totalScanned}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {result.openPorts.map((p) => (
              <div
                key={p.port}
                className="bg-neutral-900/40 border border-emerald-500/20 p-3 group hover:border-emerald-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-black text-white">{p.port}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-bold uppercase">
                  <Clock className="w-3 h-3" />
                  {p.time.toFixed(1)}ms
                </div>
              </div>
            ))}
          </div>

          {result.openPorts.length === 0 && (
            <div className="py-20 text-center border border-dashed border-white/10 bg-neutral-900/5">
              <div className="flex flex-col items-center gap-4 opacity-30">
                <AlertCircle className="w-12 h-12" />
                <span className="text-[10px] uppercase tracking-[0.5em]">
                  No Open Ports Detected
                </span>
                <p className="text-[8px] max-w-xs mx-auto text-neutral-500 font-bold">
                  The target host might be offline or protected by a firewall.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="py-32 flex flex-col items-center justify-center gap-6 border border-white/5 bg-white/[0.01]">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-t-2 border-white rounded-full animate-spin" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white font-black">
              Probing_Network_Layers
            </span>
            <span className="text-[8px] uppercase tracking-widest text-neutral-600 animate-pulse">
              Requesting TCP handshake on {ip}...
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MonitoringTcpScanner
