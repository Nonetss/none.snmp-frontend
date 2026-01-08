import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Hash,
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Search,
  Check,
  Zap,
  ChevronRight,
} from 'lucide-react'
import type { PortGroup, PortGroupItem } from './types'

const PortGroupManager: React.FC = () => {
  const [groups, setGroups] = useState<PortGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PortGroup | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as PortGroupItem[],
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/monitor/port-group`)
      setGroups(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch port groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const processedGroups = useMemo(() => {
    let filtered = groups
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = groups.filter(
        (g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [groups, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Ensure ports are numbers
    const payload = {
      ...formData,
      items: formData.items.map((item) => ({
        port: Number(item.port),
        expectedStatus: item.expectedStatus,
      })),
    }

    try {
      if (editingGroup) {
        await axios.patch(`/api/v0/monitor/port-group/${editingGroup.id}`, payload)
        showToast('Port group updated successfully')
      } else {
        await axios.post(`/api/v0/monitor/port-group`, payload)
        showToast('Port group created successfully')
      }
      handleCloseForm()
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (group: PortGroup) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v0/monitor/port-group/${group.id}`)
      const fullGroup = response.data
      setEditingGroup(fullGroup)
      setFormData({
        name: fullGroup.name,
        description: fullGroup.description,
        items: fullGroup.items || [],
      })
      setShowForm(true)
    } catch (err) {
      alert('Failed to fetch group details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setSubmitting(true)
    try {
      await axios.delete(`/api/v0/monitor/port-group/${deleteConfirmId}`)
      showToast('Port group deleted successfully')
      setDeleteConfirmId(null)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingGroup(null)
    setFormData({ name: '', description: '', items: [] })
  }

  const addPortItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { port: 80, expectedStatus: true }],
    })
  }

  const removePortItem = (index: number) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const updatePortItem = (index: number, field: keyof PortGroupItem, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  if (loading && groups.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">
          Loading.PortGroups()
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
            <h1 className="text-2xl font-bold tracking-tighter uppercase">PORT.GROUPS</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Defined TCP Port Collections for Service Health Checks
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="FILTER_PORT_GROUPS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              setEditingGroup(null)
              setFormData({
                name: '',
                description: '',
                items: [{ port: 80, expectedStatus: true }],
              })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Add_New_Port_Group
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedGroups.map((group) => (
          <div
            key={group.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 flex flex-col justify-between min-h-[160px] hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-black uppercase tracking-widest text-white">
                    {group.name}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 line-clamp-2 uppercase leading-relaxed">
                  {group.description || 'No description provided'}
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
                  title="Edit Group"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                  Configured Targets
                </span>
              </div>
              <button
                onClick={() => handleEdit(group)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:underline flex items-center gap-1"
              >
                View_Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {processedGroups.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Hash className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">No_Port_Groups_Found</span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingGroup ? 'Edit.Port.Group' : 'Create.New.Port.Group'}
                </h2>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
                    placeholder="E.G. WEB_STACK"
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
                    className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono uppercase min-h-[80px]"
                    placeholder="E.G. STANDARD PORTS FOR WEB SERVICES AND APIs"
                  />
                </div>
              </div>

              {/* Ports List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                    Port Definitions
                  </label>
                  <button
                    type="button"
                    onClick={addPortItem}
                    className="text-[9px] font-black uppercase text-white hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add_Port
                  </button>
                </div>

                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 group/item"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[8px] text-neutral-600 uppercase font-black">
                            Port
                          </label>
                          <input
                            type="number"
                            value={item.port}
                            onChange={(e) => updatePortItem(index, 'port', e.target.value)}
                            className="w-full bg-black border border-white/10 p-1.5 text-[11px] focus:outline-none focus:border-white/40 font-mono"
                            placeholder="80"
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[8px] text-neutral-600 uppercase font-black">
                            Expected Status
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updatePortItem(index, 'expectedStatus', true)}
                              className={`flex-1 py-1.5 text-[9px] font-bold uppercase transition-all border ${
                                item.expectedStatus
                                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                                  : 'bg-black text-neutral-600 border-white/5'
                              }`}
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePortItem(index, 'expectedStatus', false)}
                              className={`flex-1 py-1.5 text-[9px] font-bold uppercase transition-all border ${
                                !item.expectedStatus
                                  ? 'bg-red-500/20 text-red-500 border-red-500/40'
                                  : 'bg-black text-neutral-600 border-white/5'
                              }`}
                            >
                              Closed
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePortItem(index)}
                        className="p-2 text-neutral-600 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <div className="py-8 text-center border border-dashed border-white/5">
                      <span className="text-[9px] text-neutral-700 uppercase tracking-widest">
                        No ports defined
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || formData.items.length === 0}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
                  {submitting
                    ? 'Processing...'
                    : editingGroup
                      ? 'Update_Port_Group'
                      : 'Create_Port_Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-neutral-950 border border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-red-500">
                  Delete.Confirmation
                </h2>
              </div>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-xs text-neutral-200 font-bold uppercase tracking-tight">
                  Are you absolutely sure?
                </p>
                <p className="text-[10px] text-neutral-500 uppercase leading-relaxed">
                  This port group will be permanently removed. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 border border-white/10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {submitting ? (
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Permanently_Delete
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
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
                Monitoring.System
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

export default PortGroupManager
