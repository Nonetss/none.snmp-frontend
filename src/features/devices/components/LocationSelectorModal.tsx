import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { X, Search, MapPin, ChevronRight, RefreshCcw, Check } from 'lucide-react'

interface LocationItem {
  id: number
  name: string
  description: string | null
  parentId: number | null
}

interface Props {
  show: boolean
  deviceIds: number[]
  deviceName: string
  currentLocationId: number | null
  submitting: boolean
  onClose: () => void
  onAssign: (locationId: number | null, deviceIds: number[]) => Promise<void>
}

export const LocationSelectorModal: React.FC<Props> = ({
  show,
  deviceIds,
  deviceName,
  currentLocationId,
  submitting,
  onClose,
  onAssign,
}) => {
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(currentLocationId)

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/v0/location')
      setLocations(response.data || [])
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show) {
      fetchLocations()
      setSelectedId(currentLocationId)
    }
  }, [show, currentLocationId])

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || (l.description?.toLowerCase().includes(q) ?? false)
    )
  }, [locations, searchQuery])

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null
    const parent = locations.find((l) => l.id === parentId)
    return parent ? parent.name : `ID: ${parentId}`
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest truncate max-w-[250px]">
              Set Location: {deviceName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex flex-col overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH_LOCATIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/10 px-10 py-2.5 text-xs focus:outline-none focus:border-white/30 uppercase font-mono"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar min-h-0">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3 opacity-50">
                <RefreshCcw className="w-6 h-6 animate-spin" />
                <span className="text-[10px] uppercase tracking-widest">Fetching.Map()</span>
              </div>
            ) : (
              <>
                {/* None / Remove option */}
                {!searchQuery && (
                  <button
                    onClick={() => setSelectedId(null)}
                    className={`w-full flex items-center justify-between p-4 border transition-all text-left mb-4 ${
                      selectedId === null
                        ? 'bg-red-500/10 border-red-500/40 text-red-500'
                        : 'bg-black border-white/5 text-neutral-600 hover:border-red-500/20'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black uppercase tracking-widest">
                        [ UNASSIGNED / NONE ]
                      </span>
                      <span className="text-[9px] opacity-60">
                        Remove device from any location assignment
                      </span>
                    </div>
                    {selectedId === null && <Check className="w-4 h-4" />}
                  </button>
                )}

                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                    className={`w-full flex items-center justify-between p-4 border transition-all text-left ${
                      selectedId === loc.id
                        ? 'bg-white/10 border-white/40 text-white'
                        : 'bg-black border-white/5 text-neutral-500 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {loc.name}
                        </span>
                        {loc.parentId && (
                          <span className="text-[8px] text-neutral-600 font-black px-1 border border-white/5 uppercase">
                            Part of: {getParentName(loc.parentId)}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-600 truncate max-w-[250px] italic">
                        {loc.description || 'No description provided'}
                      </span>
                    </div>
                    {selectedId === loc.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <div className="py-12 text-center text-[10px] text-neutral-700 uppercase tracking-widest border border-dashed border-white/5">
                    No matching locations found
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-500"
            >
              Cancel
            </button>
            <button
              onClick={() => onAssign(selectedId, deviceIds)}
              disabled={submitting || selectedId === currentLocationId}
              className="flex-2 bg-white text-black py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {submitting ? 'EXECUTING...' : 'Confirm_Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
