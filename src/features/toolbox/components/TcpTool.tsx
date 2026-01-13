import React, { useState } from 'react'
import axios from 'axios'
import {
  Zap,
  Play,
  RefreshCcw,
  Terminal,
  AlertCircle,
  Shield,
  List,
  Search,
  Loader2,
} from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { Badge } from '@/components/ui/badge'

type TcpMode = 'CHECK' | 'SCAN'

interface ScanResult {
  port: number
  time: number
}

interface FullScanResponse {
  ip: string
  openPorts: ScanResult[]
  totalScanned: number
}

const TcpTool: React.FC = () => {
  const [mode, setMode] = useState<TcpMode>('CHECK')
  const [ip, setIp] = useState('')
  const [port, setPort] = useState('80')
  const [timeout, setTimeoutVal] = useState('2000')
  const [concurrency, setConcurrency] = useState('100')
  const [allPorts, setAllPorts] = useState(false)

  const [loading, setLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<{ open: boolean; time: number } | null>(null)
  const [scanResult, setScanResult] = useState<FullScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip.trim() || loading) return

    setLoading(true)
    setError(null)
    setCheckResult(null)
    setScanResult(null)

    try {
      if (mode === 'CHECK') {
        const response = await axios.get(`/api/v0/toolbox/tcp`, {
          params: { ip: ip.trim(), port: Number(port), timeout: Number(timeout) },
        })
        setCheckResult(response.data)
      } else {
        const response = await axios.post(`/api/v0/toolbox/tcp/scan`, {
          ip: ip.trim(),
          allPorts,
          timeout: Number(timeout),
          concurrency: Number(concurrency),
        })
        setScanResult(response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'TCP operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <InfoCard
      title="TCP.Port_Diagnostics"
      description="Probe specific ports or perform high-speed discovery of open services"
      icon={Zap}
      headerAction={
        <div className="flex bg-black border border-white/5 p-1">
          <button
            onClick={() => {
              setMode('CHECK')
              setError(null)
            }}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
              mode === 'CHECK' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            Port_Check
          </button>
          <button
            onClick={() => {
              setMode('SCAN')
              setError(null)
            }}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
              mode === 'SCAN' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
            }`}
          >
            Full_Scan
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative group md:col-span-2">
              <div
                className={`absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500/50 group-focus-within:bg-amber-500 transition-colors`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="TARGET_IP_ADDRESS..."
                className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
                required
              />
            </div>

            {mode === 'CHECK' ? (
              <div className="relative group">
                <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="PORT"
                  className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all font-mono"
                  required
                />
              </div>
            ) : (
              <div className="relative group">
                <div className="flex items-center h-full gap-2 px-4 bg-black border border-white/10">
                  <input
                    type="checkbox"
                    id="allPorts"
                    checked={allPorts}
                    onChange={(e) => setAllPorts(e.target.checked)}
                    className="accent-white size-3"
                  />
                  <label
                    htmlFor="allPorts"
                    className="text-[9px] font-black uppercase tracking-widest text-neutral-500 cursor-pointer"
                  >
                    Scan_All_65k
                  </label>
                </div>
              </div>
            )}

            <div className="relative group">
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutVal(e.target.value)}
                placeholder="TIMEOUT (MS)"
                className="w-full bg-black border border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-neutral-700 font-bold">
                MS
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              type="submit"
              disabled={loading || !ip.trim()}
              className="w-full sm:w-auto px-12 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 h-11 flex items-center justify-center shadow-xl"
            >
              {loading ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                  {mode === 'CHECK' ? 'Probing_Port' : 'Initiate_Scan'}
                </>
              )}
            </button>

            {mode === 'SCAN' && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-neutral-600 font-black uppercase">
                  Concurrency:
                </span>
                <input
                  type="number"
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  className="w-16 bg-black border border-white/10 px-2 py-1 text-[10px] font-bold font-mono focus:outline-none focus:border-white/30"
                />
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="bg-neutral-950 border border-white/5 rounded-sm overflow-hidden">
          <div className="bg-white/[0.03] px-4 py-2 border-b border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-neutral-500 tracking-[0.2em]">
              Diagnostic_Buffer
            </span>
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 className="size-3 animate-spin text-amber-500" />
                <span className="text-[8px] text-amber-500 font-black uppercase animate-pulse">
                  Processing_Request...
                </span>
              </div>
            )}
          </div>

          <div className="h-[300px] overflow-y-auto p-6 font-mono text-[10px] custom-scrollbar bg-black/40">
            {/* Check View */}
            {mode === 'CHECK' && checkResult && (
              <div className="h-full flex items-center justify-center">
                <div
                  className={`p-8 border-2 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 ${checkResult.open ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${checkResult.open ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}
                  >
                    {checkResult.open ? (
                      <Zap className="size-6 fill-current" />
                    ) : (
                      <Shield className="size-6" />
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <div
                      className={`text-xl font-black uppercase tracking-[0.3em] ${checkResult.open ? 'text-emerald-500' : 'text-red-500'}`}
                    >
                      {checkResult.open ? 'PORT_OPEN' : 'PORT_CLOSED'}
                    </div>
                    <p className="text-neutral-500 uppercase font-bold tracking-widest">
                      Target: {ip}:{port}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-mono italic">
                      Response_Time: {checkResult.time}ms
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scan View */}
            {mode === 'SCAN' && scanResult && (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div className="grid gap-1">
                    <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">
                      Discovery_Results
                    </span>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">
                      {ip}
                    </h4>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div className="grid gap-0.5">
                      <span className="text-[8px] text-neutral-600 font-black uppercase">Open</span>
                      <span className="text-xs text-emerald-500 font-black font-mono">
                        {scanResult.openPorts.length}
                      </span>
                    </div>
                    <div className="grid gap-0.5">
                      <span className="text-[8px] text-neutral-600 font-black uppercase">
                        Total
                      </span>
                      <span className="text-xs text-neutral-400 font-black font-mono">
                        {scanResult.totalScanned}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {scanResult.openPorts.map((p) => (
                    <div
                      key={p.port}
                      className="p-3 border border-white/5 bg-white/[0.02] flex flex-col gap-1 hover:border-emerald-500/30 transition-all group animate-in fade-in"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600 font-black uppercase text-[8px]">
                          Port
                        </span>
                        <Zap className="size-2 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-black text-white font-mono tracking-widest">
                        {p.port}
                      </span>
                      <span className="text-[8px] text-neutral-700 font-bold uppercase mt-1">
                        LAT: {p.time}ms
                      </span>
                    </div>
                  ))}
                  {scanResult.openPorts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-700 uppercase tracking-[0.3em] italic">
                      No_Open_Ports_Detected_On_Target
                    </div>
                  )}
                </div>
              </div>
            )}

            {!checkResult && !scanResult && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-800 uppercase tracking-[0.3em] gap-4">
                <Terminal className="size-8 opacity-20" />
                <span>Socket_Engine // Standby</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

export default TcpTool
