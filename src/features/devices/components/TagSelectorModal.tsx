import React, { useState, useMemo } from 'react'
import { X, Search, Check, Tag as TagIcon, RefreshCcw, Plus } from 'lucide-react'
import axios from 'axios'

interface TagItem {
  id: number
  name: string
  color: string
}

interface Props {
  show: boolean
  deviceIds: number[]
  deviceName: string
  availableTags: TagItem[]
  currentTagIds: number[]
  submitting: boolean
  onClose: () => void
  onAssign: (deviceIds: number[], tagIds: number[]) => Promise<void>
  onTagCreated: () => Promise<void>
}

export const TagSelectorModal: React.FC<Props> = ({
  show,
  deviceIds,
  deviceName,
  availableTags,
  currentTagIds,
  submitting,
  onClose,
  onAssign,
  onTagCreated,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(currentTagIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6' })
  const [creating, setCreating] = useState(false)

  // Sync state when currentTagIds change or modal opens
  React.useEffect(() => {
    if (show) {
      setSelectedIds(currentTagIds)
      setShowCreateForm(false)
    }
  }, [show, currentTagIds])

  const filteredTags = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return availableTags.filter((t) => t.name.toLowerCase().includes(q))
  }, [availableTags, searchQuery])

  const toggleTag = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name) return
    setCreating(true)
    try {
      const response = await axios.post('/api/v0/tag', newTag)
      await onTagCreated()
      const createdTag = response.data
      setSelectedIds((prev) => [...prev, createdTag.id])
      setShowCreateForm(false)
      setNewTag({ name: '', color: '#3b82f6' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create tag')
    } finally {
      setCreating(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest truncate max-w-[200px]">
              Tags: {deviceName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!showCreateForm ? (
            <>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="SEARCH_TAGS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 uppercase font-mono"
                  />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="p-2 border border-white/10 hover:bg-white hover:text-black transition-all"
                  title="Create New Tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[250px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full flex items-center justify-between p-3 border transition-all ${
                      selectedIds.includes(tag.id)
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-black border-white/5 text-neutral-500 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {tag.name}
                      </span>
                    </div>
                    {selectedIds.includes(tag.id) && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
                {filteredTags.length === 0 && (
                  <div className="py-8 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
                    No tags found
                  </div>
                )}
              </div>
            </>
          ) : (
            <form
              onSubmit={handleCreateTag}
              className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase text-neutral-500">
                  Create_New_Tag
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-[10px] text-neutral-600 hover:text-white uppercase"
                >
                  Back
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Tag Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
                  placeholder="E.G. CRITICAL"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
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
                      onClick={() => setNewTag({ ...newTag, color: c })}
                      className={`w-5 h-5 rounded-full border transition-all ${newTag.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-5 h-5 bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating || !newTag.name}
                className="w-full bg-emerald-600 text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                {creating ? (
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Confirm_Create
              </button>
            </form>
          )}

          {!showCreateForm && (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => onAssign(deviceIds, selectedIds)}
                disabled={submitting}
                className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {submitting ? 'UPDATING...' : 'Update_Tags'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
