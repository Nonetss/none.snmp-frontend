import * as React from 'react'
import axios from 'axios'
import { InfoCard } from '@/components/ui/info-card'
import { UserIcon, SearchIcon, Loader2, ClockIcon, X, FileSpreadsheet } from 'lucide-react'
import { LabeledInput } from '@/components/ui/labeled-input'

interface LastLoginData {
  computerName: string | null
  username: string | null
  loginTime: string | null
}

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

export default function LastLoginCard() {
  const [data, setData] = React.useState<LastLoginData | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchType, setSearchType] = React.useState<'name' | 'ip'>('name')
  const [searchValue, setSearchValue] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)

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

      const url = `/api/v0/user/last-login?${params.toString()}`
      const response = await axios.get(url)
      setData(response.data)
      if (response.data) {
        setIsModalOpen(true)
      }
    } catch (e: any) {
      console.error(e)
      setError(
        e?.response?.data?.message || e?.message || 'Error al obtener el último inicio de sesión'
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
    const url = `/api/v0/user/last-login?${params.toString()}`
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
        title="Last_Login_Query"
        description="Consulta quién inició sesión por última vez en un equipo"
        icon={UserIcon}
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
                  placeholder={searchType === 'name' ? 'Ej: DESKTOP-01' : 'Ej: 192.168.1.10'}
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
              Ver resultado actual
            </button>
          )}
        </div>
      </InfoCard>

      {/* Raw Overlay Modal */}
      {isModalOpen && data && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Last_Login.Data()
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 bg-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                    User.Identity
                  </span>
                  <div className="text-lg font-black text-white flex items-center gap-2 uppercase">
                    <UserIcon className="size-4 text-white" />
                    {data.username || 'Not_Detected'}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                    Timestamp
                  </span>
                  <div className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                    <ClockIcon className="size-4 text-emerald-500" />
                    {formatDate(data.loginTime)}
                  </div>
                </div>
                {data.computerName && (
                  <div className="space-y-2 sm:col-span-2 border-t border-white/5 pt-4">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Node_Source
                    </span>
                    <div className="text-xs text-white uppercase font-bold tracking-tighter">
                      {data.computerName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
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
