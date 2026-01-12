import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import {
  SearchIcon,
  Loader2,
  LaptopIcon,
  CpuIcon,
  HardDriveIcon,
  NetworkIcon,
  AppWindowIcon,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { LabeledInput } from '@/components/ui/labeled-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Types based on the provided JSON structure
interface ComputerSummary {
  id: number
  Name: string
  PrimaryOwnerName: string | null
  Domain: string
  TotalPhysicalMemory: number
  Model: string
  Manufacturer: string
  ip: string
}

interface ComputerSystem {
  Name: string
  Domain: string
  TotalPhysicalMemory: number
  Model: string
  Manufacturer: string
}

interface NetworkIdentity {
  id: number
  Description: string
  MACAddress: string
  IPAddress: string
  DateId: number
  ComputerSystemId: number
}

interface WinInfoData {
  OperatingSystem: {
    Caption: string
    OSArchitecture: string
    Version: string
  }
  Processor: {
    Name: string
    NumberOfCores: number
    MaxClockSpeed: number
  }
  BIOS: {
    SMBIOSBIOSVersion: string
    SerialNumber: string
  }
  BaseBoard: {
    Product: string
    SerialNumber: string
  }
  PhysicalMemory: Array<{
    DeviceLocator: string
    Capacity: number
    Speed: number
  }>
  NetworkIdentity: NetworkIdentity[]
  DiskDrive: Array<{
    DeviceID: string
    Model: string
    Size: number
  }>
  RunningServices: Array<{
    id: number
    Name: string
    DisplayName: string
    Status: string
    StartType: string
    DateId: number
    ComputerSystemId: number
  }>
  InstalledApplications: Array<{
    DisplayName: string
    DisplayVersion: string
    Publisher: string
  }>
}

interface WinInfoResponse {
  computerSystem: ComputerSystem
  date: string
  data: WinInfoData
}

export default function ComputerDetailsCard() {
  const [data, setData] = React.useState<WinInfoResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchType, setSearchType] = React.useState<'name' | 'ip'>('name')
  const [searchValue, setSearchValue] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('system')

  // Autocomplete state
  const [computersList, setComputersList] = React.useState<ComputerSummary[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    const fetchComputers = async () => {
      try {
        const response = await axios.get('/api/v0/win-info/computers')
        if (Array.isArray(response.data)) {
          setComputersList(response.data)
        }
      } catch (err) {
        console.error('Error fetching computers list:', err)
      }
    }
    fetchComputers()
  }, [])

  const filteredSuggestions = React.useMemo(() => {
    if (!searchValue || searchValue.length < 1) return []
    const lowerSearch = searchValue.toLowerCase()
    return computersList
      .filter((c) => {
        if (searchType === 'name') {
          return c.Name?.toLowerCase().includes(lowerSearch)
        } else {
          return c.ip?.includes(lowerSearch)
        }
      })
      .slice(0, 5) // Limit suggestions
  }, [computersList, searchValue, searchType])

  const fetchData = React.useCallback(async () => {
    if (!searchValue.trim()) {
      setError('Introduce un valor para buscar.')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const params = new URLSearchParams()
      if (searchType === 'name') {
        params.append('name', searchValue.trim())
      } else {
        params.append('ip', searchValue.trim())
      }

      const url = `/api/v0/win-info?${params.toString()}`
      const response = await axios.get(url)
      setData(response.data)
      if (response.data) {
        setIsModalOpen(true)
      }
    } catch (e: any) {
      console.error(e)
      setError(
        e?.response?.data?.message || e?.message || 'Error al obtener la información del equipo'
      )
    } finally {
      setLoading(false)
    }
  }, [searchType, searchValue])

  const handleExport = () => {
    if (!searchValue.trim()) return
    const params = new URLSearchParams()
    if (searchType === 'name') {
      params.append('name', searchValue.trim())
    } else {
      params.append('ip', searchValue.trim())
    }
    params.append('excel', 'true')
    const url = `/api/v0/win-info?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData()
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (value: string) => {
    setSearchValue(value)
    setShowSuggestions(false)
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return '-'
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(2)} GB`
  }

  return (
    <>
      <InfoCard
        title="Full_WMI_Details"
        description="Obtén información detallada de hardware y software (WMI)"
        icon={LaptopIcon}
        headerAction={
          <button
            onClick={handleExport}
            disabled={loading || !searchValue.trim()}
            title="Exportar a Excel"
            className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="size-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:w-auto">
                <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter mb-2 block">
                  Search_Mode
                </span>
                <div className="flex p-1 bg-white/5 border border-white/5">
                  <button
                    onClick={() => {
                      setSearchType('name')
                      setSearchValue('')
                    }}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      searchType === 'name'
                        ? 'bg-white text-black'
                        : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => {
                      setSearchType('ip')
                      setSearchValue('')
                    }}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      searchType === 'ip'
                        ? 'bg-white text-black'
                        : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    IP
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full relative">
                <LabeledInput
                  id="searchValue"
                  label={searchType === 'name' ? 'Node Name' : 'IPv4 Address'}
                  placeholder={searchType === 'name' ? 'Ej: DESKTOP-01' : 'Ej: 172.19.3.17'}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-neutral-900 border border-white/20 shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredSuggestions.map((computer) => {
                        const displayValue = searchType === 'name' ? computer.Name : computer.ip
                        const subValue = searchType === 'name' ? computer.ip : computer.Name
                        return (
                          <div
                            key={computer.id}
                            className="flex flex-col px-3 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-colors"
                            onClick={() => selectSuggestion(displayValue)}
                          >
                            <span className="truncate">{displayValue}</span>
                            {subValue && (
                              <span className="text-[8px] text-neutral-500 font-normal">
                                {subValue}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full sm:w-auto min-w-[100px] px-4 py-2 border border-white/10 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 size-4" />
                )}
                Query
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
              {error}
            </div>
          )}

          {data && (
            <button
              className="w-full px-4 py-2 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              View Full Node Data
            </button>
          )}
        </div>
      </InfoCard>

      {/* Raw Overlay Modal */}
      {isModalOpen && data && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[900px] bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <LaptopIcon className="size-4 text-white" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                    {data.computerSystem.Name}
                  </h2>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  {data.computerSystem.Domain} // {data.data.NetworkIdentity?.[0]?.IPAddress}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Internal Tabs - Industrial */}
              <div className="p-6 pb-0">
                <div className="flex p-1 bg-white/5 border border-white/5 overflow-x-auto">
                  {['system', 'hardware', 'storage', 'services', 'software'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-[100px] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab
                          ? 'bg-white text-black'
                          : 'text-neutral-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="animate-in fade-in duration-300">
                    {activeTab === 'system' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Operating System
                            </span>
                            <div className="text-sm font-bold text-white">
                              {data.data.OperatingSystem.Caption}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {data.data.OperatingSystem.OSArchitecture} // v
                              {data.data.OperatingSystem.Version}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Processor
                            </span>
                            <div className="text-sm font-bold text-white">
                              {data.data.Processor.Name}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {data.data.Processor.NumberOfCores} Cores @{' '}
                              {data.data.Processor.MaxClockSpeed}MHz
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Memory Pool
                            </span>
                            <div className="text-sm font-bold text-white">
                              {formatBytes(data.computerSystem.TotalPhysicalMemory)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Hardware Model
                            </span>
                            <div className="text-sm font-bold text-white">
                              {data.computerSystem.Model}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {data.computerSystem.Manufacturer}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              BIOS_FIRMWARE
                            </span>
                            <div className="text-[11px] font-mono text-neutral-300">
                              VER: {data.data.BIOS.SMBIOSBIOSVersion}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-300">
                              SN: {data.data.BIOS.SerialNumber}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                              Mainboard
                            </span>
                            <div className="text-[11px] font-mono text-neutral-300">
                              PRODUCT: {data.data.BaseBoard.Product}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-300">
                              SN: {data.data.BaseBoard.SerialNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'hardware' && (
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <CpuIcon className="size-3" /> Memory_Modules
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.data.PhysicalMemory.map((mem, i) => (
                              <div key={i} className="p-4 border border-white/10 bg-white/5">
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                  {mem.DeviceLocator}
                                </div>
                                <div className="text-sm font-bold text-white">
                                  {formatBytes(mem.Capacity)}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {mem.Speed} MHz
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <NetworkIcon className="size-3" /> Network_Interfaces
                          </h4>
                          <div className="space-y-4">
                            {data.data.NetworkIdentity.map((net, i) => (
                              <div key={i} className="p-4 border border-white/10 bg-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-tighter block mb-1">
                                      IPv4 Address
                                    </span>
                                    <span className="font-mono text-emerald-500">
                                      {net.IPAddress}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-tighter block mb-1">
                                      MAC Address
                                    </span>
                                    <span className="font-mono text-white">{net.MACAddress}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-tighter block mb-1">
                                      Interface Description
                                    </span>
                                    <span className="text-[11px] text-neutral-300">
                                      {net.Description}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'storage' && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <HardDriveIcon className="size-3" /> Storage_Units
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>DevID</TableHead>
                              <TableHead>Model</TableHead>
                              <TableHead className="text-right">Capacity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.data.DiskDrive.map((disk, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-white">{disk.DeviceID}</TableCell>
                                <TableCell className="text-neutral-500">{disk.Model}</TableCell>
                                <TableCell className="text-right font-bold text-emerald-500">
                                  {formatBytes(disk.Size)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {activeTab === 'services' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <AppWindowIcon className="size-3" /> Services_Active
                          </h4>
                          <Badge variant="secondary">
                            {data.data.RunningServices?.length || 0} Total
                          </Badge>
                        </div>
                        <div className="border border-white/10">
                          <Table>
                            <TableHeader className="sticky top-0 z-10">
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.data.RunningServices?.map((service) => (
                                <TableRow key={service.id}>
                                  <TableCell className="text-neutral-400">{service.Name}</TableCell>
                                  <TableCell className="text-white">
                                    {service.DisplayName}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        service.Status === 'Running' ? 'success' : 'secondary'
                                      }
                                    >
                                      {service.Status.toUpperCase()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-neutral-500">
                                    {service.StartType}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {activeTab === 'software' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                            <AppWindowIcon className="size-3" /> Installed_Software
                          </h4>
                          <Badge variant="secondary">
                            {data.data.InstalledApplications.length} Total
                          </Badge>
                        </div>
                        <div className="border border-white/10">
                          <Table>
                            <TableHeader className="sticky top-0 z-10">
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Version</TableHead>
                                <TableHead>Publisher</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.data.InstalledApplications.map((app, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-bold text-white uppercase">
                                    {app.DisplayName}
                                  </TableCell>
                                  <TableCell className="text-neutral-500">
                                    {app.DisplayVersion || '-'}
                                  </TableCell>
                                  <TableCell className="text-neutral-600">
                                    {app.Publisher || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
