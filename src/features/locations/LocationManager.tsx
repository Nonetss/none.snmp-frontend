import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Plus, RefreshCcw, AlertCircle, X, Search, MapPin, Link as LinkIcon } from 'lucide-react'
import type { Location, Subnet, DetailedLocation } from './types'
import { LocationBreadcrumbs } from './components/LocationBreadcrumbs'
import { LocationGrid } from './components/LocationGrid'
import { LocationDevices } from './components/LocationDevices'
import { LocationFormModal } from './components/LocationFormModal'
import { AssignDevicesModal } from './components/AssignDevicesModal'
import { ConflictWarningModal } from './components/ConflictWarningModal'

interface Props {
  initialViewingId?: number | null
}

const LocationManager: React.FC<Props> = ({ initialViewingId = null }) => {
  // Data States
  const [locations, setLocations] = useState<Location[]>([])
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [currentLocationDetails, setCurrentLocationDetails] = useState<DetailedLocation | null>(
    null
  )

  // UI States
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewingLocationId] = useState<number | null>(initialViewingId)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Assignment States
  const [selectedSubnets, setSelectedSubnets] = useState<number[]>([])
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([])
  const [forceAssign, setForceAssign] = useState(false)
  const [subnetSearchQuery, setSubnetSearchQuery] = useState('')
  const [expandedSubnetsInModal, setExpandedSubnetsInModal] = useState<number[]>([])
  const [expandedSubnetsInView, setExpandedSubnetsInView] = useState<number[]>([])
  const [conflictData, setConflictData] = useState<{ message: string; devices: any[] } | null>(null)

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  // Navigation Logic
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
    if (viewingLocationId !== null) {
      fetchLocationDetails(viewingLocationId)
    } else {
      setCurrentLocationDetails(null)
    }
  }, [viewingLocationId])

  const breadcrumbs = useMemo(() => {
    if (viewingLocationId === null) return []
    if (viewingLocationId === -1) return [{ id: -1, name: 'Unassigned Assets' }]

    const path: Location[] = []
    let currentId: number | null = viewingLocationId
    while (currentId && currentId !== -1) {
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
    if (viewingLocationId !== null) return []
    let filtered = locations.filter((l) => l.parentId === null)
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

  const locationDevicesCount = useMemo(() => {
    if (!currentLocationDetails?.subnets) return 0
    return currentLocationDetails.subnets.reduce((acc, s) => acc + (s.devices?.length || 0), 0)
  }, [currentLocationDetails])

  const filteredDetailedSubnets = useMemo(() => {
    if (!currentLocationDetails?.subnets) return []
    if (!searchQuery) return currentLocationDetails.subnets

    const query = searchQuery.toLowerCase()
    return currentLocationDetails.subnets
      .map((s) => ({
        ...s,
        devices:
          s.devices?.filter(
            (d) =>
              (d.name?.toLowerCase().includes(query) ?? false) ||
              d.ipv4.toLowerCase().includes(query)
          ) || [],
      }))
      .filter((s) => s.devices.length > 0)
  }, [currentLocationDetails, searchQuery])

  useEffect(() => {
    if (searchQuery && filteredDetailedSubnets.length > 0) {
      setExpandedSubnetsInView(filteredDetailedSubnets.map((s) => s.id))
    }
  }, [searchQuery, filteredDetailedSubnets])

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
      await axios.post(`/api/v0/location/assign`, {
        locationId: selectedLocation.id,
        subnetIds: selectedSubnets,
        deviceIds: selectedDeviceIds,
        force: isForced,
      })

      showToast(selectedLocation.id === -1 ? 'Devices unassigned' : 'Devices assigned successfully')
      setShowAssignModal(false)
      setSelectedSubnets([])
      setSelectedDeviceIds([])
      setForceAssign(false)
      setConflictData(null)
      await fetchData()
      if (viewingLocationId !== null) {
        await fetchLocationDetails(viewingLocationId)
      }
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

  const handleBulkUnassign = async () => {
    if (selectedDeviceIds.length === 0 && selectedSubnets.length === 0) return
    if (
      !confirm(
        `Are you sure you want to unassign ${selectedDeviceIds.length + selectedSubnets.length} items?`
      )
    )
      return

    setSubmitting(true)
    try {
      await axios.post(`/api/v0/location/assign`, {
        locationId: -1,
        subnetIds: selectedSubnets,
        deviceIds: selectedDeviceIds,
        force: true,
      })
      showToast('Assets moved to Unassigned')
      setSelectedSubnets([])
      setSelectedDeviceIds([])
      fetchData()
      if (viewingLocationId !== null) fetchLocationDetails(viewingLocationId)
    } catch (err: any) {
      alert('Unassign failed')
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
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-4">
          <LocationBreadcrumbs breadcrumbs={breadcrumbs} onNavigate={navigateTo} />
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
              placeholder="SEARCH_LOCATIONS_OR_DEVICES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>

          {viewingLocationId === null && (
            <button
              onClick={() => navigateTo(-1)}
              className="flex items-center gap-2 px-4 py-2 border border-amber-500/30 text-xs font-bold hover:bg-amber-500 hover:text-black transition-all uppercase text-amber-500"
            >
              <AlertCircle className="w-4 h-4" /> Unassigned_Assets
            </button>
          )}

          {viewingLocationId === -1 && (
            <button
              onClick={() => {
                setSelectedLocation({ id: -1, name: 'Unassigned', description: '', parentId: null })
                setShowAssignModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
            >
              <Plus className="w-4 h-4" /> Assign_Devices
            </button>
          )}

          {viewingLocationId !== -1 && (
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
          )}

          {viewingLocationId !== null && viewingLocationId !== -1 && currentLocationDetails && (
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

      {viewingLocationId === null && (
        <LocationGrid
          locations={locations}
          processedLocations={processedLocations}
          onNavigate={navigateTo}
          onOpenAssign={handleOpenAssign}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getParentName={getParentName}
        />
      )}

      {viewingLocationId !== null && (
        <div className="space-y-4 pt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
              {viewingLocationId === -1 ? 'Unassigned_Inventory' : 'Assigned_Devices'}
            </h3>
            <div className="flex items-center gap-4">
              {viewingLocationId !== -1 &&
                (selectedDeviceIds.length > 0 || selectedSubnets.length > 0) && (
                  <button
                    onClick={handleBulkUnassign}
                    className="flex items-center gap-2 px-3 py-1.5 border border-red-500/30 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase text-red-500 mr-2"
                  >
                    <X className="w-3.5 h-3.5" /> Unassign_Selected
                  </button>
                )}
              {viewingLocationId !== -1 && (
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
              )}
              <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-white/10">
                {locationDevicesCount} UNITS
              </span>
            </div>
          </div>

          <LocationDevices
            subnets={filteredDetailedSubnets}
            expandedSubnets={expandedSubnetsInView}
            onToggleExpand={(id) =>
              setExpandedSubnetsInView((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            loading={detailsLoading}
            selectable={true}
            selectedDeviceIds={selectedDeviceIds}
            onSelectDevice={(id) =>
              setSelectedDeviceIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
            selectedSubnets={selectedSubnets}
            onSelectSubnet={(id) =>
              setSelectedSubnets((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              )
            }
          />
        </div>
      )}

      <LocationFormModal
        show={showForm}
        editingId={editingId}
        formData={formData}
        locations={locations}
        submitting={submitting}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        onFormChange={setFormData}
      />

      <AssignDevicesModal
        show={showAssignModal}
        selectedLocation={selectedLocation}
        subnets={subnets}
        subnetSearchQuery={subnetSearchQuery}
        onSubnetSearchChange={setSubnetSearchQuery}
        expandedSubnets={expandedSubnetsInModal}
        onToggleSubnet={(id) =>
          setExpandedSubnetsInModal((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        selectedSubnets={selectedSubnets}
        onSelectSubnet={(id) =>
          setSelectedSubnets((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        selectedDeviceIds={selectedDeviceIds}
        onSelectDevice={(id) =>
          setSelectedDeviceIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        forceAssign={forceAssign}
        onToggleForce={() => setForceAssign(!forceAssign)}
        submitting={submitting}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssignSubmit}
      />

      <ConflictWarningModal
        conflictData={conflictData}
        submitting={submitting}
        onClose={() => setConflictData(null)}
        onConfirm={() => handleAssignSubmit(true)}
      />

      {/* Global Toast */}
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
