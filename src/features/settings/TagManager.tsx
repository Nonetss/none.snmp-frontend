import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Tag, Plus, RefreshCcw, AlertCircle, X, Edit2, Trash2, Search, Check } from 'lucide-react'

interface TagItem {
  id: number
  name: string
  color: string
}

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
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
    color: '#3b82f6', // Default blue
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/tag`)
      setTags(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const processedTags = useMemo(() => {
    let filtered = tags
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = tags.filter((t) => t.name.toLowerCase().includes(q))
    }
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [tags, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        await axios.patch(`/api/v0/tag/${editingId}`, formData)
        showToast('Tag updated successfully')
      } else {
        await axios.post(`/api/v0/tag`, formData)
        showToast('Tag created successfully')
      }
      handleCloseForm()
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (tag: TagItem) => {
    setEditingId(tag.id)
    setFormData({
      name: tag.name,
      color: tag.color,
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setSubmitting(true)
    try {
      await axios.delete(`/api/v0/tag/${deleteConfirmId}`)
      showToast('Tag deleted successfully')
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
    setEditingId(null)
    setFormData({ name: '', color: '#3b82f6' })
  }

  if (loading && tags.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">Loading.Tags()</span>
      </div>
    )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Device.Tags</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Classification & Organization Labels
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="FILTER_TAGS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({ name: '', color: '#3b82f6' })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Add_New_Tag
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {processedTags.map((tag) => (
          <div
            key={tag.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-4 flex items-center justify-between hover:border-white/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color, boxShadow: `0 0 10px ${tag.color}44` }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                {tag.name}
              </span>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(tag)}
                className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 transition-colors"
                title="Edit Tag"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                title="Delete Tag"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {processedTags.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Tag className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">No_Tags_Defined</span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit.Tag' : 'Create.New.Tag'}
                </h2>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
                  placeholder="E.G. CRITICAL_INFRA"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Tag Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 bg-transparent border-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
                    placeholder="#000000"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    '#3b82f6',
                    '#ef4444',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899',
                    '#64748b',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Processing...' : editingId ? 'Update_Tag' : 'Create_Tag'}
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
                  This tag will be permanently removed from all assigned devices. This action cannot
                  be undone.
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
                Tag.System
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

export default TagManager
