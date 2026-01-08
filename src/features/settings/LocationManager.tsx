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
}

const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [subnets, setSubnets] = useState<Subnet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedSubnets, setSelectedSubnets] = useState<number[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

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
        axios.get(`/api/v0/snmp/subnet`),
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

  useEffect(() => {
    fetchData()
  }, [])

  const processedLocations = useMemo(() => {
    let filtered = locations
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = locations.filter(
        (l) =>
          (l.name?.toLowerCase().includes(q) ?? false) ||
          (l.description?.toLowerCase().includes(q) ?? false)
      )
    }
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [locations, searchQuery])

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

  const handleAssignSubmit = async () => {
    if (!selectedLocation) return
    setSubmitting(true)
    try {
      const response = await axios.post(`/api/v0/location/assign`, {
        locationId: selectedLocation.id,
        subnetIds: selectedSubnets,
      })
      showToast(response.data.message || 'Devices assigned successfully')
      setShowAssignModal(false)
      setSelectedSubnets([])
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Assignment failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id)
    setFormData({
      name: loc.name,
      description: loc.description || '',
      parentId: loc.parentId?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return
    try {
      await axios.delete(`/api/v0/location/${id}`)
      showToast('Location deleted successfully')
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    }
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
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Physical.Locations</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Deployment Hierarchy & Assets
          </p>
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
              setFormData({ name: '', description: '', parentId: '' })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Add_Location
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedLocations.map((loc) => (
          <div
            key={loc.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[9px] font-bold uppercase tracking-widest text-white">
                ID: {loc.id}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setSelectedLocation(loc)
                    setShowAssignModal(true)
                  }}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="Assign Subnets"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(loc)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="Edit Location"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
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

              <div className="pt-4 border-t border-white/5 space-y-2">
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
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Database className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold">
                      {loc.deviceCount || 0} Devices
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                Select subnets to assign all their devices to this location:
              </p>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {subnets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSubnets((prev) =>
                        prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                      )
                    }}
                    className={`w-full flex items-center justify-between p-3 border transition-all ${
                      selectedSubnets.includes(s.id)
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-black border-white/10 text-neutral-500 hover:border-white/30'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-bold font-mono">{s.cidr}</span>
                      <span className="text-[9px] uppercase opacity-60">{s.name}</span>
                    </div>
                    {selectedSubnets.includes(s.id) && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAssignSubmit}
                  disabled={submitting || selectedSubnets.length === 0}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Assigning...' : `Assign ${selectedSubnets.length} Subnets`}
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
