import React from 'react'
import { X, RefreshCcw } from 'lucide-react'
import type { Location } from '../types'

interface Props {
  show: boolean
  editingId: number | null
  formData: { name: string; description: string; parentId: string | number }
  locations: Location[]
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (data: any) => void
}

export const LocationFormModal: React.FC<Props> = ({
  show,
  editingId,
  formData,
  locations,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
}) => {
  if (!show) return null

  return (
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
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Location Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
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
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono min-h-[80px]"
              placeholder="Additional details about this location..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Parent Location
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => onFormChange({ ...formData, parentId: e.target.value })}
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
  )
}
