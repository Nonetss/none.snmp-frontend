import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import { HardDriveIcon, SearchIcon, Loader2, FileSpreadsheet, X } from 'lucide-react'
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

interface ComputerStorage {
  id: number
  Name: string
  Domain: string
  Manufacturer: string
  Model: string
  totalStorageBytes: string
  totalStorageGB: number
  ip: string
}

export default function ComputerStorageCard() {
  const [data, setData] = React.useState<ComputerStorage[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [minStorage, setMinStorage] = React.useState<string>('')
  const [maxStorage, setMaxStorage] = React.useState<string>('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [lastSearch, setLastSearch] = React.useState('')

  const fetchData = React.useCallback(async () => {
    if (!minStorage && !maxStorage) {
      setError('Introduce al menos un valor para buscar.')
      return
    }

    setLoading(true)
    setError(null)
    setData([])

    try {
      const params = new URLSearchParams()
      if (minStorage) params.append('minStorage', minStorage)
      if (maxStorage) params.append('maxStorage', maxStorage)

      const url = `/api/v0/win-info/computers/storage?${params.toString()}`
      const response = await axios.get(url)

      let results = []
      if (Array.isArray(response.data)) {
        results = response.data
      } else {
        results = []
      }
      setData(results)
      setLastSearch(
        `${minStorage ? `Min: ${minStorage}GB` : ''} ${maxStorage ? `Max: ${maxStorage}GB` : ''}`
      )
      if (results.length > 0) {
        setIsModalOpen(true)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Error fetching computers by storage')
    } finally {
      setLoading(false)
    }
  }, [minStorage, maxStorage])

  const handleExport = () => {
    if (!minStorage && !maxStorage) return
    const params = new URLSearchParams()
    if (minStorage) params.append('minStorage', minStorage)
    if (maxStorage) params.append('maxStorage', maxStorage)
    params.append('excel', 'true')
    const url = `/api/v0/win-info/computers/storage?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData()
    }
  }

  return (
    <>
      <InfoCard
        title="Storage_Capacity_Search"
        description="Filtra ordenadores según su capacidad de disco duro (GB)"
        icon={HardDriveIcon}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-4 items-end">
            <LabeledInput
              id="minStorage"
              label="Min. Storage (GB)"
              placeholder="Ej: 250"
              type="number"
              value={minStorage}
              onChange={(e) => setMinStorage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <LabeledInput
              id="maxStorage"
              label="Max. Storage (GB)"
              placeholder="Ej: 1000"
              type="number"
              value={maxStorage}
              onChange={(e) => setMaxStorage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <div className="flex justify-end space-x-2">
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
                disabled={loading || (!minStorage && !maxStorage)}
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
                  Storage_Query.Results()
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
                      <TableHead className="text-right">Capacity</TableHead>
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
                        <TableCell className="text-right font-bold text-white font-mono">
                          {computer.totalStorageGB} GB
                        </TableCell>
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
