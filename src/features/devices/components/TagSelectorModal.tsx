import React, { useState, useMemo } from 'react'
import { X, Search, Check, Tag as TagIcon, RefreshCcw } from 'lucide-react'

interface TagItem {
  id: number
  name: string
  color: string
}

interface Props {
  show: boolean
  deviceId: number
  deviceName: string
  availableTags: TagItem[]
  currentTagIds: number[]
  submitting: boolean
  onClose: () => void
  onAssign: (deviceId: number, tagIds: number[]) => Promise<void>
}

export const TagSelectorModal: React.FC<Props> = ({
  show,
  deviceId,
  deviceName,
  availableTags,
  currentTagIds,
  submitting,
  onClose,
  onAssign,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(currentTagIds)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync state when currentTagIds change or modal opens
  React.useEffect(() => {
    if (show) {
      setSelectedIds(currentTagIds)
    }
  }, [show, currentTagIds])

  const filteredTags = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return availableTags.filter((t) => t.name.toLowerCase().includes(q))
  }, [availableTags, searchQuery])

  const toggleTag = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH_TAGS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 uppercase font-mono"
            />
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

          <div className="pt-4">
            <button
              onClick={() => onAssign(deviceId, selectedIds)}
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
        </div>
      </div>
    </div>
  )
}
