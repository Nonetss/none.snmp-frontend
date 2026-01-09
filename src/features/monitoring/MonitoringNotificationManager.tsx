import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  X,
  Shield,
  Clock,
  Settings2,
  CheckCircle2,
  Circle,
  Hash,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import type { MonitoringRule } from './types'

interface NotificationAction {
  id: number
  monitorRuleId: number
  enabled: boolean
  type: string
  consecutiveFailures: number
  repeatIntervalMins: number
  deviceAggregation: 'any' | 'all'
  portAggregation: 'any' | 'all'
  lastSentAt?: string
  lastStatus?: boolean
  monitorRule?: MonitoringRule
  ntfyAction?: NtfyActionConfig
}

interface NtfyActionConfig {
  id: number
  notificationActionId: number
  ntfyTopicId: number
  title: string
  priority: number
  tags: string[]
  topic?: {
    id: number
    topic: string
    credentialId: number
    description: string
  }
}

interface NtfyTopic {
  id: number
  topic: string
}

const MonitoringNotificationManager: React.FC = () => {
  const [actions, setActions] = useState<NotificationAction[]>([])
  const [rules, setRules] = useState<MonitoringRule[]>([])
  const [topics, setTopics] = useState<NtfyTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingNtfyId, setEditingNtfyId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    monitorRuleId: '',
    enabled: true,
    type: 'ntfy',
    consecutiveFailures: 1,
    repeatIntervalMins: 60,
    deviceAggregation: 'any' as const,
    portAggregation: 'any' as const,
    // ntfy specific
    ntfyTopicId: '',
    title: 'Network Alert',
    priority: 3,
    tags: 'warning,network',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [actionsRes, rulesRes, topicsRes] = await Promise.all([
        axios.get(`/api/v0/notifications/action`),
        axios.get(`/api/v0/monitor/rule`),
        axios.get(`/api/v0/notifications/topic`),
      ])

      setActions(actionsRes.data || [])
      setRules(rulesRes.data || [])
      setTopics(topicsRes.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const actionPayload = {
        monitorRuleId: Number(formData.monitorRuleId),
        enabled: formData.enabled,
        type: formData.type,
        consecutiveFailures: Number(formData.consecutiveFailures),
        repeatIntervalMins: Number(formData.repeatIntervalMins),
        deviceAggregation: formData.deviceAggregation,
        portAggregation: formData.portAggregation,
      }

      let actionId = editingId
      if (editingId) {
        await axios.patch(`/api/v0/notifications/action/${editingId}`, actionPayload)
      } else {
        const res = await axios.post(`/api/v0/notifications/action`, actionPayload)
        actionId = res.data.id
      }

      // ntfy specific handling (separate POST or PATCH)
      if (formData.type === 'ntfy' && actionId) {
        const ntfyPayload: any = {
          ntfyTopicId: Number(formData.ntfyTopicId),
          title: formData.title,
          priority: Number(formData.priority),
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
        }

        if (editingId && editingNtfyId) {
          // Separate PATCH for ntfy configuration
          await axios.patch(`/api/v0/notifications/action/ntfy/${editingNtfyId}`, ntfyPayload)
        } else {
          // POST for new ntfy configuration (or if it didn't exist before)
          ntfyPayload.notificationActionId = actionId
          await axios.post(`/api/v0/notifications/action/ntfy`, ntfyPayload)
        }
      }

      setShowForm(false)
      setEditingId(null)
      setEditingNtfyId(null)
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save notification action')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification action?')) return
    try {
      await axios.delete(`/api/v0/notifications/action/${id}`)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete action')
    }
  }

  const handleEdit = (action: NotificationAction) => {
    setEditingId(action.id)
    setEditingNtfyId(action.ntfyAction?.id || null)
    setFormData({
      monitorRuleId: action.monitorRuleId.toString(),
      enabled: action.enabled,
      type: action.type,
      consecutiveFailures: action.consecutiveFailures,
      repeatIntervalMins: action.repeatIntervalMins,
      deviceAggregation: action.deviceAggregation,
      portAggregation: action.portAggregation,
      // ntfy specific
      ntfyTopicId: action.ntfyAction?.ntfyTopicId.toString() || '',
      title: action.ntfyAction?.title || 'Network Alert',
      priority: action.ntfyAction?.priority || 3,
      tags: action.ntfyAction?.tags.join(',') || 'warning,network',
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setEditingNtfyId(null)
  }

  const handleToggle = async (action: NotificationAction) => {
    try {
      await axios.patch(`/api/v0/notifications/action/${action.id}`, {
        enabled: !action.enabled,
      })
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Update failed')
    }
  }

  if (loading && actions.length === 0)
    return (
      <div className="flex items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white" />
      </div>
    )

  return (
    <div className="bg-black text-white font-mono space-y-8 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Notification.Actions</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Alerting conditions and delivery methods
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              monitorRuleId: rules[0]?.id.toString() || '',
              enabled: true,
              type: 'ntfy',
              consecutiveFailures: 1,
              repeatIntervalMins: 60,
              deviceAggregation: 'any',
              portAggregation: 'any',
              ntfyTopicId: topics[0]?.id.toString() || '',
              title: 'Network Alert',
              priority: 3,
              tags: 'warning,network',
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add_Action
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Action List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`group relative border ${action.enabled ? 'border-white/10' : 'border-white/5 opacity-60'} bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                  {action.type}
                </div>
                {!action.enabled && (
                  <span className="text-[8px] border border-red-500/50 text-red-500 px-1 font-bold uppercase">
                    Disabled
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(action)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggle(action)}
                  className={`p-1 transition-colors ${action.enabled ? 'text-emerald-500' : 'text-neutral-500 hover:text-white'}`}
                >
                  {action.enabled ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(action.id)}
                  className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <Shield className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-bold uppercase tracking-tighter truncate">
                  {action.monitorRule?.name || `Rule #${action.monitorRuleId}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Failures</span>
                  <div className="flex items-center gap-2 text-[10px] text-white font-mono">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    {action.consecutiveFailures}x
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-neutral-600 font-bold uppercase">Repeat</span>
                  <div className="flex items-center gap-2 text-[10px] text-white font-mono">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    {action.repeatIntervalMins}m
                  </div>
                </div>
              </div>

              {action.ntfyAction && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    Topic: {action.ntfyAction.topic?.topic || `#${action.ntfyAction.ntfyTopicId}`}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {action.ntfyAction.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-1 border border-white/10 text-neutral-500 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {action.lastSentAt && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] text-neutral-600 uppercase font-bold">
                    Last Alert Sent
                  </span>
                  <span className="text-[9px] text-neutral-400 font-mono">
                    {new Date(action.lastSentAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {actions.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <Bell className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.3em]">
              No_Actions_Defined
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
            onClick={() => setShowForm(false)}
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
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
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
                    </select>
                  </div>
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
                    </select>
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
                        onChange={(e) =>
                          setFormData({ ...formData, priority: Number(e.target.value) })
                        }
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
      )}
    </div>
  )
}

export default MonitoringNotificationManager
