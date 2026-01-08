import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  MapPin,
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Database,
  Layers,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react'

interface Location {
  id: number
  name: string
  description: string | null
  parentId: number | null
  deviceCount?: number
}

interface Subnet {
  id: number
  cidr: string
  name: string
  hasLocation?: boolean
  devices?: any[]
}

interface Device {
  id: number

  name: string | null

  ipv4: string

  sysName?: string | null

  sysLocation?: string | null
}

interface DetailedLocation extends Location {
  devices: Device[]
}

interface Props {
  initialViewingId?: number | null
}

const LocationManager: React.FC<Props> = ({ initialViewingId = null }) => {
  const [locations, setLocations] = useState<Location[]>([])

  const [subnets, setSubnets] = useState<Subnet[]>([])

  const [currentLocationDetails, setCurrentLocationDetails] = useState<DetailedLocation | null>(
    null
  )

  const [loading, setLoading] = useState(true)

  const [detailsLoading, setDetailsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)

  const [showAssignModal, setShowAssignModal] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const [selectedSubnets, setSelectedSubnets] = useState<number[]>([])

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([])

  const [forceAssign, setForceAssign] = useState(false)

  const [subnetSearchQuery, setSubnetSearchQuery] = useState('')

  const [expandedSubnetsInModal, setExpandedSubnetsInModal] = useState<number[]>([])

  const [conflictData, setConflictData] = useState<{ message: string; devices: any[] } | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)

  const [viewingLocationId] = useState<number | null>(initialViewingId)

  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',

    visible: false,
  })

  const navigateTo = (id: number | null) => {
    if (id === null) {
      window.location.href = '/locations'
    } else {
      window.location.href = `/locations/${id}`
    }
  }

  const showToast = (message: string) => {
    setToast({ message, visible: true })

    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const [formData, setFormData] = useState({
    name: '',

    description: '',

    parentId: '' as string | number,
  })

  const fetchData = async () => {
    setLoading(true)

    try {
      const [locRes, subRes] = await Promise.all([
        axios.get(`/api/v0/location`),

        axios.get(`/api/v0/location/subnet`),
      ])

      setLocations(locRes.data || [])

      setSubnets(subRes.data || [])

      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocationDetails = async (id: number) => {
    setDetailsLoading(true)

    try {
      const response = await axios.get(`/api/v0/location/${id}`)

      setCurrentLocationDetails(response.data)
    } catch (err: any) {
      console.error('Failed to fetch location details:', err)

      showToast('Error loading location details')
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (viewingLocationId) {
      fetchLocationDetails(viewingLocationId)
    } else {
      setCurrentLocationDetails(null)
    }
  }, [viewingLocationId])

  const breadcrumbs = useMemo(() => {
    if (!viewingLocationId) return []

    const path: Location[] = []

    let currentId: number | null = viewingLocationId

    while (currentId) {
      const loc = locations.find((l) => l.id === currentId)

      if (loc) {
        path.unshift(loc)

        currentId = loc.parentId
      } else {
        break
      }
    }

    return path
  }, [viewingLocationId, locations])

  const processedLocations = useMemo(() => {
    // Show sub-locations of the viewing location, or top-level if none

    let filtered = locations.filter((l) => l.parentId === viewingLocationId)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()

      filtered = filtered.filter(
        (l) =>
          (l.name?.toLowerCase().includes(q) ?? false) ||
          (l.description?.toLowerCase().includes(q) ?? false)
      )
    }

    return [...filtered].sort((a, b) => a.id - b.id)
  }, [locations, searchQuery, viewingLocationId])

  const locationDevices = useMemo(() => {
    return currentLocationDetails?.devices || []
  }, [currentLocationDetails])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)

    const payload = {
      name: formData.name,

      description: formData.description || null,

      parentId: formData.parentId === '' ? null : Number(formData.parentId),
    }

    try {
      if (editingId) {
        await axios.patch(`/api/v0/location/${editingId}`, payload)

        showToast('Location updated successfully')
      } else {
        await axios.post(`/api/v0/location`, payload)

        showToast('Location created successfully')
      }

      setShowForm(false)

      setEditingId(null)

      setFormData({ name: '', description: '', parentId: '' })

      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignSubmit = async (overrideForce = false) => {
    if (!selectedLocation) return

    setSubmitting(true)

    const isForced = overrideForce || forceAssign

    try {
      const response = await axios.post(`/api/v0/location/assign`, {
        locationId: selectedLocation.id,

        subnetIds: selectedSubnets,

        deviceIds: selectedDeviceIds,

        force: isForced,
      })

      showToast(response.data.message || 'Devices assigned successfully')

      setShowAssignModal(false)

      setSelectedSubnets([])

      setSelectedDeviceIds([])

      setForceAssign(false)

      setConflictData(null)

      await fetchData()
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.conflictingDevices) {
        setConflictData({
          message: err.response.data.message,

          devices: err.response.data.conflictingDevices,
        })
      } else {
        alert(err.response?.data?.message || err.message || 'Assignment failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (loc: Location, e: React.MouseEvent) => {
    e.stopPropagation()

    setEditingId(loc.id)

    setFormData({
      name: loc.name,

      description: loc.description || '',

      parentId: loc.parentId?.toString() || '',
    })

    setShowForm(true)
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      await axios.delete(`/api/v0/location/${id}`)

      showToast('Location deleted successfully')

      if (viewingLocationId === id) navigateTo(null)

      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    }
  }

  const handleOpenAssign = (loc: Location, e: React.MouseEvent) => {
    e.stopPropagation()

    setSelectedLocation(loc)

    setShowAssignModal(true)
  }

  const getParentName = (parentId: number | null) => {
    if (!parentId) return null

    const parent = locations.find((l) => l.id === parentId)

    return parent ? parent.name : `ID: ${parentId}`
  }

  if (loading && locations.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />

        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          Loading.Locations()
        </span>
      </div>
    )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Breadcrumbs */}

      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <button onClick={() => navigateTo(null)} className="hover:text-white transition-colors">
              Root
            </button>

            {breadcrumbs.map((loc, idx) => (
              <React.Fragment key={loc.id}>
                <ChevronRight className="w-3 h-3" />

                <button
                  onClick={() => navigateTo(loc.id)}
                  className={`hover:text-white transition-colors ${idx === breadcrumbs.length - 1 ? 'text-white' : ''}`}
                >
                  {loc.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-white" />

              <h1 className="text-2xl font-bold tracking-tighter uppercase">
                {currentLocationDetails
                  ? currentLocationDetails.name
                  : viewingLocationId
                    ? 'Loading...'
                    : 'Physical.Locations'}
              </h1>

              {detailsLoading && <RefreshCcw className="w-4 h-4 animate-spin text-neutral-600" />}
            </div>

            <p className="text-[9px] text-neutral-400 uppercase tracking-[0.4em]">
              {currentLocationDetails?.description ||
                (viewingLocationId ? '' : 'Deployment Hierarchy & Assets')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />

            <input
              type="text"
              placeholder="FILTER_LOCATIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>

          <button
            onClick={() => {
              setEditingId(null)

              setFormData({
                name: '',

                description: '',

                parentId: viewingLocationId?.toString() || '',
              })

              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 text-xs font-bold hover:bg-white hover:text-black transition-all uppercase text-neutral-400 hover:border-white"
          >
            <Plus className="w-4 h-4" /> Add_Location
          </button>

          {viewingLocationId && currentLocationDetails && (
            <button
              onClick={() => {
                setSelectedLocation(currentLocationDetails)

                setShowAssignModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all uppercase"
            >
              <LinkIcon className="w-4 h-4" /> Assign_Devices
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Grid of Sub-locations */}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
          Sub_Locations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => navigateTo(loc.id)}
              className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="px-2 py-1 bg-white/10 text-[9px] font-bold uppercase tracking-widest text-white">
                  ID: {loc.id}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenAssign(loc, e)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                    title="Assign Subnets"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleEdit(loc, e)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                    title="Edit Location"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(loc.id, e)}
                    className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="w-4 h-4 text-neutral-500" />

                  <span className="text-sm font-bold font-mono uppercase">{loc.name}</span>
                </div>

                <p className="text-[10px] text-neutral-400 uppercase tracking-tight min-h-[2.5em] line-clamp-2">
                  {loc.description || 'NO_DESCRIPTION'}
                </p>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  {loc.parentId && (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Layers className="w-3.5 h-3.5" />

                      <span className="text-[9px] uppercase font-bold tracking-tighter">
                        Parent:{' '}
                        <span className="text-neutral-300">{getParentName(loc.parentId)}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Database className="w-3.5 h-3.5" />

                        <span className="text-[10px] uppercase font-bold">
                          {loc.deviceCount || 0} Devices
                        </span>
                      </div>

                      {locations.filter((l) => l.parentId === loc.id).length > 0 && (
                        <div className="flex items-center gap-2 text-emerald-500/70">
                          <Layers className="w-3.5 h-3.5" />

                          <span className="text-[10px] uppercase font-bold">
                            {locations.filter((l) => l.parentId === loc.id).length} Sub-locations
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {locations.filter((l) => l.parentId === loc.id).length > 0 && (
                        <div className="px-1.5 py-0.5 border border-emerald-500/30 text-[8px] text-emerald-500 uppercase font-black animate-pulse">
                          Has_Children
                        </div>
                      )}

                      <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {processedLocations.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 p-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
              <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
                No sub-locations defined here
              </span>
            </div>
          )}
        </div>
      </div>

      {/* List of Devices in this location */}

      {viewingLocationId && (
        <div className="space-y-4 pt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
              Assigned_Devices
            </h3>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (currentLocationDetails) {
                    setSelectedLocation(currentLocationDetails)
                    setShowAssignModal(true)
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/20 text-[10px] font-bold hover:bg-white hover:text-black transition-all uppercase text-neutral-400 hover:border-white"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Quick_Assign
              </button>
              <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-white/10">
                {locationDevices.length} UNITS
              </span>
            </div>
          </div>

          <div className="border border-white/10 bg-neutral-900/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 w-16">
                    ID
                  </th>

                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Identity
                  </th>

                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    IP_Address
                  </th>

                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Sys_Location
                  </th>

                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {locationDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-white/[0.02] group transition-colors">
                    <td className="p-4 text-[11px] text-neutral-500 font-bold">#{device.id}</td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider group-hover:text-white transition-colors">
                          {device.name || device.sysName || 'UNKNOWN_NODE'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-300 font-mono transition-colors">
                        {device.ipv4}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] text-neutral-500 uppercase italic">
                        {device.sysLocation || 'N/A'}
                      </span>
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

                {locationDevices.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-12 text-center text-[10px] text-neutral-600 uppercase tracking-widest"
                    >
                      No devices directly assigned to this location
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {processedLocations.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Search className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">No_Locations_Found</span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit.Location' : 'New.Location'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
                  placeholder="Data Center A"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono min-h-[80px]"
                  placeholder="Additional details about this location..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Parent Location
                </label>
                <div className="relative flex items-center">
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 appearance-none cursor-pointer font-mono uppercase"
                  >
                    <option value="">None (Top Level)</option>
                    {locations
                      .filter((l) => l.id !== editingId)
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none text-neutral-600">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Processing...' : editingId ? 'Update_Location' : 'Create_Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedLocation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Assign.Devices.to.{selectedLocation.name}
                </h2>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Select subnets to assign all their devices to this location:
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search subnets or IPs..."
                    value={subnetSearchQuery}
                    onChange={(e) => setSubnetSearchQuery(e.target.value)}
                    className="w-full bg-black border border-white/10 px-9 py-2 text-[10px] focus:outline-none focus:border-white/30 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {subnets
                  .filter((s) => {
                    const query = subnetSearchQuery.toLowerCase()
                    const subnetMatches =
                      s.cidr.toLowerCase().includes(query) ||
                      (s.name?.toLowerCase().includes(query) ?? false)
                    const deviceMatches = s.devices?.some(
                      (d) =>
                        (d.name?.toLowerCase().includes(query) ?? false) ||
                        d.ipv4.toLowerCase().includes(query)
                    )
                    return subnetMatches || deviceMatches
                  })
                  .map((s) => {
                    const query = subnetSearchQuery.toLowerCase()
                    const isExpanded =
                      expandedSubnetsInModal.includes(s.id) ||
                      (query !== '' &&
                        s.devices?.some(
                          (d) =>
                            (d.name?.toLowerCase().includes(query) ?? false) ||
                            d.ipv4.toLowerCase().includes(query)
                        ))

                    return (
                      <div key={s.id} className="space-y-1">
                        <div
                          className={`w-full flex items-center justify-between p-3 border transition-all cursor-pointer ${
                            selectedSubnets.includes(s.id)
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-black border-white/10 text-neutral-500 hover:border-white/20'
                          }`}
                          onClick={() => {
                            setSelectedSubnets((prev) =>
                              prev.includes(s.id)
                                ? prev.filter((id) => id !== s.id)
                                : [...prev, s.id]
                            )
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedSubnetsInModal((prev) =>
                                  prev.includes(s.id)
                                    ? prev.filter((id) => id !== s.id)
                                    : [...prev, s.id]
                                )
                              }}
                              className="p-1 hover:bg-white/10 text-neutral-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono">{s.cidr}</span>
                                {s.hasLocation && (
                                  <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 font-black uppercase tracking-tighter border border-amber-500/20">
                                    Has_Assigned
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] uppercase opacity-60">{s.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-mono opacity-40">
                              {s.devices?.length || 0} DEVS
                            </span>
                            {selectedSubnets.includes(s.id) && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Devices List */}
                        {isExpanded && (
                          <div className="ml-8 border-l border-white/10 pl-4 py-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                            {s.devices
                              ?.filter((dev) => {
                                if (query === '') return true
                                const subnetMatches =
                                  s.cidr.toLowerCase().includes(query) ||
                                  (s.name?.toLowerCase().includes(query) ?? false)
                                if (subnetMatches) return true // Show all devices if subnet matches
                                return (
                                  (dev.name?.toLowerCase().includes(query) ?? false) ||
                                  dev.ipv4.toLowerCase().includes(query)
                                )
                              })
                              .map((dev: any) => (
                                <div
                                  key={dev.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDeviceIds((prev) =>
                                      prev.includes(dev.id)
                                        ? prev.filter((id) => id !== dev.id)
                                        : [...prev, dev.id]
                                    )
                                  }}
                                  className={`flex items-center justify-between py-1.5 px-2 border-b border-white/[0.02] cursor-pointer transition-colors ${
                                    selectedDeviceIds.includes(dev.id)
                                      ? 'bg-white/5'
                                      : 'hover:bg-white/[0.02]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                                        selectedDeviceIds.includes(dev.id)
                                          ? 'bg-white border-white'
                                          : 'border-white/20'
                                      }`}
                                    >
                                      {selectedDeviceIds.includes(dev.id) && (
                                        <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-tight ${
                                          query !== '' &&
                                          (dev.name?.toLowerCase().includes(query) ?? false)
                                            ? 'text-white'
                                            : 'text-neutral-300'
                                        }`}
                                      >
                                        {dev.name || 'Unknown'}
                                      </span>
                                      <span
                                        className={`text-[9px] font-mono ${
                                          query !== '' && dev.ipv4.toLowerCase().includes(query)
                                            ? 'text-white'
                                            : 'text-neutral-600'
                                        }`}
                                      >
                                        {dev.ipv4}
                                      </span>
                                    </div>
                                  </div>
                                  {dev.hasLocation && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-2.5 h-2.5 text-amber-500/50" />
                                      <span className="text-[7px] text-amber-500/50 uppercase font-black">
                                        Located
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            {(!s.devices || s.devices.length === 0) && (
                              <div className="text-[9px] text-neutral-700 uppercase italic py-2">
                                No devices found in this subnet
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-neutral-600 border-b border-white/5 pb-2">
                  <span>Selection_Summary:</span>
                  <div className="flex gap-4">
                    <span>{selectedSubnets.length} Subnets</span>
                    <span>{selectedDeviceIds.length} Individual Devices</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForceAssign(!forceAssign)}
                    className={`w-5 h-5 border flex items-center justify-center transition-all ${
                      forceAssign ? 'bg-white border-white' : 'bg-black border-white/20'
                    }`}
                  >
                    {forceAssign && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </button>
                  <span
                    className="text-[10px] uppercase font-bold text-neutral-400 cursor-pointer select-none"
                    onClick={() => setForceAssign(!forceAssign)}
                  >
                    Force overwrite existing locations
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleAssignSubmit()}
                  disabled={
                    submitting || (selectedSubnets.length === 0 && selectedDeviceIds.length === 0)
                  }
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
                  {submitting
                    ? 'Assigning...'
                    : `Assign ${selectedSubnets.length} Subnets & ${selectedDeviceIds.length} Devs`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Warning Modal */}
      {conflictData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-red-500">
                  Assignment.Conflict
                </h2>
              </div>
              <button
                onClick={() => setConflictData(null)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-neutral-200 font-bold uppercase tracking-tight">
                  {conflictData.message}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase leading-relaxed">
                  The following devices (and potentially others) are already registered to a
                  location:
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-3 space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                {conflictData.devices.map((dev: any) => (
                  <div
                    key={dev.id}
                    className="flex justify-between items-center text-[10px] font-mono"
                  >
                    <span className="text-neutral-400">ID: #{dev.id}</span>
                    <span className="text-white font-bold">{dev.ipv4}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConflictData(null)}
                  className="flex-1 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignSubmit(true)}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {submitting ? (
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-3.5 h-3.5" />
                  )}
                  Force_Overwrite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-full duration-500">
          <div className="bg-black border border-white/20 p-4 min-w-[300px] shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 rounded-none border border-white/20 flex items-center justify-center bg-white/5">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
                Location.System
              </div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-tighter">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
              className="p-1 hover:bg-white/5 text-neutral-600 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-0.5 bg-neutral-800 w-full overflow-hidden">
            <div className="h-full bg-white animate-progress-shrink origin-left" />
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationManager
