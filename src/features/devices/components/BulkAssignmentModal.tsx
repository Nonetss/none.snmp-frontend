import React, { useState, useMemo, useEffect } from 'react'
import {
  X,
  Search,
  Check,
  Tag as TagIcon,
  MapPin,
  RefreshCcw,
  Plus,
  ChevronRight,
} from 'lucide-react'
import axios from 'axios'

interface TagItem {
  id: number
  name: string
  color: string
}

interface LocationItem {
  id: number
  name: string
  description: string | null
  parentId: number | null
}

interface Props {
  show: boolean
  deviceIds: number[]
  deviceName: string
  availableTags: TagItem[]
  availableLocations: LocationItem[]
  currentTagIds: number[]
  currentLocationId: number | null
  submitting: boolean
  onClose: () => void
  onAssignTags: (deviceIds: number[], tagIds: number[]) => Promise<void>
  onAssignLocation: (locationId: number) => Promise<void>
  onTagCreated: () => Promise<void>
}

type Tab = 'tags' | 'location'

export const BulkAssignmentModal: React.FC<Props> = ({
  show,
  deviceIds,
  deviceName,
  availableTags,
  availableLocations,
  currentTagIds,
  currentLocationId,
  submitting,
  onClose,
  onAssignTags,
  onAssignLocation,
  onTagCreated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('tags')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(currentTagIds)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(currentLocationId)

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateTagForm, setShowCreateForm] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', color: '#3b82f6' })
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => {
    if (show) {
      setSelectedTagIds(currentTagIds)
      setSelectedLocationId(currentLocationId)
      setShowCreateForm(false)
      setSearchQuery('')
    }
  }, [show, currentTagIds, currentLocationId])

  const filteredTags = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return availableTags.filter((t) => t.name.toLowerCase().includes(q))
  }, [availableTags, searchQuery])

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return availableLocations.filter(
      (l) => l.name.toLowerCase().includes(q) || (l.description?.toLowerCase().includes(q) ?? false)
    )
  }, [availableLocations, searchQuery])

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name) return
    setCreatingTag(true)
    try {
      const response = await axios.post('/api/v0/tag', newTag)
      await onTagCreated()
      const createdTag = response.data
      setSelectedTagIds((prev) => [...prev, createdTag.id])
      setShowCreateForm(false)
      setNewTag({ name: '', color: '#3b82f6' })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create tag')
    } finally {
      setCreatingTag(false)
    }
  }

  if (!show) return null

  const isBulk = deviceIds.length > 1

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest truncate max-w-[250px]">
              Manage: {deviceName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('tags')
              setSearchQuery('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'tags' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:bg-white/5'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" /> Classification
          </button>
          <button
            onClick={() => {
              setActiveTab('location')
              setSearchQuery('')
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'location'
                ? 'bg-white/10 text-white'
                : 'text-neutral-500 hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Deployment
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'tags' ? (
            /* TAGS TAB */
            !showCreateTagForm ? (
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
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((i) => i !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                      className={`w-full flex items-center justify-between p-3 border transition-all ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-black border-white/5 text-neutral-500 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {tag.name}
                        </span>
                      </div>
                      {selectedTagIds.includes(tag.id) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => onAssignTags(deviceIds, selectedTagIds)}
                    disabled={submitting}
                    className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {submitting
                      ? 'UPDATING...'
                      : isBulk
                        ? `Update Tags for ${deviceIds.length} Devs`
                        : 'Update_Tags'}
                  </button>
                </div>
              </>
            ) : (
              /* CREATE TAG FORM */
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
                  disabled={creatingTag || !newTag.name}
                  className="w-full bg-emerald-600 text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  {creatingTag ? (
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}{' '}
                  Confirm_Create
                </button>
              </form>
            )
          ) : (
            /* LOCATION TAB */
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="SEARCH_LOCATIONS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 uppercase font-mono"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`w-full flex items-center justify-between p-4 border transition-all text-left ${
                      selectedLocationId === loc.id
                        ? 'bg-white/10 border-white/40 text-white'
                        : 'bg-black border-white/5 text-neutral-500 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {loc.name}
                      </span>
                      <span className="text-[9px] text-neutral-600 truncate max-w-[250px] italic">
                        {loc.description || 'No description'}
                      </span>
                    </div>
                    {selectedLocationId === loc.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => selectedLocationId && onAssignLocation(selectedLocationId)}
                  disabled={submitting || !selectedLocationId}
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {submitting
                    ? 'ASSIGNING...'
                    : isBulk
                      ? `Assign ${deviceIds.length} Devs to Location`
                      : 'Update_Location'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
