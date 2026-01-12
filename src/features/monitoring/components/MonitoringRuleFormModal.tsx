import React from 'react'
import { X, RefreshCcw, Shield } from 'lucide-react'
import type { MonitoringGroup, PortGroup, MonitoringRule } from '../types'

interface MonitoringRuleFormModalProps {
  editingId: number | null
  formData: {
    name: string
    deviceGroupId: string
    portGroupId: string
    cronExpression: string
    enabled: boolean
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
  deviceGroups: MonitoringGroup[]
  portGroups: PortGroup[]
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export const MonitoringRuleFormModal: React.FC<MonitoringRuleFormModalProps> = ({
  editingId,
  formData,
  setFormData,
  deviceGroups,
  portGroups,
  submitting,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {editingId ? 'Edit.Monitoring.Rule' : 'Create.New.Rule'}
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
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono uppercase"
              placeholder="E.G. WEB_HEALTH_CHECK"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Device Group
            </label>
            <select
              value={formData.deviceGroupId}
              onChange={(e) => setFormData({ ...formData, deviceGroupId: e.target.value })}
              className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-bold uppercase"
              required
            >
              <option value="">Select Target Group</option>
              {deviceGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.deviceCount} devices)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Port Group
            </label>
            <select
              value={formData.portGroupId}
              onChange={(e) => setFormData({ ...formData, portGroupId: e.target.value })}
              className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-bold uppercase"
              required
            >
              <option value="">Select Port Set</option>
              {portGroups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter flex justify-between">
              Cron Schedule
              <span className="text-[8px] font-normal lowercase opacity-40">
                min hour day month weekday
              </span>
            </label>
            <input
              type="text"
              value={formData.cronExpression}
              onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
              className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono text-emerald-500"
              placeholder="*/5 * * * *"
              required
            />
            <div className="flex gap-2 pt-1 overflow-x-auto pb-1 custom-scrollbar">
              {[
                { label: 'Every Min', val: '* * * * *' },
                { label: '5 Min', val: '*/5 * * * *' },
                { label: 'Hourly', val: '0 * * * *' },
                { label: 'Daily', val: '0 0 * * *' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, cronExpression: preset.val })}
                  className="shrink-0 px-2 py-1 bg-white/5 border border-white/5 text-[9px] uppercase hover:bg-white/10 hover:border-white/20 transition-all text-neutral-400 font-bold"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
            >
              {submitting ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {submitting ? 'Executing...' : editingId ? 'Update_Rule' : 'Activate_Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
