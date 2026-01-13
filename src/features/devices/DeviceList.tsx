import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Server,
  Search,
  MapPin,
  Cpu,
  RefreshCcw,
  AlertCircle,
  ChevronRight,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
  Tag as TagIcon,
  Plus,
  Check,
} from 'lucide-react'
import { TagSelectorModal } from './components/TagSelectorModal'
import { LocationSelectorModal } from './components/LocationSelectorModal'

interface Device {
  id: number
  name: string | null
  ipv4: string
  sysName: string | null
  sysLocation: string | null
  sysDescr: string | null
  macAddress: string | null
  status: boolean
  pingable?: boolean
  tags?: Array<{ id: number; name: string; color: string }>
  location?: {
    id: number
    name: string
    description: string | null
    parentId: number | null
  } | null
}

interface TagItem {
  id: number
  name: string
  color: string
}

interface SubnetWithDevices {
  id: number
  cidr: string
  name: string | null
  devices: Device[]
}

const DeviceList: React.FC = () => {
  const [data, setData] = useState<SubnetWithDevices[]>([])
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [availableLocations, setAvailableLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState<number | null>(null)
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<number | null>(null)
  const [expandedSubnets, setExpandedSubnets] = useState<Record<number, boolean>>({})

  // Bulk Selection State
  const [selectedBulkDeviceIds, setSelectedBulkDeviceIds] = useState<number[]>([])

  // Tag Modal State
  const [tagModal, setTagModal] = useState<{
    show: boolean
    deviceIds: number[]
    deviceName: string
    currentTagIds: number[]
  }>({
    show: false,
    deviceIds: [],
    deviceName: '',
    currentTagIds: [],
  })

  // Location Modal State
  const [locModal, setLocModal] = useState<{
    show: boolean
    deviceIds: number[]
    deviceName: string
    currentLocationId: number | null
  }>({
    show: false,
    deviceIds: [],
    deviceName: '',
    currentLocationId: null,
  })

  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [devicesRes, tagsRes, locationsRes] = await Promise.all([
        axios.get(`/api/v0/search/device/list`),
        axios.get(`/api/v0/tag`),
        axios.get(`/api/v0/location`),
      ])
      setData(devicesRes.data)
      setAvailableTags(tagsRes.data || [])
      setAvailableLocations(locationsRes.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssignTags = async (deviceIds: number[], tagIds: number[]) => {
    setSubmitting(true)
    try {
      // If it's a single device, we do the add/remove logic
      if (deviceIds.length === 1) {
        const deviceId = deviceIds[0]
        const device = data.flatMap((s) => s.devices).find((d) => d.id === deviceId)

        const currentIds = device?.tags?.map((t) => t.id) || []

        const toAssign = tagIds.filter((id) => !currentIds.includes(id))
        const toUnassign = currentIds.filter((id) => !tagIds.includes(id))

        if (toAssign.length > 0) {
          await axios.post('/api/v0/tag/assign', {
            deviceIds: [deviceId],
            tagIds: toAssign,
          })
        }

        if (toUnassign.length > 0) {
          await axios.post('/api/v0/tag/unassign', {
            deviceIds: [deviceId],
            tagIds: toUnassign,
          })
        }
      } else {
        // Bulk assignment
        await axios.post('/api/v0/tag/assign', {
          deviceIds: deviceIds,
          tagIds: tagIds,
        })
      }

      setTagModal((prev) => ({ ...prev, show: false }))
      setSelectedBulkDeviceIds([])
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Tag assignment failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignLocation = async (locationId: number | null, deviceIds: number[]) => {
    setSubmitting(true)
    try {
      if (deviceIds.length === 1) {
        // Use the new single-device PATCH endpoint
        await axios.patch('/api/v0/search/device/location', {
          deviceId: deviceIds[0],
          locationId: locationId,
        })
      } else {
        // Keep bulk assignment logic (requires locationId to be non-null for this endpoint)
        if (locationId === null)
          throw new Error('Bulk location removal not supported on this endpoint')
        await axios.post('/api/v0/location/assign', {
          locationId: locationId,
          deviceIds: deviceIds,
          force: true,
        })
      }
      setLocModal((prev) => ({ ...prev, show: false }))
      setSelectedBulkDeviceIds([])
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Location assignment failed')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleBulkSelect = (id: number) => {
    setSelectedBulkDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSubnet = (id: number) => {
    setExpandedSubnets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const processedData = useMemo(() => {
    let result = data
    const query = searchQuery.toLowerCase()

    result = data.map((subnet) => ({
      ...subnet,
      devices: subnet.devices.filter((device) => {
        // Search Query filter
        const matchesQuery =
          !searchQuery ||
          device.ipv4.toLowerCase().includes(query) ||
          (device.name?.toLowerCase().includes(query) ?? false) ||
          (device.sysName?.toLowerCase().includes(query) ?? false) ||
          (device.sysLocation?.toLowerCase().includes(query) ?? false) ||
          (device.location?.name?.toLowerCase().includes(query) ?? false) ||
          (device.sysDescr?.toLowerCase().includes(query) ?? false) ||
          (device.macAddress?.toLowerCase().includes(query) ?? false)

        // Tag filter
        const matchesTag =
          !selectedTagFilter || (device.tags?.some((t) => t.id === selectedTagFilter) ?? false)

        // Location filter
        const matchesLocation =
          !selectedLocationFilter || device.location?.id === selectedLocationFilter

        return matchesQuery && matchesTag && matchesLocation
      }),
    }))

    // Filter out subnets with no matching devices
    const filteredResult = result.filter((subnet) => subnet.devices.length > 0)

    // Sort alphabetically by subnet name
    return [...filteredResult].sort((a, b) => {
      const nameA = a.name || `Subnet_${a.id}`
      const nameB = b.name || `Subnet_${b.id}`
      return nameA.localeCompare(nameB)
    })
  }, [data, searchQuery, selectedTagFilter, selectedLocationFilter])

  // Auto-expand on search or filters
  useEffect(() => {
    if (searchQuery || selectedTagFilter || selectedLocationFilter) {
      const newExpanded: Record<number, boolean> = {}
      processedData.forEach((s) => {
        newExpanded[s.id] = true
      })
      setExpandedSubnets(newExpanded)
    }
  }, [searchQuery, selectedTagFilter, selectedLocationFilter, processedData])

  const totalDevices = useMemo(() => {
    return data.reduce((acc, subnet) => acc + subnet.devices.length, 0)
  }, [data])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-white" />
          <span className="text-[10px] tracking-[0.3em] uppercase">Inventory.Loading()</span>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="p-8 text-white font-mono bg-black">
        <div className="border border-white/20 p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-white" />
          <p className="text-xs uppercase tracking-widest">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 border border-white text-xs hover:bg-white hover:text-black transition-all"
          >
            RETRY.INVENTORY()
          </button>
        </div>
      </div>
    )

  return (
    <div className="p-4 md:p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full max-w-full 2xl:max-w-[2400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Device.Inventory</h1>
          </div>
          <p className="text-[11px] text-neutral-400 uppercase tracking-[0.4em]">
            Total discovered units: {totalDevices} across {data.length} subnets
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Tag Filter */}
          <div className="relative">
            <select
              value={selectedTagFilter || ''}
              onChange={(e) =>
                setSelectedTagFilter(e.target.value ? parseInt(e.target.value) : null)
              }
              className="bg-neutral-900/50 border border-white/10 px-4 py-2 text-xs focus:outline-none focus:border-white/30 uppercase font-mono appearance-none pr-8 cursor-pointer text-neutral-400"
            >
              <option value="">Filter_By_Tag</option>
              {availableTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <TagIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-600 pointer-events-none" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={selectedLocationFilter || ''}
              onChange={(e) =>
                setSelectedLocationFilter(e.target.value ? parseInt(e.target.value) : null)
              }
              className="bg-neutral-900/50 border border-white/10 px-4 py-2 text-xs focus:outline-none focus:border-white/30 uppercase font-mono appearance-none pr-8 cursor-pointer text-neutral-400"
            >
              <option value="">Filter_By_Location</option>
              {availableLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-600 pointer-events-none" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH_DEVICES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-full sm:w-64 uppercase placeholder:text-neutral-500"
            />
          </div>
          <button
            onClick={fetchData}
            className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Subnet Sections */}
      <div className="space-y-4">
        {processedData.map((subnet) => (
          <div key={subnet.id} className="border border-white/10 bg-neutral-900/10 overflow-hidden">
            {/* Subnet Header */}
            <button
              onClick={() => toggleSubnet(subnet.id)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border-b border-white/10 group"
            >
              <div className="flex items-center gap-4">
                <Globe className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                <div className="text-left">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">
                    {subnet.name || `Subnet_${subnet.id}`}
                  </span>
                  <span className="ml-3 text-[10px] text-neutral-500 font-mono">{subnet.cidr}</span>
                </div>
                <span className="px-2 py-0.5 bg-white/5 text-[8px] text-neutral-500 uppercase font-bold border border-white/5">
                  {subnet.devices.length} Units
                </span>
              </div>
              {expandedSubnets[subnet.id] ? (
                <ChevronUp className="w-4 h-4 text-neutral-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-600" />
              )}
            </button>

            {/* Devices Table (Collapsible Content) */}
            {expandedSubnets[subnet.id] && (
              <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/40">
                      <th className="p-4 w-10">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              const allSubnetIds = subnet.devices.map((d) => d.id)
                              const areAllSelected = allSubnetIds.every((id) =>
                                selectedBulkDeviceIds.includes(id)
                              )
                              if (areAllSelected) {
                                setSelectedBulkDeviceIds((prev) =>
                                  prev.filter((id) => !allSubnetIds.includes(id))
                                )
                              } else {
                                setSelectedBulkDeviceIds((prev) => [
                                  ...new Set([...prev, ...allSubnetIds]),
                                ])
                              }
                            }}
                            className={`w-4 h-4 border flex items-center justify-center transition-all ${
                              subnet.devices.every((d) => selectedBulkDeviceIds.includes(d.id))
                                ? 'bg-white border-white'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            {subnet.devices.every((d) => selectedBulkDeviceIds.includes(d.id)) && (
                              <Check className="w-3 h-3 text-black" />
                            )}
                          </button>
                        </div>
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 w-16">
                        ID
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Status
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Device_Identity
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Network_Address
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Location
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hidden lg:table-cell">
                        System_Specs
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Classification
                      </th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subnet.devices.map((device) => (
                      <tr
                        key={device.id}
                        className={`hover:bg-white/[0.02] group transition-colors ${selectedBulkDeviceIds.includes(device.id) ? 'bg-white/[0.03]' : ''}`}
                      >
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleBulkSelect(device.id)}
                            className={`w-4 h-4 border mx-auto flex items-center justify-center transition-all ${
                              selectedBulkDeviceIds.includes(device.id)
                                ? 'bg-white border-white'
                                : 'border-white/10 group-hover:border-white/30'
                            }`}
                          >
                            {selectedBulkDeviceIds.includes(device.id) && (
                              <Check className="w-3 h-3 text-black" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-[11px] text-neutral-500 font-bold">#{device.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                device.status
                                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                              }`}
                            />
                            <span
                              className={`text-[9px] font-bold uppercase tracking-tighter ${
                                device.status ? 'text-emerald-500/80' : 'text-red-500/80'
                              }`}
                            >
                              {device.status ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider group-hover:text-white transition-colors">
                                {device.name || device.sysName || 'UNKNOWN_NODE'}
                              </span>
                              {device.pingable && (
                                <span className="px-1 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[7px] text-blue-400 font-bold uppercase tracking-widest">
                                  Ping_Only
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-tighter">
                              {device.macAddress || 'NO_MAC_ADDR'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white group-hover:animate-pulse transition-all" />
                            <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-300 font-mono transition-colors">
                              {device.ipv4}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 uppercase">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {device.location?.name || device.sysLocation || 'NOT_DEFINED'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell max-w-xs">
                          <div className="flex items-start gap-2">
                            <Cpu className="w-3 h-3 mt-0.5 text-neutral-600 shrink-0" />
                            <p className="text-[10px] text-neutral-500 line-clamp-1 uppercase italic group-hover:text-neutral-400 transition-colors">
                              {device.sysDescr || 'No system description available.'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {device.tags?.map((tag) => (
                              <div
                                key={tag.id}
                                className="px-1.5 py-0.5 border border-white/10 flex items-center gap-1.5 bg-black/40"
                                title={tag.name}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                                <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter">
                                  {tag.name}
                                </span>
                              </div>
                            ))}
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() =>
                                  setLocModal({
                                    show: true,
                                    deviceIds: [device.id],
                                    deviceName: device.name || device.ipv4,
                                    currentLocationId: device.location?.id || null,
                                  })
                                }
                                className="p-1 border border-dashed border-white/10 text-neutral-600 hover:text-white hover:border-white/30 transition-all"
                                title="Set Location"
                              >
                                <MapPin className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setTagModal({
                                    show: true,
                                    deviceIds: [device.id],
                                    deviceName: device.name || device.ipv4,
                                    currentTagIds: device.tags?.map((t) => t.id) || [],
                                  })
                                }
                                className="p-1 border border-dashed border-white/10 text-neutral-600 hover:text-white hover:border-white/30 transition-all"
                                title="Manage Tags"
                              >
                                <TagIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`/devices/${device.id}`}
                            className="inline-block p-1.5 border border-white/5 text-neutral-700 hover:text-white hover:border-white/40 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {processedData.length === 0 && (
          <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
            <div className="flex flex-col items-center gap-3 opacity-30">
              <Filter className="w-8 h-8" />
              <span className="text-[10px] uppercase tracking-[0.3em]">No_Devices_Match_Query</span>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedBulkDeviceIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-black border border-white/20 px-6 py-4 shadow-2xl flex items-center gap-8 min-w-[400px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-black flex items-center justify-center text-xs font-black">
                {selectedBulkDeviceIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Devices_Selected
                </span>
                <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                  Bulk operation ready
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setLocModal({
                    show: true,
                    deviceIds: selectedBulkDeviceIds,
                    deviceName: `${selectedBulkDeviceIds.length} Selected Devices`,
                    currentLocationId: null,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-bold uppercase hover:bg-neutral-200 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" /> Assign_Location
              </button>
              <button
                onClick={() =>
                  setTagModal({
                    show: true,
                    deviceIds: selectedBulkDeviceIds,
                    deviceName: `${selectedBulkDeviceIds.length} Selected Devices`,
                    currentTagIds: [],
                  })
                }
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-bold uppercase hover:bg-neutral-200 transition-all"
              >
                <TagIcon className="w-3.5 h-3.5" /> Assign_Tags
              </button>
              <button
                onClick={() => setSelectedBulkDeviceIds([])}
                className="flex items-center gap-2 px-4 py-2 border border-white/10 text-neutral-500 text-[10px] font-bold uppercase hover:text-white hover:border-white/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Assignment Modal */}
      <TagSelectorModal
        show={tagModal.show}
        deviceIds={tagModal.deviceIds}
        deviceName={tagModal.deviceName}
        availableTags={availableTags}
        currentTagIds={tagModal.currentTagIds}
        submitting={submitting}
        onClose={() => setTagModal((prev) => ({ ...prev, show: false }))}
        onAssign={handleAssignTags}
        onTagCreated={fetchData}
      />

      {/* Location Assignment Modal */}
      <LocationSelectorModal
        show={locModal.show}
        deviceIds={locModal.deviceIds}
        deviceName={locModal.deviceName}
        currentLocationId={locModal.currentLocationId}
        submitting={submitting}
        onClose={() => setLocModal((prev) => ({ ...prev, show: false }))}
        onAssign={handleAssignLocation}
      />

      {/* Footer System Info */}
      <div className="flex justify-between items-center text-[8px] text-neutral-700 uppercase tracking-widest border-t border-white/10 pt-4">
        <div className="flex items-center gap-4">
          <span>Buffer_Status: Optimized</span>
          <span>Security_Level: Root</span>
        </div>
        <div>Last Sync: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

export default DeviceList
