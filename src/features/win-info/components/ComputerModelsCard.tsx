import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import {
  LaptopIcon,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
  name: string
  ip: string
}

interface ModelData {
  model: string
  computers: Computer[]
}

export default function ComputerModelsCard() {
  const [data, setData] = React.useState<ModelData[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [expandedModels, setExpandedModels] = React.useState<Record<string, boolean>>({})

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = '/api/v0/win-info/computers/models'
      const response = await axios.get(url)
      setData(response.data)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Error fetching models')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleExport = () => {
    const url = '/api/v0/win-info/computers/models?excel=true'
    window.open(url, '_blank')
  }

  const toggleModel = (model: string) => {
    setExpandedModels((prev) => ({ ...prev, [model]: !prev[model] }))
  }

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalComputers = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.computers.length, 0)
  }, [data])

  return (
    <InfoCard
      title="Hardware_Models_Inventory"
      description={`Inventario de modelos y equipos (${totalComputers} equipos en total)`}
      icon={LaptopIcon}
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
            onClick={fetchData}
            title="Refrescar"
            className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 gap-4 border border-white/5 bg-white/5">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">
              Fetching.Models()
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
            Error: {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center p-12 text-neutral-500 uppercase text-[10px] tracking-widest border border-white/5 bg-white/5">
            No_Data_Available
          </div>
        )}

        {data.length > 0 && (
          <ScrollArea className="h-[750px]">
            <div className="space-y-2">
              {data.map((item, index) => {
                const modelId = item.model || 'Unknown_Model'
                const isExpanded = expandedModels[modelId]
                return (
                  <div key={index} className="border border-white/10 bg-white/5 overflow-hidden">
                    <button
                      onClick={() => toggleModel(modelId)}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-all"
                    >
                      <span className="font-bold text-white uppercase tracking-widest text-xs">
                        {modelId}
                      </span>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{item.computers.length} Nodes</Badge>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="size-4 text-neutral-500" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-0 border-t border-white/5 bg-black/40 animate-in slide-in-from-top-1">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Node Name</TableHead>
                              <TableHead>IPv4</TableHead>
                              <TableHead className="w-[50px] text-right">ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.computers.map((computer) => (
                              <TableRow key={computer.id}>
                                <TableCell className="font-bold text-white uppercase">
                                  {computer.name}
                                </TableCell>
                                <TableCell className="text-emerald-500 font-mono">
                                  {computer.ip}
                                </TableCell>
                                <TableCell className="text-right text-neutral-600">
                                  {computer.id}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </InfoCard>
  )
}
