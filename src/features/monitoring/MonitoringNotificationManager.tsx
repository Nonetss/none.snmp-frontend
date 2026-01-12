import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Bell, Plus, RefreshCcw, AlertCircle } from 'lucide-react'
import type { MonitoringRule, NotificationAction, NtfyTopic } from './types'
import { NotificationActionCard } from './components/NotificationActionCard'
import { NotificationActionFormModal } from './components/NotificationActionFormModal'

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
    deviceAggregationValue: 0,
    portAggregation: 'any' as const,
    portAggregationValue: 0,
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
        deviceAggregationValue: Number(formData.deviceAggregationValue),
        portAggregation: formData.portAggregation,
        portAggregationValue: Number(formData.portAggregationValue),
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
            .filter((t: string) => t),
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
      deviceAggregationValue: action.deviceAggregationValue || 0,
      portAggregation: action.portAggregation,
      portAggregationValue: action.portAggregationValue || 0,
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
              deviceAggregationValue: 0,
              portAggregation: 'any',
              portAggregationValue: 0,
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
          <NotificationActionCard
            key={action.id}
            action={action}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
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
        <NotificationActionFormModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          rules={rules}
          topics={topics}
          submitting={submitting}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default MonitoringNotificationManager
