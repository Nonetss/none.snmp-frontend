import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Network, Play, RefreshCcw, Terminal, AlertCircle, ChevronRight } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'

interface TracerouteHop {
  hop: number
  ip: string
  rtt: string
}

interface TracerouteResult {
  host: string
  hops: TracerouteHop[]
  output: string
}

const TracerouteTool: React.FC = () => {
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TracerouteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [result, loading])

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.get(`/api/v0/toolbox/traceroute`, {
        params: { host: host.trim() },
      })

      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Traceroute failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <InfoCard
      title="IP.Trace_Route"
      description="Map the path packets take across the network to a destination"
      icon={Network}
      headerAction={
        result && (
          <button
            onClick={() => setResult(null)}
            className="px-3 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Clear_Trace
          </button>
        )
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleTrace} className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500/50 group-focus-within:bg-blue-500 transition-colors" />
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="INPUT_TARGET_HOST (e.g. google.com)"
              className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !host.trim()}
            className="px-8 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                Run_Trace
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="bg-neutral-950 border border-white/5 rounded-sm overflow-hidden">
          <div className="bg-white/[0.03] px-4 py-2 border-b border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-neutral-500 tracking-[0.2em]">
              Trace_Log
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500/50 animate-pulse" />
              <span className="text-[8px] text-neutral-600 uppercase font-bold tracking-tighter">
                Status: {loading ? 'Tracing' : 'Ready'}
              </span>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="h-[350px] overflow-y-auto p-6 font-mono text-[10px] space-y-4 custom-scrollbar"
          >
            {!result && !loading && (
              <div className="h-full flex items-center justify-center text-neutral-800 uppercase tracking-[0.3em]">
                System_Awaiting // Path_Discovery_Ready
              </div>
            )}

            {result && result.hops && (
              <div className="space-y-2">
                {result.hops.map((hop, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-6 group animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="w-6 text-neutral-700 font-bold shrink-0">{hop.hop}.</span>
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-white font-bold tracking-widest">{hop.ip}</span>
                      <div className="h-[1px] flex-1 bg-white/5 group-hover:bg-white/10 transition-colors" />
                      <span className="text-emerald-500 font-bold px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10">
                        {hop.rtt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                <div className="flex gap-4 items-center animate-pulse">
                  <span className="text-neutral-700 font-bold">[*]</span>
                  <span className="text-white font-black uppercase tracking-[0.2em]">
                    Analyzing_Hops...
                  </span>
                </div>
                <div className="flex flex-col gap-2 opacity-30">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-4 h-2 bg-neutral-800" />
                      <div className="w-32 h-2 bg-neutral-800" />
                      <div className="flex-1 h-[1px] bg-neutral-900" />
                      <div className="w-12 h-2 bg-neutral-800" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

export default TracerouteTool
