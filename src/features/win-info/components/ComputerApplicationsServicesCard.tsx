import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import {
  AppWindowIcon,
  Loader2,
  SearchIcon,
  FileSpreadsheet,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

interface Computer {
  id: number
  name: string
}

interface ApplicationData {
  application: string
  publisher: string
  version: string
  computers: Computer[]
}

interface ServiceData {
  service: string
  displayName: string
  status: string
  startType: string
  computers: Computer[]
}

export default function ComputerApplicationsCard() {
  const [activeTab, setActiveTab] = React.useState('services')
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({})

  // Applications State
  const [appsData, setAppsData] = React.useState<ApplicationData[]>([])
  const [appsLoading, setAppsLoading] = React.useState(false)
  const [appsError, setAppsError] = React.useState<string | null>(null)
  const [appsFilter, setAppsFilter] = React.useState('')

  // Services State
  const [servicesData, setServicesData] = React.useState<ServiceData[]>([])
  const [servicesLoading, setServicesLoading] = React.useState(false)
  const [servicesError, setServicesError] = React.useState<string | null>(null)
  const [servicesFilter, setServicesFilter] = React.useState('')

  const fetchApplications = React.useCallback(async () => {
    setAppsLoading(true)
    setAppsError(null)
    try {
      const url = '/api/v0/win-info/computers/applications'
      const response = await axios.get(url)
      setAppsData(response.data)
    } catch (e: any) {
      console.error(e)
      setAppsError(e.message || 'Error fetching applications')
    } finally {
      setAppsLoading(false)
    }
  }, [])

  const fetchServices = React.useCallback(async () => {
    setServicesLoading(true)
    setServicesError(null)
    try {
      const url = '/api/v0/win-info/computers/services'
      const response = await axios.get(url)
      setServicesData(response.data)
    } catch (e: any) {
      console.error(e)
      setServicesError(e.message || 'Error fetching services')
    } finally {
      setServicesLoading(false)
    }
  }, [])

  const handleRefresh = () => {
    if (activeTab === 'applications') {
      fetchApplications()
    } else {
      fetchServices()
    }
  }

  const handleExport = () => {
    const endpoint = activeTab === 'applications' ? 'applications' : 'services'
    const filter = activeTab === 'applications' ? appsFilter : servicesFilter
    const url = `/api/v0/win-info/computers/${endpoint}?excel=true${filter ? `&search=${encodeURIComponent(filter)}` : ''}`
    window.open(url, '_blank')
  }

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  React.useEffect(() => {
    fetchApplications()
    fetchServices()
  }, [fetchApplications, fetchServices])

  const filteredApps = React.useMemo(() => {
    if (!appsFilter) return appsData
    const lowerFilter = appsFilter.toLowerCase()
    return appsData.filter(
      (app) =>
        app.application.toLowerCase().includes(lowerFilter) ||
        app.publisher?.toLowerCase().includes(lowerFilter) ||
        false
    )
  }, [appsData, appsFilter])

  const filteredServices = React.useMemo(() => {
    if (!servicesFilter) return servicesData
    const lowerFilter = servicesFilter.toLowerCase()
    return servicesData.filter(
      (svc) =>
        svc.service.toLowerCase().includes(lowerFilter) ||
        svc.displayName.toLowerCase().includes(lowerFilter) ||
        false
    )
  }, [servicesData, servicesFilter])

  return (
    <InfoCard
      title="Software_Services_Inventory"
      description="Listado de aplicaciones y servicios instalados en los equipos"
      icon={AppWindowIcon}
      headerAction={
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            title="Exportar a Excel"
            className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
          >
            <FileSpreadsheet className="size-4" />
          </button>
          <button
            onClick={handleRefresh}
            title="Refrescar"
            className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* Tabs Control - Industrial */}
        <div className="flex p-1 bg-white/5 border border-white/5">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'services'
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            Servicios
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'applications'
                ? 'bg-white text-black'
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            Aplicaciones
          </button>
        </div>

        {activeTab === 'applications' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                placeholder="Filtrar por nombre de aplicación o editor..."
                value={appsFilter}
                onChange={(e) => setAppsFilter(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {appsLoading && appsData.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 gap-4 border border-white/5 bg-white/5">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Fetching.Apps()
                </span>
              </div>
            )}

            {appsError && (
              <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
                Error: {appsError}
              </div>
            )}

            {!appsLoading && !appsError && filteredApps.length === 0 && (
              <div className="text-center p-12 text-neutral-500 uppercase text-[10px] tracking-widest border border-white/5 bg-white/5">
                {appsData.length === 0 ? 'No_Data_Available' : 'No_Matches_Found'}
              </div>
            )}

            {filteredApps.length > 0 && (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredApps.map((item, index) => {
                    const itemId = `app-${item.application}-${item.version}-${index}`
                    const isExpanded = expandedItems[itemId]
                    return (
                      <div
                        key={itemId}
                        className="border border-white/10 bg-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-all"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-widest text-white truncate">
                              {item.application}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-normal uppercase tracking-tighter">
                              {item.version && <span>v{item.version}</span>}
                              {item.publisher && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[150px]">{item.publisher}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="shrink-0">
                              {item.computers.length} Nodes
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-neutral-500" />
                            ) : (
                              <ChevronDown className="size-4 text-neutral-500" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-1">
                            <div className="flex flex-wrap gap-2 pt-4">
                              {item.computers.map((computer) => (
                                <Badge
                                  key={computer.id}
                                  variant="outline"
                                  className="text-white border-white/10 bg-white/5 font-mono text-[9px]"
                                >
                                  {computer.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <Input
                placeholder="Filtrar por servicio o nombre..."
                value={servicesFilter}
                onChange={(e) => setServicesFilter(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {servicesLoading && servicesData.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 gap-4 border border-white/5 bg-white/5">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                  Fetching.Services()
                </span>
              </div>
            )}

            {servicesError && (
              <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
                Error: {servicesError}
              </div>
            )}

            {!servicesLoading && !servicesError && filteredServices.length === 0 && (
              <div className="text-center p-12 text-neutral-500 uppercase text-[10px] tracking-widest border border-white/5 bg-white/5">
                {servicesData.length === 0 ? 'No_Data_Available' : 'No_Matches_Found'}
              </div>
            )}

            {filteredServices.length > 0 && (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredServices.map((item, index) => {
                    const itemId = `svc-${item.service}-${index}`
                    const isExpanded = expandedItems[itemId]
                    return (
                      <div
                        key={itemId}
                        className="border border-white/10 bg-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-all"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-widest text-white truncate">
                              {item.displayName || item.service}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-normal uppercase tracking-tighter">
                              <span>{item.service}</span>
                              <span>•</span>
                              <span
                                className={
                                  item.status === 'Running' ? 'text-emerald-500 font-bold' : ''
                                }
                              >
                                {item.status.toUpperCase()}
                              </span>
                              <span>•</span>
                              <span>{item.startType}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="shrink-0">
                              {item.computers.length} Nodes
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-neutral-500" />
                            ) : (
                              <ChevronDown className="size-4 text-neutral-500" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-white/5 bg-black/20 animate-in slide-in-from-top-1">
                            <div className="flex flex-wrap gap-2 pt-4">
                              {item.computers.map((computer) => (
                                <Badge
                                  key={computer.id}
                                  variant="outline"
                                  className="text-white border-white/10 bg-white/5 font-mono text-[9px]"
                                >
                                  {computer.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </InfoCard>
  )
}
