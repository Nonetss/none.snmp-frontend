import React from 'react'
import { X, RefreshCcw, Settings2, Bell, Tag } from 'lucide-react'
import type { MonitoringRule, NtfyTopic } from '../types'

interface NotificationActionFormModalProps {
  editingId: number | null
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
  rules: MonitoringRule[]
  topics: NtfyTopic[]
  submitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export const NotificationActionFormModal: React.FC<NotificationActionFormModalProps> = ({
  editingId,
  formData,
  setFormData,
  rules,
  topics,
  submitting,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-neutral-950 border border-white/20 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-white" />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              {editingId ? 'Edit_Notification_Action' : 'New_Notification_Action'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Settings2 className="w-4 h-4 text-neutral-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                General Condition
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Monitor Rule
                </label>
                <select
                  value={formData.monitorRuleId}
                  onChange={(e) => setFormData({ ...formData, monitorRuleId: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                  required
                >
                  <option value="">Select Rule</option>
                  {rules.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Action Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                >
                  <option value="ntfy">ntfy (Standard)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Consecutive Failures
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.consecutiveFailures}
                  onChange={(e) =>
                    setFormData({ ...formData, consecutiveFailures: Number(e.target.value) })
                  }
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Repeat Interval (mins)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.repeatIntervalMins}
                  onChange={(e) =>
                    setFormData({ ...formData, repeatIntervalMins: Number(e.target.value) })
                  }
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Device Aggregation
                  </label>
                  <select
                    value={formData.deviceAggregation}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceAggregation: e.target.value as any })
                    }
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                  >
                    <option value="any">Any Device Fails</option>
                    <option value="all">All Devices Fail</option>
                    <option value="percentage">Percentage of Devices Fail</option>
                  </select>
                </div>
                {formData.deviceAggregation === 'percentage' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                      Fail Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.deviceAggregationValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deviceAggregationValue: Number(e.target.value),
                        })
                      }
                      className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Port Aggregation
                  </label>
                  <select
                    value={formData.portAggregation}
                    onChange={(e) =>
                      setFormData({ ...formData, portAggregation: e.target.value as any })
                    }
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                  >
                    <option value="any">Any Port Fails</option>
                    <option value="all">All Ports Fail</option>
                    <option value="percentage">Percentage of Ports Fail</option>
                  </select>
                </div>
                {formData.portAggregation === 'percentage' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                      Fail Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.portAggregationValue}
                      onChange={(e) =>
                        setFormData({ ...formData, portAggregationValue: Number(e.target.value) })
                      }
                      className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.type === 'ntfy' && (
            <div className="space-y-4 pt-6 border-t border-white/10 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  ntfy Configuration
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Notification Topic
                </label>
                <select
                  value={formData.ntfyTopicId}
                  onChange={(e) => setFormData({ ...formData, ntfyTopicId: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                  required
                >
                  <option value="">Select Topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.topic} (ID: {t.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Alert Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Priority (1-5)
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-bold"
                  >
                    <option value={1}>1 - Min</option>
                    <option value={2}>2 - Low</option>
                    <option value={3}>3 - Default</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Max</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter flex justify-between">
                  Tags
                  <span className="text-[8px] font-normal lowercase opacity-40">
                    Comma separated
                  </span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
                    placeholder="warning,network"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <RefreshCcw className="w-4 h-4 animate-spin" />}
              {submitting
                ? 'Processing...'
                : editingId
                  ? 'Update_Action'
                  : 'Create_Notification_Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
