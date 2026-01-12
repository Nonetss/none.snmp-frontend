import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import { MonitorIcon, SearchIcon, Loader2, X, FileSpreadsheet } from 'lucide-react'
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

interface UserComputer {
  id: number
  name: string | null
  model: string | null
  lastLoginAt: string | null
}

interface UserComputersData {
  username: string
  computers: UserComputer[]
}

interface UserSummary {
  id: number
  username: string
}

export default function UserComputersCard() {
  const [data, setData] = React.useState<UserComputersData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [username, setUsername] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Autocomplete state
  const [usersList, setUsersList] = React.useState<UserSummary[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/v0/user/list')
        if (Array.isArray(response.data)) {
          setUsersList(response.data)
        }
      } catch (err) {
        console.error('Error fetching users list:', err)
      }
    }
    fetchUsers()
  }, [])

  const filteredSuggestions = React.useMemo(() => {
    if (!username || username.length < 1) return []
    const lowerSearch = username.toLowerCase()
    return usersList.filter((u) => u.username?.toLowerCase().includes(lowerSearch)).slice(0, 5) // Limit suggestions
  }, [usersList, username])

  const fetchData = React.useCallback(async () => {
    if (!username.trim()) {
      setError('Introduce un nombre de usuario.')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const params = new URLSearchParams()
      params.append('username', username.trim())

      const url = `/api/v0/user/computers?${params.toString()}`
      const response = await axios.get(url)
      setData(response.data)
      if (response.data && response.data.computers && response.data.computers.length > 0) {
        setIsModalOpen(true)
      }
    } catch (e: any) {
      console.error(e)
      setError(
        e?.response?.data?.message || e?.message || 'Error al obtener los ordenadores del usuario'
      )
    } finally {
      setLoading(false)
    }
  }, [username])

  const handleExport = () => {
    if (!username.trim()) return
    const params = new URLSearchParams()
    params.append('username', username.trim())
    params.append('excel', 'true')
    const url = `/api/v0/user/computers?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData()
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (value: string) => {
    setUsername(value)
    setShowSuggestions(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) return date.toLocaleString()

      if (dateString.length >= 14 && /^\d{14}/.test(dateString)) {
        const year = dateString.substring(0, 4)
        const month = dateString.substring(4, 6)
        const day = dateString.substring(6, 8)
        const hour = dateString.substring(8, 10)
        const minute = dateString.substring(10, 12)
        const second = dateString.substring(12, 14)
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`
      }

      return dateString
    } catch (e) {
      return dateString
    }
  }

  return (
    <>
      <InfoCard
        title="User_Computers_Mapping"
        description="Encuentra en qué equipos ha iniciado sesión un usuario específico"
        icon={MonitorIcon}
        headerAction={
          <button
            onClick={handleExport}
            disabled={loading || !username.trim()}
            title="Exportar a Excel"
            className="p-2 border border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="size-4" />
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-4 w-full">
            <div className="flex-1 w-full relative">
              <LabeledInput
                id="username"
                label="Target User"
                placeholder="Ej: user.name"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
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
                    {filteredSuggestions.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col px-3 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-white hover:text-black transition-colors"
                        onClick={() => selectSuggestion(user.username)}
                      >
                        <span className="truncate">{user.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-white/10 text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 size-4" />
              )}
              Query
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 text-[10px] border border-red-500/20 uppercase tracking-widest">
              {error}
            </div>
          )}

          {data && data.computers && data.computers.length > 0 && (
            <button
              className="w-full px-4 py-2 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              Ver resultados ({data.computers.length})
            </button>
          )}
        </div>
      </InfoCard>

      {/* Raw Overlay Modal */}
      {isModalOpen && data && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[700px] bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                  User_Nodes.List()
                </h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                  Nodes where <span className="text-white font-bold">{data.username}</span>{' '}
                  authenticated
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
                      <TableHead>Node Name</TableHead>
                      <TableHead>Hardware Model</TableHead>
                      <TableHead className="text-right">Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.computers.map((computer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-bold text-white uppercase">
                          <div className="flex items-center gap-2">
                            <MonitorIcon className="size-3 text-neutral-500" />
                            {computer.name || 'Unknown_Node'}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-500">{computer.model || '-'}</TableCell>
                        <TableCell className="text-right font-mono text-[10px] text-emerald-500">
                          {formatDate(computer.lastLoginAt)}
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
