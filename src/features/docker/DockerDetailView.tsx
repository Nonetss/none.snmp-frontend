import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Box,
  Server,
  Layers,
  Activity,
  Cpu,
  Database,
  ExternalLink,
  ChevronLeft,
  RefreshCcw,
  Shield,
  Package,
  Clock,
  Network,
  HardDrive,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface KomodoServerDetail {
  id: string
  name: string
  description: string
  tags: string[]
  state: string
  config: {
    address: string
    external_address: string
    region: string
    enabled: boolean
    timeout_seconds: number
    stats_monitoring: boolean
    auto_prune: boolean
  }
  updated_at: number
  stacks: {
    id: string
    name: string
    state: string
    status: string
    services: {
      service: string
      image: string
      update_available: boolean
    }[]
  }[]
  containers: {
    id: string
    name: string
    image: string
    state: string
    status: string
    created: number
    image_id: string
  }[]
}

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

const StatusBadge = ({ state }: { state?: string }) => {
  const isUp =
    state?.toLowerCase() === 'running' ||
    state?.toLowerCase() === 'up' ||
    state?.toLowerCase() === 'online' ||
    state?.toLowerCase() === 'healthy'
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isUp ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-neutral-500 border-white/10 bg-white/5'}`}
    >
      <div
        className={`size-1.5 rounded-full ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`}
      />
      <span className="text-[9px] font-black uppercase tracking-widest">{state || 'UNKNOWN'}</span>
    </div>
  )
}

interface Props {
  serverId: string
}

const DockerDetailView: React.FC<Props> = ({ serverId }) => {
  const [data, setData] = useState<KomodoServerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveTab] = useState<'overview' | 'stacks' | 'containers'>('overview')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get<KomodoServerDetail>(`/api/v0/komodo/server/${serverId}`)
      setData(response.data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch node telemetry')
    } finally {
      setLoading(false)
    }
  }, [serverId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white font-mono">
        <RefreshCcw className="w-12 h-12 animate-spin text-neutral-800 mb-4" />
        <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">
          Syncing_Node_Telemetry...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-red-500 font-mono p-8">
        <div className="max-w-md w-full border border-red-900/50 bg-red-900/10 p-8 space-y-4">
          <Shield className="w-12 h-12 mx-auto opacity-50" />
          <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-widest mb-2">Access Denied</h2>
            <p className="text-xs text-red-400 font-bold uppercase">
              {error || 'Node context lost'}
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/container')}
            className="w-full py-3 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            Return_To_Base
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col animate-in fade-in duration-500">
      {/* Detail Header */}
      <header className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto p-6 flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <a
              href="/container"
              className="p-2.5 border border-white/10 hover:bg-white hover:text-black transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </a>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-white" />
                <h1 className="text-xl font-black uppercase tracking-[0.2em] truncate max-w-md">
                  {data.name}
                </h1>
                <StatusBadge state={data.state} />
              </div>
              <div className="flex gap-4 text-[9px] text-neutral-500 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <Network className="size-3" /> {data.config.address}
                </span>
                <span className="text-neutral-800">|</span>
                <span>ID: {data.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="flex p-1 bg-black border border-white/5">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'stacks', label: 'Stacks', icon: Layers },
                { id: 'containers', label: 'Containers', icon: Package },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeSection === tab.id
                      ? 'bg-white text-black'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 border border-white/10 hover:bg-white hover:text-black"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 pb-24">
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in slide-in-from-bottom-2">
            <div className="lg:col-span-2 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">
                    01 // Identity_Specs
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900/20 border border-white/5 p-8">
                  <KeyValueSection title="Network Configuration">
                    <KeyValueRow label="Internal Address" value={data.config.address} mono />
                    <KeyValueRow
                      label="External IP"
                      value={data.config.external_address || 'NONE'}
                      mono
                    />
                    <KeyValueRow label="Region" value={data.config.region || 'DEFAULT'} />
                  </KeyValueSection>
                  <KeyValueSection title="Operational Context">
                    <KeyValueRow
                      label="Node Description"
                      value={data.description || 'NOT_DEFINED'}
                    />
                    <KeyValueRow label="Enabled" value={data.config.enabled ? 'YES' : 'NO'} />
                    <KeyValueRow
                      label="Auto Prune"
                      value={data.config.auto_prune ? 'ACTIVE' : 'DISABLED'}
                    />
                  </KeyValueSection>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">
                    02 // Resource_Summary
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 bg-white/[0.02] border border-white/5 space-y-2">
                    <Layers className="size-4 text-neutral-500" />
                    <div className="text-2xl font-black text-white">{data.stacks.length}</div>
                    <div className="text-[9px] text-neutral-600 uppercase font-black">
                      Active Stacks
                    </div>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 space-y-2">
                    <Package className="size-4 text-neutral-500" />
                    <div className="text-2xl font-black text-white">{data.containers.length}</div>
                    <div className="text-[9px] text-neutral-600 uppercase font-black">
                      Running Units
                    </div>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 space-y-2">
                    <Clock className="size-4 text-neutral-500" />
                    <div className="text-[10px] font-bold text-white uppercase truncate">
                      {new Date(data.updated_at * 1000).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-neutral-600 uppercase font-black">
                      Last Sync
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-8">
              <div className="p-6 border border-white/10 bg-neutral-900/40 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <Shield className="size-3.5" /> Node_Compliance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">
                      Telemetry
                    </span>
                    <Badge variant={data.config.stats_monitoring ? 'success' : 'secondary'}>
                      {data.config.stats_monitoring ? 'STREAMING' : 'OFFLINE'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">
                      Security
                    </span>
                    <Badge
                      variant="outline"
                      className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                    >
                      ENCRYPTED
                    </Badge>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 border border-white/5 bg-white/5 text-[8px] font-black text-neutral-500 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeSection === 'stacks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2">
            {data.stacks.map((stack) => (
              <div
                key={stack.id}
                className="p-6 border border-white/5 bg-neutral-900/20 space-y-6 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      {stack.name}
                    </h3>
                    <div className="text-[9px] text-neutral-600 font-mono">
                      HASH: {stack.id.slice(0, 8)}
                    </div>
                  </div>
                  <StatusBadge state={stack.state} />
                </div>

                <div className="space-y-3">
                  <div className="text-[9px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-white/30" /> Services_Manifest
                  </div>
                  <div className="grid gap-2">
                    {stack.services.map((svc) => (
                      <div
                        key={svc.service}
                        className="flex justify-between items-center p-2 bg-black/40 border border-white/5"
                      >
                        <span className="text-[10px] text-white font-bold">{svc.service}</span>
                        {svc.update_available && (
                          <span className="text-[8px] text-amber-500 font-black uppercase flex items-center gap-1">
                            <Activity className="size-2.5" /> update
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {data.stacks.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 text-neutral-700 uppercase text-[10px] tracking-widest">
                No_Stacks_Deployed_On_This_Node
              </div>
            )}
          </div>
        )}

        {activeSection === 'containers' && (
          <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-[9px] font-black uppercase text-neutral-600 border-b border-white/5">
              <div className="col-span-4">Unit_Identity</div>
              <div className="col-span-4">Image_Source</div>
              <div className="col-span-2 text-center">Runtime_State</div>
              <div className="col-span-2 text-right">Created_Epoch</div>
            </div>
            {data.containers.map((container) => (
              <div
                key={container.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-900/20 border border-white/5 items-center hover:bg-white/5 transition-all group"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="p-2 border border-white/5 bg-white/[0.01]">
                    <Box className="size-4 text-neutral-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {container.name}
                    </span>
                    <span className="text-[9px] text-neutral-600 font-mono mt-0.5">
                      ID: {container.id.slice(0, 12)}
                    </span>
                  </div>
                </div>
                <div className="col-span-4 truncate text-[10px] text-neutral-400 font-mono">
                  {container.image}
                </div>
                <div className="col-span-2 flex justify-center">
                  <StatusBadge state={container.state} />
                </div>
                <div className="col-span-2 text-right text-[10px] text-neutral-500 font-mono">
                  {new Date(container.created * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
            {data.containers.length === 0 && (
              <div className="py-20 text-center border border-dashed border-white/10 text-neutral-700 uppercase text-[10px] tracking-widest">
                No_Units_Running_On_This_Node
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-neutral-950 border-t border-white/10 flex items-center px-8 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="size-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
              Link_Established
            </span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <div className="text-[9px] font-black text-neutral-600 uppercase">
            Protocol: Komodo_V1 // Mode: Full_Inspection
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DockerDetailView
