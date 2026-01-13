import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import {
  Globe,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Server,
  Shield,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PangolinItem, NpmProxyHost } from './types'

// Internal KeyValue Components since they are not in UI library
const KeyValueSection = ({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 border-b border-white/5 pb-2 mb-4">
      {title}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
)

const KeyValueRow = ({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) => (
  <div className="flex justify-between items-center py-1.5 group">
    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">{label}</span>
    <span
      className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${typeof value === 'string' ? 'text-white' : ''}`}
    >
      {value}
    </span>
  </div>
)

const StatusBadge = ({ status }: { status: boolean }) => {
  return status ? (
    <div className="flex items-center gap-1 text-emerald-500">
      <CheckCircle2 className="size-3.5" />
      <span className="text-[10px] font-black uppercase tracking-tighter">Active</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 text-red-500">
      <XCircle className="size-3.5" />
      <span className="text-[10px] font-black uppercase tracking-tighter">Disabled</span>
    </div>
  )
}

type TabId = 'both' | 'npm' | 'pangolin'

const ProxyManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('both')
  const [npmData, setNpmData] = useState<NpmProxyHost[]>([])
  const [pangolinData, setPangolinData] = useState<PangolinItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedNpm, setSelectedNpm] = useState<NpmProxyHost | null>(null)
  const [selectedPangolin, setSelectedPangolin] = useState<PangolinItem | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [npmRes, pangolinRes] = await Promise.all([
        axios.get<NpmProxyHost[]>('/api/v0/proxy/npm'),
        axios.get<PangolinItem[]>('/api/v0/proxy/pangolin'),
      ])
      setNpmData(npmRes.data || [])
      setPangolinData(pangolinRes.data || [])
    } catch (e: any) {
      console.error(e)
      setError('SYSTEM_FAILURE: Telemetry links broken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredNpm = useMemo(() => {
    if (!search) return npmData
    const q = search.toLowerCase()
    return npmData.filter(
      (item) =>
        item.domain_names.some((d) => d.toLowerCase().includes(q)) ||
        item.forward_host.toLowerCase().includes(q)
    )
  }, [npmData, search])

  const filteredPangolin = useMemo(() => {
    if (!search) return pangolinData
    const q = search.toLowerCase()
    return pangolinData.filter(
      (item) => item.name.toLowerCase().includes(q) || item.fullDomain.toLowerCase().includes(q)
    )
  }, [pangolinData, search])

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Proxy-Gateway</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Integrated Nginx Proxy Manager & Pangolin Auth Resource Monitoring
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Tabs Control - Industrial Style */}
          <div className="flex p-1 bg-white/5 border border-white/5">
            <button
              onClick={() => setActiveTab('both')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'both' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Both_Views
            </button>
            <button
              onClick={() => setActiveTab('npm')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'npm' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              NPM_Only
            </button>
            <button
              onClick={() => setActiveTab('pangolin')}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'pangolin'
                  ? 'bg-white text-black'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              PGLN_Only
            </button>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-neutral-800 font-black uppercase tracking-widest mb-1">
                Node_Status
              </span>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-400">
                  <Server className="size-3" /> NPM: {npmData.length}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-400">
                  <ShieldCheck className="size-3" /> PGLN: {pangolinData.length}
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all group"
            >
              <RefreshCcw
                className={`size-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Global Filter */}
      <div className="relative group max-w-2xl">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 group-focus-within:bg-white transition-colors" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="SEARCH_ACROSS_DOMAINS..."
          className="w-full bg-black border border-white/10 pl-12 pr-4 py-4 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-16">
        {/* NPM SECTION */}
        {(activeTab === 'both' || activeTab === 'npm') && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-white/20" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <Server className="size-3" /> 01. Nginx_Proxy_Manager_Hosts
              </h2>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNpm.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNpm(item)}
                  className="group p-5 bg-neutral-900/20 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black text-white uppercase tracking-widest truncate block">
                        {item.domain_names[0]}
                      </span>
                      <div className="text-[9px] mt-1.5 flex items-center gap-2 font-mono">
                        <span className="text-neutral-700 font-black uppercase tracking-tighter">
                          Target_Node
                        </span>
                        <span className="text-neutral-800">//</span>
                        <span className="text-neutral-400 font-bold">
                          {item.forward_host}:{item.forward_port}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${item.enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.ssl_forced && (
                      <span className="text-[8px] font-black border border-blue-500/30 text-blue-500 px-1.5 py-0.5">
                        SSL
                      </span>
                    )}
                    {item.http2_support && (
                      <span className="text-[8px] font-black border border-purple-500/30 text-purple-500 px-1.5 py-0.5">
                        H2
                      </span>
                    )}
                    {item.allow_websocket_upgrade && (
                      <span className="text-[8px] font-black border border-emerald-500/30 text-emerald-500 px-1.5 py-0.5">
                        WBS
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!loading && filteredNpm.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 text-neutral-600 uppercase text-[9px] tracking-widest">
                  No_Npm_Matches_Found
                </div>
              )}
            </div>
          </section>
        )}

        {/* PANGOLIN SECTION */}
        {(activeTab === 'both' || activeTab === 'pangolin') && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-white/20" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <ShieldCheck className="size-3" /> 02. Pangolin_Gateway_Resources
              </h2>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPangolin.map((item) => (
                <div
                  key={item.resourceId}
                  onClick={() => setSelectedPangolin(item)}
                  className="group p-5 bg-neutral-900/20 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black text-white uppercase tracking-widest truncate block">
                        {item.name}
                      </span>
                      <div className="text-[9px] mt-1.5 flex items-center gap-2 font-mono">
                        <span className="text-neutral-700 font-black uppercase tracking-tighter">
                          Gateway_Route
                        </span>
                        <span className="text-neutral-800">//</span>
                        <span className="text-neutral-400 font-bold">{item.fullDomain}</span>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${item.enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.ssl && (
                      <span className="text-[8px] font-black border border-blue-500/30 text-blue-500 px-1.5 py-0.5">
                        SSL
                      </span>
                    )}
                    {item.sso && (
                      <span className="text-[8px] font-black border border-emerald-500/30 text-emerald-500 px-1.5 py-0.5">
                        SSO
                      </span>
                    )}
                    {item.passwordId && (
                      <span className="text-[8px] font-black border border-amber-500/30 text-amber-500 px-1.5 py-0.5">
                        AUTH
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!loading && filteredPangolin.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 text-neutral-600 uppercase text-[9px] tracking-widest">
                  No_Pangolin_Matches_Found
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Inspection Overlay */}
      {(selectedNpm || selectedPangolin) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div
            className="w-full max-w-2xl bg-black border border-white/20 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
              <div className="grid gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                    {selectedNpm ? 'NPM_HOST_INSPECTOR' : 'PGLN_RESOURCE_INSPECTOR'}
                  </h2>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                  {selectedNpm ? selectedNpm.domain_names[0] : selectedPangolin?.fullDomain}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedNpm(null)
                  setSelectedPangolin(null)
                }}
                className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
              >
                <X className="size-4" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-12">
                {selectedNpm && (
                  <>
                    <KeyValueSection title="01. Host_Network_Identity">
                      <KeyValueRow label="Internal_ID" value={selectedNpm.id} mono />
                      <KeyValueRow label="Primary_Domain" value={selectedNpm.domain_names[0]} />
                      <KeyValueRow
                        label="Alias_Domains"
                        value={selectedNpm.domain_names.slice(1).join(', ') || 'NONE'}
                      />
                      <KeyValueRow
                        label="Target_Endpoint"
                        value={`${selectedNpm.forward_host}:${selectedNpm.forward_port}`}
                        mono
                      />
                      <KeyValueRow
                        label="Status"
                        value={<StatusBadge status={selectedNpm.enabled} />}
                      />
                    </KeyValueSection>

                    <KeyValueSection title="02. Encryption_Policy">
                      <KeyValueRow
                        label="Forced_SSL"
                        value={<StatusBadge status={selectedNpm.ssl_forced} />}
                      />
                      <KeyValueRow
                        label="HSTS_Enabled"
                        value={<StatusBadge status={selectedNpm.hsts_enabled} />}
                      />
                      <KeyValueRow
                        label="HTTP2_Multiplexing"
                        value={<StatusBadge status={selectedNpm.http2_support} />}
                      />
                    </KeyValueSection>

                    <KeyValueSection title="03. Protocol_Headers">
                      <KeyValueRow
                        label="Websocket_Bridge"
                        value={<StatusBadge status={selectedNpm.allow_websocket_upgrade} />}
                      />
                      <KeyValueRow
                        label="Content_Caching"
                        value={<StatusBadge status={selectedNpm.caching_enabled} />}
                      />
                      <KeyValueRow
                        label="Exploit_Filter"
                        value={<StatusBadge status={selectedNpm.block_exploits} />}
                      />
                    </KeyValueSection>
                  </>
                )}

                {selectedPangolin && (
                  <>
                    <KeyValueSection title="01. Gateway_Configuration">
                      <KeyValueRow label="Resource_ID" value={selectedPangolin.resourceId} mono />
                      <KeyValueRow label="Nice_ID" value={selectedPangolin.niceId} />
                      <KeyValueRow label="Resource_Label" value={selectedPangolin.name} />
                      <KeyValueRow
                        label="Transport"
                        value={selectedPangolin.protocol.toUpperCase()}
                        mono
                      />
                      <KeyValueRow
                        label="Status"
                        value={<StatusBadge status={selectedPangolin.enabled} />}
                      />
                    </KeyValueSection>

                    <KeyValueSection title="02. Backend_Infrastructure">
                      {selectedPangolin.targets.map((target, idx) => (
                        <div
                          key={target.targetId}
                          className={`space-y-3 ${idx > 0 ? 'pt-6 border-t border-white/5 mt-6' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                              <Server className="size-3 text-neutral-600" /> Target_Cluster_
                              {idx + 1}
                            </span>
                            <span
                              className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${
                                target.healthStatus === 'healthy'
                                  ? 'border-emerald-500/30 text-emerald-500'
                                  : 'border-red-500/30 text-red-500'
                              }`}
                            >
                              {target.healthStatus}
                            </span>
                          </div>
                          <KeyValueRow
                            label="Cluster_Endpoint"
                            value={`${target.ip}:${target.port}`}
                            mono
                          />
                          <KeyValueRow
                            label="Node_Enabled"
                            value={<StatusBadge status={target.enabled} />}
                          />
                        </div>
                      ))}
                    </KeyValueSection>

                    <KeyValueSection title="03. Auth_&_Security">
                      <KeyValueRow
                        label="SSL_Encryption"
                        value={<StatusBadge status={selectedPangolin.ssl} />}
                      />
                      <KeyValueRow
                        label="SSO_Integration"
                        value={<StatusBadge status={selectedPangolin.sso} />}
                      />
                      <KeyValueRow
                        label="IP_Whitelist"
                        value={<StatusBadge status={selectedPangolin.whitelist} />}
                      />
                      <KeyValueRow
                        label="Auth_Source_ID"
                        value={selectedPangolin.passwordId || 'EXTERNAL'}
                        mono
                      />
                    </KeyValueSection>
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedNpm(null)
                  setSelectedPangolin(null)
                }}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                Close_Inspector
              </button>
              <button
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-2"
                onClick={() => {
                  const url = selectedNpm
                    ? `http://${selectedNpm.domain_names[0]}`
                    : `https://${selectedPangolin?.fullDomain}`
                  window.open(url, '_blank')
                }}
              >
                <ExternalLink className="size-3.5" />
                Launch_Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProxyManager
