import React from 'react'
import { X, Plus, Trash2, RefreshCcw } from 'lucide-react'
import type { PortGroupItem } from '../types'

interface PortGroupFormModalProps {
  editingGroup: any
  formData: {
    name: string
    description: string
    items: PortGroupItem[]
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export const PortGroupFormModal: React.FC<PortGroupFormModalProps> = ({
  editingGroup,
  formData,
  setFormData,
  submitting,
  onClose,
  onSubmit,
}) => {
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

  return (
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
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
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
  )
}
