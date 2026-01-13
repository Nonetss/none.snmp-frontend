import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Activity, Play, Square, RefreshCcw, Terminal, AlertCircle } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'

interface PingResult {
  host: string
  alive: boolean
  time: number | string
  output: string
}

type PingMode = 'STANDARD' | 'CONTINUOUS'

const PingTool: React.FC = () => {
  const [host, setHost] = useState('')

  const [loading, setLoading] = useState(false)

  const [isRunning, setIsRunning] = useState(false)

  const [pingMode, setPingMode] = useState<PingMode>('CONTINUOUS')

  const [history, setHistory] = useState<PingResult[]>([])

  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const isRunningRef = useRef(false)

  const timerRef = useRef<any>(null)

  // Keep ref in sync with state

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, isRunning])

  // Cleanup on unmount

  useEffect(() => {
    return () => {
      isRunningRef.current = false

      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const executePing = useCallback(async () => {
    const currentHost = host.trim()

    if (!currentHost) return

    // Always use backend endpoint as requested

    const endpoint = '/api/v0/toolbox/ping'

    try {
      const response = await axios.get(endpoint, {
        params: { host: currentHost },
      })

      // If we stopped while the request was in flight, abort state update

      if (pingMode === 'CONTINUOUS' && !isRunningRef.current) return

      const data = response.data

      const alive = data.alive

      const time = data.time

      const result: PingResult = {
        host: currentHost,

        alive: alive,

        time: time,

        output: alive
          ? `Reply from ${currentHost}: time=${time}ms`
          : `Request timed out for ${currentHost}`,
      }

      setHistory((prev) => [...prev, result].slice(-100))
    } catch (err: any) {
      if (pingMode === 'CONTINUOUS' && !isRunningRef.current) return

      const errorResult: PingResult = {
        host: currentHost,

        alive: false,

        time: 'ERR',

        output: `Error: ${err.response?.data?.error || err.message || 'Node unreachable'} `,
      }

      setHistory((prev) => [...prev, errorResult].slice(-100))

      if (pingMode === 'STANDARD') {
        setError(err.message || 'Ping sequence failed')
      }
    }
  }, [host, pingMode])

  // Managed Loop Effect - Sequential Trigger

  useEffect(() => {
    if (!isRunning || pingMode === 'STANDARD') return

    const runLoop = async () => {
      if (!isRunningRef.current) return

      await executePing()

      // Immediately trigger next ping if still running

      if (isRunningRef.current) {
        timerRef.current = setTimeout(runLoop, 500) // Small delay to avoid hammering too hard, but sequential
      }
    }

    runLoop()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isRunning, pingMode, executePing])

  const handleStop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()

    setIsRunning(false)

    isRunningRef.current = false

    if (timerRef.current) {
      clearTimeout(timerRef.current)

      timerRef.current = null
    }
  }

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!host.trim() || loading || isRunning) return

    setError(null)

    if (pingMode === 'STANDARD') {
      setLoading(true)

      await executePing()

      setLoading(false)
    } else {
      setHistory([])

      setIsRunning(true)
    }
  }

  const clearHistory = () => setHistory([])

  return (
    <InfoCard
      title="ICMP.Echo_Diagnostics"
      description="Select execution source to verify host connectivity and latency response"
      icon={Activity}
      headerAction={
        <div className="flex gap-4 items-center">
          <div className="flex p-1 bg-black border border-white/5">
            <button
              onClick={() => {
                setPingMode('STANDARD')
                handleStop()
              }}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                pingMode === 'STANDARD'
                  ? 'bg-white text-black'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Standard
            </button>

            <button
              onClick={() => setPingMode('CONTINUOUS')}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                pingMode === 'CONTINUOUS'
                  ? 'bg-white text-black'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Continuous
            </button>
          </div>

          <button
            onClick={clearHistory}
            className="px-3 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Clear_Log
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleStart} className="flex gap-2">
          <div className="relative flex-1 group">
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 transition-colors ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-white/20 group-focus-within:bg-white'}`}
            />

            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />

            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              disabled={isRunning}
              placeholder="INPUT_IP_OR_HOSTNAME..."
              className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800 disabled:opacity-50"
            />
          </div>

          {!isRunning ? (
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

                  {pingMode === 'STANDARD' ? 'Run_Query' : 'Start_Loop'}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="px-8 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center min-w-[160px]"
            >
              <Square className="w-3.5 h-3.5 mr-2 fill-current" />
              Stop_Loop
            </button>
          )}
        </form>

        {error && (
          <div className="p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-500 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="bg-neutral-950 border border-white/5 rounded-sm overflow-hidden">
          <div className="bg-white/[0.03] px-4 py-2 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-neutral-500 tracking-[0.2em]">
                Console_Output
              </span>
              {isRunning && (
                <span className="text-[8px] bg-emerald-500 text-black px-1.5 font-black uppercase animate-pulse">
                  Running
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
            </div>
          </div>
          <div
            ref={scrollRef}
            className="h-[300px] overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar selection:bg-white selection:text-black bg-black/40"
          >
            {history.length === 0 && !loading && !isRunning && (
              <div className="h-full flex items-center justify-center text-neutral-800 uppercase tracking-[0.3em]">
                System_Idle // Waiting_For_Telemetry
              </div>
            )}
            {history.map((res, i) => (
              <div
                key={i}
                className="flex gap-4 animate-in fade-in slide-in-from-left-1 duration-300"
              >
                <span className="text-neutral-700 shrink-0 select-none">
                  [{new Date().toLocaleTimeString([], { hour12: false })}]
                </span>
                <span className={res.alive ? 'text-emerald-500' : 'text-red-500'}>
                  {res.alive ? '>' : '!'} {res.output}
                </span>
              </div>
            ))}
            {(loading || isRunning) && (
              <div className="flex gap-4 animate-pulse">
                <span className="text-neutral-700 shrink-0">
                  [{new Date().toLocaleTimeString([], { hour12: false })}]
                </span>
                <span className="text-white font-bold tracking-widest uppercase">
                  {loading ? 'Requesting_Data...' : 'Listening_For_Echo...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

export default PingTool
