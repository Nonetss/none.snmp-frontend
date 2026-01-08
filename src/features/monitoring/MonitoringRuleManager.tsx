import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Shield,
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Hash,
  Activity,
  Calendar,
} from 'lucide-react'
import type { MonitoringRule, MonitoringGroup, PortGroup } from './types'

const MonitoringRuleManager: React.FC = () => {
  const [rules, setRules] = useState<MonitoringRule[]>([])
  const [deviceGroups, setDeviceGroups] = useState<MonitoringGroup[]>([])
  const [portGroups, setPortGroups] = useState<PortGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const [formData, setFormData] = useState({
    name: '',
    deviceGroupId: '',
    portGroupId: '',
    cronExpression: '* * * * *',
    enabled: true,
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rulesRes, groupsRes, portsRes] = await Promise.all([
        axios.get(`/api/v0/monitor/rule`),
        axios.get(`/api/v0/monitor/group`),
        axios.get(`/api/v0/monitor/port-group`),
      ])
      setRules(rulesRes.data || [])
      setDeviceGroups(groupsRes.data || [])
      setPortGroups(portsRes.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monitoring rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const processedRules = useMemo(() => {
    let filtered = rules
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = rules.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.deviceGroup?.name.toLowerCase().includes(q) ||
          r.portGroup?.name.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [rules, searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const payload = {
      ...formData,
      deviceGroupId: Number(formData.deviceGroupId),
      portGroupId: Number(formData.portGroupId),
    }

    try {
      if (editingId) {
        await axios.patch(`/api/v0/monitor/rule/${editingId}`, payload)
        showToast('Rule updated successfully')
      } else {
        await axios.post(`/api/v0/monitor/rule`, payload)
        showToast('Rule created successfully')
      }
      handleCloseForm()
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (rule: MonitoringRule) => {
    setEditingId(rule.id)
    setFormData({
      name: rule.name,
      deviceGroupId: rule.deviceGroupId.toString(),
      portGroupId: rule.portGroupId.toString(),
      cronExpression: rule.cronExpression,
      enabled: rule.enabled,
    })
    setShowForm(true)
  }

  const handleToggle = async (rule: MonitoringRule) => {
    try {
      await axios.patch(`/api/v0/monitor/rule/${rule.id}`, {
        enabled: !rule.enabled,
      })
      showToast(`Rule ${!rule.enabled ? 'enabled' : 'disabled'} successfully`)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Update failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    try {
      await axios.delete(`/api/v0/monitor/rule/${id}`)
      showToast('Rule deleted successfully')
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      deviceGroupId: '',
      portGroupId: '',
      cronExpression: '*/5 * * * *',
      enabled: true,
    })
  }

  if (loading && rules.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">Loading.Rules()</span>
      </div>
    )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">RULES</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Automation Policies & Health Check Intervals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="FILTER_RULES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Create_New_Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedRules.map((rule) => (
          <div
            key={rule.id}
            className={`group relative border ${
              rule.enabled ? 'border-white/10' : 'border-white/5 opacity-60'
            } bg-neutral-900/20 p-6 flex flex-col justify-between min-h-[160px] hover:border-white/30 transition-all`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 border transition-colors ${rule.enabled ? 'bg-white/5 border-white/10 text-white' : 'bg-black border-white/5 text-neutral-700'}`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    {rule.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-700'}`}
                    />
                    <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">
                      {rule.enabled ? 'ACTIVE_DAEMON' : 'PAUSED_DAEMON'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(rule)}
                  className="p-1.5 text-neutral-600 hover:text-white transition-colors border border-transparent hover:border-white/10 bg-white/0 hover:bg-white/5"
                  title="Edit Rule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggle(rule)}
                  className={`p-1.5 transition-colors border border-transparent hover:border-white/10 bg-white/0 hover:bg-white/5 ${
                    rule.enabled ? 'text-emerald-500' : 'text-neutral-600 hover:text-white'
                  }`}
                  title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                >
                  {rule.enabled ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="p-1.5 text-neutral-600 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/10 bg-white/0 hover:bg-red-500/5"
                  title="Delete Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-black/40 border border-white/5">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Users className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    Target Group
                  </span>
                </div>
                <div className="text-[10px] text-white font-bold uppercase truncate">
                  {rule.deviceGroup?.name || `Group #${rule.deviceGroupId}`}
                </div>
              </div>
              <div className="space-y-2 p-3 bg-black/40 border border-white/5">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Hash className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Port Set</span>
                </div>
                <div className="text-[10px] text-white font-bold uppercase truncate">
                  {rule.portGroup?.name || `Ports #${rule.portGroupId}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[8px] text-neutral-600 uppercase font-black tracking-widest">
                  Schedule_Cron
                </span>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
                  <Calendar className="w-3 h-3 opacity-50" />
                  {rule.cronExpression}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-neutral-600 uppercase font-black tracking-widest">
                  Next_Run
                </span>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                  <Clock className="w-3 h-3 opacity-50" />
                  {rule.nextRun ? new Date(rule.nextRun).toLocaleTimeString() : 'WAITING'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && !loading && (
          <div className="lg:col-span-2 p-20 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Activity className="w-12 h-12" />
              <span className="text-[10px] uppercase tracking-[0.5em]">
                No_Monitoring_Rules_Defined
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
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
                onClick={handleCloseForm}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-full duration-500">
          <div className="bg-black border border-white/20 p-4 min-w-[300px] shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 rounded-none border border-white/20 flex items-center justify-center bg-white/5">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
                Monitoring.System
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

export default MonitoringRuleManager
