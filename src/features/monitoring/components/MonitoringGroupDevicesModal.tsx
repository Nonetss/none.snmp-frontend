import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Search,
  Check,
  Server,
  RefreshCcw,
  Shield,
  Filter,
  Tag as TagIcon,
  MapPin,
  Layers,
  ChevronDown,
  Trash2,
  MousePointer2,
} from 'lucide-react'
import axios from 'axios'
import type { MonitoringGroup, MonitoringDevice } from '../types'

interface Props {
  group: MonitoringGroup
  onClose: () => void
}

interface TagItem {
  id: number
  name: string
  color: string
}

interface LocationItem {
  id: number
  name: string
}

export const MonitoringGroupDevicesModal: React.FC<Props> = ({ group, onClose }) => {
  const [allDevices, setAllDevices] = useState<MonitoringDevice[]>([])
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [availableLocations, setAvailableLocations] = useState<LocationItem[]>([])
  const [subnets, setSubnets] = useState<{ id: number; name: string; cidr: string }[]>([])

  const [selectedIds, setSelectedIds] = useState<number[]>(group.devices?.map((d) => d.id) || [])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilter, setTagFilter] = useState<number | null>(null)
  const [locationFilter, setLocationFilter] = useState<number | null>(null)
  const [subnetFilter, setSubnetFilter] = useState<number | null>(null)
  const [inGroupFilter, setInGroupFilter] = useState<'all' | 'in' | 'out'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, tagsRes, locationsRes] = await Promise.all([
          axios.get('/api/v0/search/device/list'),
          axios.get('/api/v0/tag'),
          axios.get('/api/v0/location'),
        ])

        const flattened: MonitoringDevice[] = devicesRes.data.flatMap((subnet: any) =>
          subnet.devices.map((d: any) => ({
            id: d.id,
            name: d.name,
            ipv4: d.ipv4,
            sysName: d.sysName,
            status: d.status,
            tags: d.tags,
            location: d.location,
            subnetId: subnet.id,
            subnetName: subnet.name || subnet.cidr,
          }))
        )

        const subnetList = devicesRes.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          cidr: s.cidr,
        }))

        setAllDevices(flattened)
        setSubnets(subnetList)
        setAvailableTags(tagsRes.data || [])
        setAvailableLocations(locationsRes.data || [])
      } catch (err) {
        console.error('Failed to fetch data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredDevices = useMemo(() => {
    return allDevices.filter((d) => {
      // Search query
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.ipv4.includes(q) ||
        d.sysName?.toLowerCase().includes(q)

      if (!matchesSearch) return false

      // Tag filter
      if (tagFilter && !d.tags?.some((t) => t.id === tagFilter)) return false

      // Location filter
      if (locationFilter && d.location?.id !== locationFilter) return false

      // Subnet filter
      if (subnetFilter && d.subnetId !== subnetFilter) return false

      // In group filter
      const isIn = selectedIds.includes(d.id)
      if (inGroupFilter === 'in' && !isIn) return false
      if (inGroupFilter === 'out' && isIn) return false

      return true
    })
  }, [allDevices, searchQuery, tagFilter, locationFilter, subnetFilter, inGroupFilter, selectedIds])

  const toggleDevice = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAllFiltered = () => {
    const idsToSelect = filteredDevices.map((d) => d.id)
    setSelectedIds((prev) => {
      const newSelection = [...prev]
      idsToSelect.forEach((id) => {
        if (!newSelection.includes(id)) newSelection.push(id)
      })
      return newSelection
    })
  }

  const handleDeselectAllFiltered = () => {
    const idsToRemove = filteredDevices.map((d) => d.id)
    setSelectedIds((prev) => prev.filter((id) => !idsToRemove.includes(id)))
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      await axios.patch(`/api/v0/monitor/group/${group.id}`, {
        deviceIds: selectedIds,
      })
      onClose()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update group devices')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center border border-white/10">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Device.Selector
              </h2>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                Group: {group.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Filters */}
          <div className="w-64 border-r border-white/10 bg-black/40 flex flex-col overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-neutral-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
              </div>

              {/* Membership Filter */}
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-600 uppercase font-black tracking-tighter">
                  Membership
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { id: 'all', label: 'All Devices' },
                    { id: 'in', label: 'In Group' },
                    { id: 'out', label: 'Not in Group' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setInGroupFilter(opt.id as any)}
                      className={`text-left px-3 py-2 text-[10px] font-bold uppercase transition-all border ${
                        inGroupFilter === opt.id
                          ? 'bg-white text-black border-white'
                          : 'text-neutral-500 border-white/5 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subnet Filter */}
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-600 uppercase font-black tracking-tighter">
                  Subnet
                </label>
                <select
                  value={subnetFilter || ''}
                  onChange={(e) => setSubnetFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-white/40 appearance-none"
                >
                  <option value="">All Subnets</option>
                  {subnets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.cidr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-600 uppercase font-black tracking-tighter">
                  Tag
                </label>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setTagFilter(null)}
                    className={`px-2 py-1 text-[9px] font-bold border transition-all ${
                      tagFilter === null
                        ? 'bg-white text-black border-white'
                        : 'text-neutral-500 border-white/5 hover:border-white/20'
                    }`}
                  >
                    ALL
                  </button>
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => setTagFilter(tag.id)}
                      className={`px-2 py-1 text-[9px] font-bold border transition-all flex items-center gap-1.5 ${
                        tagFilter === tag.id
                          ? 'bg-white text-black border-white'
                          : 'text-neutral-500 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-[9px] text-neutral-600 uppercase font-black tracking-tighter">
                  Location
                </label>
                <select
                  value={locationFilter || ''}
                  onChange={(e) =>
                    setLocationFilter(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full bg-black border border-white/10 p-2 text-[10px] font-bold text-white uppercase focus:outline-none focus:border-white/40 appearance-none"
                >
                  <option value="">All Locations</option>
                  {availableLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-neutral-400">
                <MousePointer2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Batch_Selection
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleSelectAllFiltered}
                  disabled={filteredDevices.length === 0}
                  className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30"
                >
                  Select All Filtered ({filteredDevices.length})
                </button>
                <button
                  onClick={handleDeselectAllFiltered}
                  disabled={filteredDevices.length === 0}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all disabled:opacity-30"
                >
                  Deselect All Filtered
                </button>
              </div>
            </div>
          </div>

          {/* Main List Area */}
          <div className="flex-1 flex flex-col bg-black">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  type="text"
                  placeholder="SEARCH_BY_NAME_IP_OR_SYSTEM_NAME..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 px-12 py-3 text-xs focus:outline-none focus:border-white/30 uppercase font-mono tracking-widest placeholder:text-neutral-700"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <RefreshCcw className="w-8 h-8 animate-spin text-neutral-800" />
                  <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-700">
                    Scanning_Inventory...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredDevices.map((device) => {
                    const isSelected = selectedIds.includes(device.id)
                    return (
                      <button
                        key={device.id}
                        onClick={() => toggleDevice(device.id)}
                        className={`group relative flex flex-col p-4 border transition-all text-left overflow-hidden ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]'
                            : 'bg-neutral-900/20 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {/* Status bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${device.status ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />

                        <div className="flex items-center justify-between mb-3 pl-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span
                              className={`text-[10px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-black' : 'text-white'}`}
                            >
                              {device.name || 'UNKNOWN_HOST'}
                            </span>
                          </div>
                          <div className="flex items-center justify-center w-5 h-5 border border-current opacity-20">
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <div className="space-y-2 pl-2">
                          <div
                            className={`text-[9px] font-mono flex items-center gap-2 ${isSelected ? 'text-black/60' : 'text-neutral-500'}`}
                          >
                            <span className="font-bold">{device.ipv4}</span>
                            {device.subnetName && (
                              <span className="opacity-50">[{device.subnetName}]</span>
                            )}
                          </div>

                          {device.tags && device.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {device.tags.map((t) => (
                                <div
                                  key={t.id}
                                  className={`text-[8px] px-1.5 py-0.5 border font-black uppercase ${
                                    isSelected
                                      ? 'border-black/20 text-black/60'
                                      : 'border-white/10 text-neutral-500'
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? 'transparent' : `${t.color}11`,
                                  }}
                                >
                                  {t.name}
                                </div>
                              ))}
                            </div>
                          )}

                          {device.location && (
                            <div
                              className={`flex items-center gap-1 text-[8px] font-bold uppercase ${isSelected ? 'text-black/40' : 'text-neutral-600'}`}
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              {device.location.name}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {filteredDevices.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/[0.01]">
                      <div className="text-neutral-800 mb-2">
                        <Layers className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] text-neutral-700 uppercase tracking-[0.3em]">
                        No matching telemetry streams found
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-8 pl-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {selectedIds.length} Selected
              </span>
              <span className="text-[8px] text-neutral-500 uppercase font-bold">
                Integration.Buffer
              </span>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[8px] text-neutral-500 font-bold uppercase">Live</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[8px] text-neutral-500 font-bold uppercase">Down</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-8 py-3 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
            >
              Discard.Changes
            </button>
            <button
              onClick={handleSave}
              disabled={submitting || loading}
              className="px-12 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
            >
              {submitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {submitting ? 'EXECUTING...' : 'Confirm.Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
