import {
  Search,
  Play,
  RefreshCcw,
  Terminal,
  AlertCircle,
  Database,
  Server,
  Settings2,
  Plus,
  Trash2,
  X,
  Globe,
} from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA' | 'PTR'

interface DnsServer {
  id: number
  name: string
  ip: string
}

interface DnsDomain {
  id: number
  domain: string
}

interface DnsResult {
  domain: string
  type: string
  server: string
  answers: any[]
  output: string
}

const recordTypes: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'PTR']

const DnsTool: React.FC = () => {
  const [domainInput, setDomainInput] = useState('')
  const [selectedBaseDomain, setSelectedBaseDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dns_tool_base_domain') || ''
    }
    return ''
  })
  const [serverInput, setServerInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dns_tool_server') || ''
    }
    return ''
  })
  const [type, setType] = useState<RecordType>('A')

  const [registeredServers, setRegisteredServers] = useState<DnsServer[]>([])
  const [registeredDomains, setRegisteredDomains] = useState<DnsDomain[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DnsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Settings Form State
  const [newServerName, setNewServerName] = useState('')
  const [newServerIp, setNewServerIp] = useState('')
  const [newDomainName, setNewDomainName] = useState('')

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('dns_tool_base_domain', selectedBaseDomain)
  }, [selectedBaseDomain])

  useEffect(() => {
    localStorage.setItem('dns_tool_server', serverInput)
  }, [serverInput])

  const fetchSettings = React.useCallback(async () => {
    try {
      const [serversRes, domainsRes] = await Promise.all([
        axios.get('/api/v0/toolbox/dns-server'),
        axios.get('/api/v0/toolbox/domain'),
      ])
      setRegisteredServers(serversRes.data || [])
      setRegisteredDomains(domainsRes.data || [])
    } catch (err) {
      console.error('Failed to fetch DNS settings', err)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()

    let finalDomain = domainInput.trim()
    if (selectedBaseDomain && finalDomain) {
      finalDomain = `${finalDomain}.${selectedBaseDomain}`
    } else if (selectedBaseDomain && !finalDomain) {
      finalDomain = selectedBaseDomain
    }

    if (!finalDomain || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const params = new URLSearchParams()
      params.append('domain', finalDomain)
      params.append('type', type)
      if (serverInput.trim()) params.append('server', serverInput.trim())

      const response = await axios.get(`/api/v0/toolbox/dns?${params.toString()}`)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'DNS Query failed')
    } finally {
      setLoading(false)
    }
  }

  const addServer = async () => {
    if (!newServerName.trim() || !newServerIp.trim()) return
    try {
      await axios.post('/api/v0/toolbox/dns-server', { name: newServerName, ip: newServerIp })
      setNewServerName('')
      setNewServerIp('')
      fetchSettings()
    } catch (err) {
      alert('Failed to add server')
    }
  }

  const deleteServer = async (id: number) => {
    try {
      await axios.delete(`/api/v0/toolbox/dns-server/${id}`)
      fetchSettings()
    } catch (err) {
      alert('Failed to delete server')
    }
  }

  const addDomain = async () => {
    if (!newDomainName.trim()) return
    try {
      await axios.post('/api/v0/toolbox/domain', { domain: newDomainName })
      setNewDomainName('')
      fetchSettings()
    } catch (err) {
      alert('Failed to add domain')
    }
  }

  const deleteDomain = async (id: number) => {
    try {
      await axios.delete(`/api/v0/toolbox/domain/${id}`)
      fetchSettings()
    } catch (err) {
      alert('Failed to delete domain')
    }
  }

  return (
    <>
      <InfoCard
        title="DNS.Resource_Query"
        description="Resolve domain names and retrieve specific DNS records from authoritative servers"
        icon={Database}
        headerAction={
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
              title="Manage DNS Presets"
            >
              <Settings2 className="size-4" />
            </button>
            {result && (
              <button
                onClick={() => setResult(null)}
                className="px-3 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Clear
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          <form onSubmit={handleQuery} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Domain Input Area - Proportion 3 */}
              <div className="space-y-2 md:col-span-3">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">
                  Target_Identity
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-500/50 group-focus-within:bg-purple-500 transition-colors" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder={
                        selectedBaseDomain
                          ? 'SUBDOMAIN (e.g. www)'
                          : 'FULL_DOMAIN (e.g. google.com)'
                      }
                      className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
                    />
                  </div>
                  {registeredDomains.length > 0 && (
                    <select
                      value={selectedBaseDomain}
                      onChange={(e) => setSelectedBaseDomain(e.target.value)}
                      className="bg-black border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-neutral-400 focus:text-white transition-colors outline-none max-w-[150px]"
                    >
                      <option value=""></option>
                      {registeredDomains.map((d) => (
                        <option key={d.id} value={d.domain}>
                          .{d.domain.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Nameserver Source - Proportion 2 */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">
                  Nameserver_Source
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      value={serverInput}
                      onChange={(e) => setServerInput(e.target.value)}
                      placeholder="IP_ADDRESS"
                      className="w-full bg-black border border-white/10 pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800 font-mono"
                    />
                  </div>
                  {registeredServers.length > 0 && (
                    <select
                      onChange={(e) => setServerInput(e.target.value)}
                      value={registeredServers.find((s) => s.ip === serverInput)?.ip || ''}
                      className="bg-black border border-white/10 px-3 py-2 text-[10px] font-black uppercase text-neutral-400 focus:text-white outline-none max-w-[100px]"
                    >
                      <option value=""></option>
                      {registeredServers.map((s) => (
                        <option key={s.id} value={s.ip}>
                          {s.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Record Type - Proportion 1 */}
              <div className="space-y-2 md:col-span-1">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1">
                  Record_Type
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RecordType)}
                    className="w-full bg-black border border-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
                  >
                    {recordTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                    <Terminal className="size-3" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!domainInput.trim() && !selectedBaseDomain)}
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-neutral-950 border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <Settings2 className="size-5 text-white" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">
                  DNS_Preset_Management
                </h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 text-neutral-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
              {/* Servers Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                    <Server className="size-3.5 text-purple-500" /> Registered_Nameservers
                  </h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="text"
                    placeholder="LABEL (e.g. Google)"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    className="bg-black border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-white/30 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="IP (e.g. 8.8.8.8)"
                    value={newServerIp}
                    onChange={(e) => setNewServerIp(e.target.value)}
                    className="bg-black border border-white/10 px-4 py-2 text-[10px] font-bold font-mono focus:border-white/30 outline-none"
                  />
                  <button
                    onClick={addServer}
                    className="px-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all h-full flex items-center gap-2"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {registeredServers.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-3 border border-white/5 bg-white/[0.02] group"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase">
                          {s.name}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500">{s.ip}</span>
                      </div>
                      <button
                        onClick={() => deleteServer(s.id)}
                        className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Domains Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
                    <Globe className="size-3.5 text-blue-500" /> Base_Domain_Library
                  </h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    placeholder="DOMAIN (e.g. internal.corp)"
                    value={newDomainName}
                    onChange={(e) => setNewDomainName(e.target.value)}
                    className="bg-black border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-white/30 outline-none"
                  />
                  <button
                    onClick={addDomain}
                    className="px-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all h-full flex items-center gap-2"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {registeredDomains.map((d) => (
                    <div
                      key={d.id}
                      className="flex justify-between items-center p-3 border border-white/5 bg-white/[0.02] group"
                    >
                      <span className="text-[10px] font-black text-white uppercase">
                        {d.domain}
                      </span>
                      <button
                        onClick={() => deleteDomain(d.id)}
                        className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-8 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl"
              >
                Close_Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DnsTool
