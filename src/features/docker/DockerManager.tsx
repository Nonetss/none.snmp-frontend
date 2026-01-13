import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import {
  Box,
  Server,
  Layers,
  Search,
  RefreshCcw,
  Activity,
  Cpu,
  Database,
  ExternalLink,
  ChevronRight,
  X,
  Package,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface KomodoServer {
  id: string
  name: string
  description: string
  tags: string[]
  state?: string
  config: {
    address: string
    external_address: string
    enabled: boolean
  }
}

interface KomodoStack {
  id: string
  name: string
  tags: string[]
  info: {
    server_id: string
    state: string
    status: string
    services: {
      service: string
      image: string
      update_available: boolean
    }[]
  }
}

interface KomodoContainer {
  id: string
  name: string
  serverId: string
  image: string
  state: string
  status: string
  stats?: {
    cpu_perc: string
    mem_perc: string
    mem_usage: string
  }
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
    state?.toLowerCase() === 'online'
  return (
    <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-neutral-500'}`}>
      <div
        className={`size-1.5 rounded-full ${isUp ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`}
      />
      <span className="text-[10px] font-black uppercase tracking-tighter">
        {state || 'UNKNOWN'}
      </span>
    </div>
  )
}

type TabId = 'servers' | 'stacks' | 'containers'

const DockerManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('servers')
  const [servers, setServers] = useState<KomodoServer[]>([])
  const [stacks, setStacks] = useState<KomodoStack[]>([])
  const [containers, setContainers] = useState<KomodoContainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedServer, setSelectedServer] = useState<KomodoServer | null>(null)
  const [selectedStack, setSelectedStack] = useState<KomodoStack | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<KomodoContainer | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [serversRes, stacksRes, containersRes] = await Promise.all([
        axios.get<KomodoServer[]>('/api/v0/komodo/server'),
        axios.get<KomodoStack[]>('/api/v0/komodo/stacks'),
        axios.get<KomodoContainer[]>('/api/v0/komodo/container'),
      ])
      setServers(serversRes.data || [])
      setStacks(stacksRes.data || [])
      setContainers(containersRes.data || [])
    } catch (e: any) {
      console.error(e)
      setError('SYSTEM_FAILURE: Komodo telemetry offline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredServers = useMemo(() => {
    const q = search.toLowerCase()
    return servers.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    )
  }, [servers, search])

  const filteredStacks = useMemo(() => {
    const q = search.toLowerCase()
    return stacks.filter((s) => s.name.toLowerCase().includes(q))
  }, [stacks, search])

  const filteredContainers = useMemo(() => {
    const q = search.toLowerCase()
    return containers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.image.toLowerCase().includes(q)
    )
  }, [containers, search])

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Box className="w-5 h-5 text-white" />
            <h1 className="text-xl font-black tracking-[0.3em] uppercase">System.Docker-Core</h1>
          </div>
          <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
            Komodo Orchestration - Multi-Node Infrastructure Monitoring
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex p-1 bg-white/5 border border-white/5">
            {[
              { id: 'servers', label: 'Nodes', icon: Server },
              { id: 'stacks', label: 'Stacks', icon: Layers },
              { id: 'containers', label: 'Containers', icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
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

      {/* Global Filter */}
      <div className="relative group max-w-2xl">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 group-focus-within:bg-white transition-colors" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder={`SEARCH_ACROSS_${activeTab.toUpperCase()}...`}
          className="w-full bg-black border border-white/10 pl-12 pr-4 py-4 text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-white/30 transition-all placeholder:text-neutral-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4 opacity-50">
          <div className="h-[1px] w-8 bg-white/10" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">
            Deployment_Registry // {activeTab.toUpperCase()}
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeTab === 'servers' &&
            filteredServers.map((server) => (
              <div
                key={server.id}
                onClick={() => (window.location.href = `/container/${server.id}`)}
                className="group p-6 bg-neutral-900/20 border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest truncate block">
                      {server.name}
                    </span>
                    <div className="text-[9px] mt-1.5 flex items-center gap-2 font-mono">
                      <span className="text-neutral-700 font-black uppercase tracking-tighter">
                        Endpoint
                      </span>
                      <span className="text-neutral-800">//</span>
                      <span className="text-neutral-400 font-bold">{server.config.address}</span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${server.state === 'online' || server.config.enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {server.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] font-black border border-white/10 text-neutral-500 px-1.5 py-0.5 uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-300" />
              </div>
            ))}

          {activeTab === 'stacks' &&
            filteredStacks.map((stack) => (
              <div
                key={stack.id}
                onClick={() => setSelectedStack(stack)}
                className="group p-6 bg-neutral-900/20 border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest truncate block">
                      {stack.name}
                    </span>
                    <div className="text-[9px] mt-1.5 flex items-center gap-2 font-mono">
                      <span className="text-neutral-700 font-black uppercase tracking-tighter">
                        Fleet_Units
                      </span>
                      <span className="text-neutral-800">//</span>
                      <span className="text-neutral-400 font-bold">
                        {stack.info.services.length} SVCS
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${stack.info.state === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stack.info.services.some((s) => s.update_available) && (
                    <span className="text-[8px] font-black border border-amber-500/30 text-amber-500 px-1.5 py-0.5 uppercase shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      UPDATE_PENDING
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-300" />
              </div>
            ))}

          {activeTab === 'containers' &&
            filteredContainers.map((container) => (
              <div
                key={container.id}
                onClick={() => setSelectedContainer(container)}
                className="group p-6 bg-neutral-900/20 border border-white/5 hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest truncate block">
                      {container.name}
                    </span>
                    <div className="text-[9px] mt-1.5 flex items-center gap-2 font-mono">
                      <span className="text-neutral-700 font-black uppercase tracking-tighter">
                        Image
                      </span>
                      <span className="text-neutral-800">//</span>
                      <span className="text-neutral-400 font-bold truncate max-w-[120px]">
                        {container.image}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${container.state === 'running' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`}
                  />
                </div>
                {container.stats && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">
                        CPU_Load
                      </span>
                      <div className="text-[10px] font-bold text-white font-mono">
                        {container.stats.cpu_perc}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">
                        MEM_Load
                      </span>
                      <div className="text-[10px] font-bold text-white font-mono">
                        {container.stats.mem_perc}
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-300" />
              </div>
            ))}

          {!loading &&
            ((activeTab === 'servers' && filteredServers.length === 0) ||
              (activeTab === 'stacks' && filteredStacks.length === 0) ||
              (activeTab === 'containers' && filteredContainers.length === 0)) && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 text-neutral-700 uppercase text-[10px] tracking-widest">
                No_{activeTab.toUpperCase()}_Detected_In_Archive
              </div>
            )}
        </div>
      </div>

      {/* Inspection Overlays */}
      {(selectedServer || selectedStack || selectedContainer) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div
            className="w-full max-w-2xl bg-black border border-white/20 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-6">
              <div className="grid gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white" />
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">
                    {selectedServer
                      ? 'NODE_INSPECTOR'
                      : selectedStack
                        ? 'STACK_INSPECTOR'
                        : 'CONTAINER_INSPECTOR'}
                  </h2>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                  {selectedServer?.name || selectedStack?.name || selectedContainer?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedServer(null)
                  setSelectedStack(null)
                  setSelectedContainer(null)
                }}
                className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
              >
                <X className="size-4" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-12">
                {selectedStack && (
                  <>
                    <KeyValueSection title="01. Stack_Control">
                      <KeyValueRow label="ID" value={selectedStack.id} mono />
                      <KeyValueRow
                        label="Status"
                        value={<StatusBadge state={selectedStack.info.status} />}
                      />
                      <KeyValueRow label="Server_Link" value={selectedStack.info.server_id} mono />
                    </KeyValueSection>
                    <KeyValueSection title="02. Services_Inventory">
                      {selectedStack.info.services.map((svc, idx) => (
                        <div
                          key={svc.service}
                          className={`space-y-1 ${idx > 0 ? 'pt-4 border-t border-white/5' : ''}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">
                              {svc.service}
                            </span>
                            {svc.update_available && (
                              <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 py-0.5 font-black">
                                UPDATE
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-neutral-500 font-mono truncate">
                            {svc.image}
                          </div>
                        </div>
                      ))}
                    </KeyValueSection>
                  </>
                )}

                {selectedContainer && (
                  <>
                    <KeyValueSection title="01. Runtime_Context">
                      <KeyValueRow label="ID" value={selectedContainer.id} mono />
                      <KeyValueRow label="Image" value={selectedContainer.image} />
                      <KeyValueRow
                        label="State"
                        value={<StatusBadge state={selectedContainer.state} />}
                      />
                      <KeyValueRow label="Status" value={selectedContainer.status} />
                    </KeyValueSection>
                    {selectedContainer.stats && (
                      <KeyValueSection title="02. Resource_Telemetry">
                        <KeyValueRow
                          label="CPU_Usage"
                          value={selectedContainer.stats.cpu_perc}
                          mono
                        />
                        <KeyValueRow
                          label="Memory_Percentage"
                          value={selectedContainer.stats.mem_perc}
                          mono
                        />
                        <KeyValueRow
                          label="Memory_Usage"
                          value={selectedContainer.stats.mem_usage}
                          mono
                        />
                      </KeyValueSection>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end">
              <button
                onClick={() => {
                  setSelectedStack(null)
                  setSelectedContainer(null)
                }}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                Dismiss_Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DockerManager
