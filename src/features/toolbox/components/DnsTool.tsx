import React, { useState } from 'react'
import axios from 'axios'
import { Search, Play, RefreshCcw, Terminal, AlertCircle, Database, Server } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'

type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA' | 'PTR'

interface DnsResult {
  domain: string
  type: string
  server: string
  answers: any[]
  output: string
}

const recordTypes: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR']

const DnsTool: React.FC = () => {
  const [domain, setDomain] = useState('')
  const [server, setServer] = useState('')
  const [type, setType] = useState<RecordType>('A')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DnsResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams()
      params.append('domain', domain.trim())
      params.append('type', type)
      if (server.trim()) params.append('server', server.trim())

      const response = await axios.get(`/api/v0/toolbox/dns?${params.toString()}`)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'DNS Query failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <InfoCard
      title="DNS.Resource_Query"
      description="Resolve domain names and retrieve specific DNS records from authoritative servers"
      icon={Database}
      headerAction={
        result && (
          <button
            onClick={() => setResult(null)}
            className="px-3 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Clear_Result
          </button>
        )
      }
    >
      <div className="space-y-6">
        <form onSubmit={handleQuery} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr] gap-4">
            <div className="relative group">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-500/50 group-focus-within:bg-purple-500 transition-colors" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="TARGET_DOMAIN (e.g. google.com)"
                className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
                required
              />
            </div>

            <div className="relative group">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="DNS_SERVER_IP (Optional)"
                className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
              />
            </div>

            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecordType)}
                className="w-full bg-black border border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
              >
                {recordTypes.map((t) => (
                  <option key={t} value={t}>
                    TYPE: {t}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                <Terminal className="size-3" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="w-full md:w-auto px-12 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all disabled:opacity-50 h-11 flex items-center justify-center shadow-xl"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                Execute_Query
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
              Lookup_Results
            </span>
            {result && (
              <span className="text-[8px] font-black text-purple-500 uppercase px-2 py-0.5 border border-purple-500/20 bg-purple-500/5">
                Target: {result.domain} // {result.type}
              </span>
            )}
          </div>
          <div className="h-[300px] overflow-y-auto p-6 font-mono text-[10px] custom-scrollbar bg-black/40">
            {!result && !loading && (
              <div className="h-full flex items-center justify-center text-neutral-800 uppercase tracking-[0.3em]">
                Resolver_Idle // Standby_Mode
              </div>
            )}

            {result && result.answers && result.answers.length > 0 ? (
              <div className="space-y-2">
                {result.answers.map((ans, i) => (
                  <div
                    key={i}
                    className="p-4 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all group animate-in fade-in slide-in-from-left-2 flex items-center justify-between"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 border border-white/10 bg-white/5 flex items-center justify-center text-[8px] font-black text-neutral-500">
                        {i + 1}
                      </div>
                      <span className="text-white font-bold tracking-widest">{ans}</span>
                    </div>
                    <span className="text-[8px] text-neutral-700 font-black uppercase tracking-widest">
                      Verified_Record
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              result && (
                <div className="h-full flex items-center justify-center text-amber-500/50 uppercase tracking-[0.2em] font-black italic">
                  No_Records_Found_For_Specified_Type
                </div>
              )
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-12 h-1 bg-white/10 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white animate-progress-shrink origin-left" />
                </div>
                <span className="text-white font-black uppercase tracking-[0.3em]">
                  Querying_Nameservers...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

export default DnsTool
