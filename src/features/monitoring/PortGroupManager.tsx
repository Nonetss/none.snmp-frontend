import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Hash,
  Plus,
  RefreshCcw,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { PortGroup, PortGroupItem } from './types'
import { PortGroupCard } from './components/PortGroupCard'
import { PortGroupFormModal } from './components/PortGroupFormModal'
import { MonitoringToast } from './components/MonitoringToast'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

const PortGroupManager: React.FC = () => {
  const [groups, setGroups] = useState<PortGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PortGroup | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-white" />
              <h1 className="text-2xl font-bold tracking-tighter uppercase">PORT.GROUPS</h1>
            </div>
            {!isCollapsed && (
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em] animate-in fade-in duration-300">
                Defined TCP Port Collections for Service Health Checks
              </p>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
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
        )}
      </div>

      {error && !isCollapsed && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Groups Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-500">
          {processedGroups.map((group) => (
            <PortGroupCard
              key={group.id}
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!isCollapsed && processedGroups.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Hash className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">No_Port_Groups_Found</span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <PortGroupFormModal
          editingGroup={editingGroup}
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        submitting={submitting}
        message="This port group will be permanently removed. This action cannot be undone."
      />

      {/* Toast Notification */}
      <MonitoringToast
        visible={toast.visible}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}

export default PortGroupManager
