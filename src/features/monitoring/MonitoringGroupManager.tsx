import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Users,
  Plus,
  RefreshCcw,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import type { MonitoringGroup } from './types'
import { MonitoringGroupFormModal } from './components/MonitoringGroupFormModal'
import { MonitoringGroupCard } from './components/MonitoringGroupCard'
import { MonitoringToast } from './components/MonitoringToast'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

const MonitoringGroupManager: React.FC = () => {
  const [groups, setGroups] = useState<MonitoringGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<MonitoringGroup | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/monitor/group`)
      setGroups(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monitoring groups')
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

  const handleEdit = async (group: MonitoringGroup) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v0/monitor/group/${group.id}`)
      setEditingGroup(response.data)
      setShowForm(true)
    } catch (err: any) {
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
      await axios.delete(`/api/v0/monitor/group/${deleteConfirmId}`)
      showToast('Group deleted successfully')
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
  }

  if (loading && groups.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">Loading.Groups()</span>
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
              <h1 className="text-2xl font-bold tracking-tighter uppercase">DEVICE.GROUPS</h1>
            </div>
            {!isCollapsed && (
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em] animate-in fade-in duration-300">
                Device Clusters for Custom Monitoring Rules
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
                placeholder="FILTER_GROUPS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
              />
            </div>
            <button
              onClick={() => {
                setEditingGroup(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
            >
              <Plus className="w-4 h-4" /> Add_New_Group
            </button>
          </div>
        )}
      </div>

      {error && !isCollapsed && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase animate-in fade-in">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Groups Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-500">
          {processedGroups.map((group) => (
            <MonitoringGroupCard
              key={group.id}
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!isCollapsed && processedGroups.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5 animate-in fade-in">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Users className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">
              No_Monitoring_Groups_Found
            </span>
          </div>
        </div>
      )}

      {/* Unified Form Modal */}
      {showForm && (
        <MonitoringGroupFormModal
          group={editingGroup}
          onClose={handleCloseForm}
          onSuccess={() => {
            showToast(editingGroup ? 'Group updated successfully' : 'Group created successfully')
            fetchData()
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        submitting={submitting}
        message="This monitoring group will be permanently removed. This action cannot be undone."
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

export default MonitoringGroupManager
