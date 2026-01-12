import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import {
  AppWindowIcon,
  SearchIcon,
  Loader2,
  ChevronDownIcon,
  FileSpreadsheet,
  X,
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

interface Computer {
  id: number
  Name: string
  Model: string
  ip: string
  // Optional fields that might be returned
  PrimaryOwnerName?: string | null
  Domain?: string
  TotalPhysicalMemory?: number
  Manufacturer?: string
}

export default function ComputerByAppCard() {
  const [data, setData] = React.useState<Computer[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [appName, setAppName] = React.useState('')
  const [installed, setInstalled] = React.useState('true')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [lastSearch, setLastSearch] = React.useState('')
  const [appList, setAppList] = React.useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    const fetchAppList = async () => {
      try {
        const response = await axios.get('/api/v0/win-info/computers/applications/list')
        if (Array.isArray(response.data)) {
          setAppList(response.data)
        }
      } catch (error) {
        console.error('Error fetching app list:', error)
      }
    }
    fetchAppList()
  }, [])

  const filteredSuggestions = React.useMemo(() => {
    if (!appName) return []
    return appList.filter((app) => app.toLowerCase().includes(appName.toLowerCase())).slice(0, 50)
  }, [appName, appList])

  const selectSuggestion = (app: string) => {
    setAppName(app)
    setShowSuggestions(false)
  }

  const fetchData = React.useCallback(async () => {
    if (!appName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const url = '/api/v0/win-info/computers/by-application'
      const response = await axios.get(url, {
        params: {
          appName: appName.trim(),
          installed: installed,
        },
      })

      let results: Computer[] = []
      if (Array.isArray(response.data)) {
        results = response.data
      } else if (response.data && Array.isArray(response.data.computers)) {
        results = response.data.computers
      } else {
        results = []
      }

      setData(results)
      setLastSearch(`${appName} (${installed === 'true' ? 'Instalada' : 'No instalada'})`)

      if (results.length > 0) {
        setIsModalOpen(true)
      }
    } catch (e: any) {
      console.error('Error fetching data:', e)
      setError(
        e?.response?.data?.message || e?.message || 'Error fetching computers by application'
      )
    } finally {
      setLoading(false)
    }
  }, [appName, installed])

  const handleExport = () => {
    if (!appName.trim()) return
    const params = new URLSearchParams()
    params.append('appName', appName.trim())
    params.append('installed', installed)
    params.append('excel', 'true')
    const url = `/api/v0/win-info/computers/by-application?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData()
      setShowSuggestions(false)
    }
  }

  return (
    <>
      <InfoCard
        title="Search_By_Application"
        description="Encuentra ordenadores que tienen (o no) una aplicación instalada"
        icon={AppWindowIcon}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-4 items-end">
            <div className="relative w-full">
              <LabeledInput
                id="appName"
                label="Nombre de la Aplicación"
                placeholder="Ej: Google Chrome"
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value)
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
                    {filteredSuggestions.map((app, index) => (
                      <div
                        key={`${app}-${index}`}
                        className="flex flex-col px-3 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-colors"
                        onClick={() => selectSuggestion(app)}
                      >
                        <span className="truncate">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-1.5 w-full ">
              <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                Estado
              </span>
              <div className="relative">
                <select
                  id="installed"
                  value={installed}
                  onChange={(e) => setInstalled(e.target.value)}
                  className="flex h-9 w-full appearance-none items-center justify-between border border-white/10 bg-black px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="true">Instalada</option>
                  <option value="false">No Instalada</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex-1 sm:w-auto px-4 py-2 border border-white/10 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}
                Query
              </button>
              <button
                onClick={handleExport}
                disabled={loading || !appName.trim()}
                title="Exportar a Excel"
                className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
              {error}
            </div>
          )}

          {!loading && !error && data.length === 0 && lastSearch && (
            <div className="text-center p-4 text-neutral-500 bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest">
              No results for: {lastSearch}
            </div>
          )}

          {data.length > 0 && (
            <button
              className="w-full px-4 py-2 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              Ver últimos resultados ({data.length})
            </button>
          )}
        </div>
      </InfoCard>

      {/* Raw Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[700px] bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  Search.Results()
                </h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  {lastSearch}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden border-b border-white/5">
              <ScrollArea className="h-full max-h-[500px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10">
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead className="text-right">ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((computer) => (
                      <TableRow key={computer.id}>
                        <TableCell className="font-bold text-white uppercase">
                          {computer.Name}
                        </TableCell>
                        <TableCell className="text-neutral-500">{computer.Model}</TableCell>
                        <TableCell className="text-emerald-500">{computer.ip}</TableCell>
                        <TableCell className="text-right text-neutral-600">{computer.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
            <div className="p-4 bg-white/5 flex justify-end">
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
