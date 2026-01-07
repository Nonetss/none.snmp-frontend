import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Calendar,
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Trash2,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Settings2,
  Activity,
  Server,
  Network as NetworkIcon,
  Edit2,
} from 'lucide-react'

interface TaskSchedule {
  id: number
  name: string
  type: 'SCAN_SUBNET' | 'SCAN_ALL_SUBNETS' | 'POLL_ALL' | 'POLL_DEVICE' | 'PING_ALL'
  targetId: number | null
  cronExpression: string
  enabled: boolean
  status: string | null
  lastRun: string | null
  nextRun: string | null
}

interface SubnetInfo {
  id: number
  name: string
  cidr: string
}

const TaskScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSchedule[]>([])
  const [subnets, setSubnets] = useState<SubnetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    type: 'SCAN_SUBNET' as TaskSchedule['type'],
    targetId: '',
    cronExpression: '0 0 * * *',
    enabled: true,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksRes, subnetsRes] = await Promise.all([
        axios.get(`/api/v0/snmp/scheduler`),
        axios.get(`/api/v0/snmp/subnet`),
      ])
      setTasks(tasksRes.data || [])
      setSubnets(subnetsRes.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scheduler data')
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
      const isSystemWide =
        formData.type === 'POLL_ALL' ||
        formData.type === 'SCAN_ALL_SUBNETS' ||
        formData.type === 'PING_ALL'
      const payload = {
        ...formData,
        cronExpression: formData.cronExpression.trim(),
        targetId: isSystemWide || !formData.targetId ? null : Number(formData.targetId),
      }

      if (editingId) {
        await axios.patch(`/api/v0/snmp/scheduler/${editingId}`, payload)
      } else {
        await axios.post(`/api/v0/snmp/scheduler`, payload)
      }

      handleCloseForm()
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (task: TaskSchedule) => {
    setEditingId(task.id)
    setFormData({
      name: task.name,
      type: task.type,
      targetId: task.targetId?.toString() || '',
      cronExpression: task.cronExpression,
      enabled: task.enabled,
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      type: 'SCAN_SUBNET',
      targetId: '',
      cronExpression: '0 0 * * *',
      enabled: true,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await axios.delete(`/api/v0/snmp/scheduler/${id}`)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    }
  }

  const handleToggle = async (task: TaskSchedule) => {
    try {
      await axios.patch(`/api/v0/snmp/scheduler/${task.id}`, {
        enabled: !task.enabled,
      })
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Update failed')
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'SCAN_SUBNET':
      case 'SCAN_ALL_SUBNETS':
        return <NetworkIcon className="w-4 h-4" />
      case 'POLL_ALL':
      case 'PING_ALL':
        return <Activity className="w-4 h-4" />
      case 'POLL_DEVICE':
        return <Server className="w-4 h-4" />
      default:
        return <Settings2 className="w-4 h-4" />
    }
  }

  if (loading && tasks.length === 0)
    return (
      <div className="flex items-center justify-center h-64 bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white" />
      </div>
    )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Task.Scheduler</h1>
          </div>
          <p className="text-[11px] text-neutral-400 uppercase tracking-[0.4em]">
            Automated Operations & Maintenance
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Schedule_New_Task
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-[11px] font-bold uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group relative border ${
              task.enabled ? 'border-white/10' : 'border-white/5 opacity-60'
            } bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                  {getTaskIcon(task.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    {task.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                    {task.type}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-1 text-neutral-600 hover:text-white transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggle(task)}
                  className={`p-1 transition-colors ${
                    task.enabled ? 'text-emerald-500' : 'text-neutral-600 hover:text-white'
                  }`}
                  title={task.enabled ? 'Disable Task' : 'Enable Task'}
                >
                  {task.enabled ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1 text-neutral-600 hover:text-red-500 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-black">Cron_Expr</span>
                <div className="flex items-center gap-2 text-[11px] text-white font-mono">
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {task.cronExpression}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-black">Target_ID</span>
                <div className="text-[11px] text-white font-mono">
                  {task.targetId ? `#${task.targetId}` : 'SYSTEM_WIDE'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500 uppercase font-bold">Last_Execution</span>
                <span className="text-neutral-300 font-mono">
                  {task.lastRun ? new Date(task.lastRun).toLocaleString() : 'NEVER'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500 uppercase font-bold">Next_Scheduled</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {task.nextRun ? new Date(task.nextRun).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !loading && (
          <div className="md:col-span-2 p-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <Calendar className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.3em]">
              No_Tasks_Programmed
            </p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
            onClick={() => setShowForm(false)}
          />

          <div className="relative w-full max-w-md bg-neutral-950 border border-white/20 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit.Scheduled.Task' : 'Schedule.New.Task'}
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
                  Task Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
                  placeholder="E.G. NIGHTLY_CORE_SCAN"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Task Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as any
                      const isSystemWide =
                        newType === 'POLL_ALL' ||
                        newType === 'SCAN_ALL_SUBNETS' ||
                        newType === 'PING_ALL'
                      setFormData({
                        ...formData,
                        type: newType,
                        targetId: isSystemWide ? '' : formData.targetId,
                      })
                    }}
                    className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 uppercase font-bold"
                  >
                    <option value="SCAN_SUBNET">Scan Subnet</option>
                    <option value="SCAN_ALL_SUBNETS">Scan All Subnets</option>
                    <option value="POLL_ALL">Poll All Devices</option>
                    <option value="POLL_DEVICE">Poll Specific Device</option>
                    <option value="PING_ALL">Ping All Devices</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    {formData.type === 'SCAN_SUBNET' ? 'Target Subnet' : 'Target ID (Optional)'}
                  </label>
                  {formData.type === 'SCAN_SUBNET' ? (
                    <select
                      value={formData.targetId}
                      onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                      className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40"
                      required
                    >
                      <option value="">Select Subnet</option>
                      {subnets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.cidr} ({s.name})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={formData.targetId}
                      onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                      className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono"
                      placeholder={
                        formData.type === 'SCAN_ALL_SUBNETS' ||
                        formData.type === 'POLL_ALL' ||
                        formData.type === 'PING_ALL'
                          ? 'N/A'
                          : 'ID'
                      }
                      disabled={
                        formData.type === 'SCAN_ALL_SUBNETS' ||
                        formData.type === 'POLL_ALL' ||
                        formData.type === 'PING_ALL'
                      }
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter flex justify-between">
                  Cron Expression
                  <span className="text-neutral-700 italic lowercase font-normal">
                    (min hour day month weekday)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.cronExpression}
                  onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs focus:outline-none focus:border-white/40 font-mono text-emerald-500"
                  placeholder="* * * * *"
                  required
                />
                <div className="flex gap-2 pt-1 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    { label: 'Every Min', val: '* * * * *' },
                    { label: 'Every Hour', val: '0 * * * *' },
                    { label: 'Daily (3AM)', val: '0 3 * * *' },
                    { label: 'Weekly', val: '0 0 * * 0' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, cronExpression: preset.val })}
                      className="shrink-0 px-2 py-1 bg-white/5 border border-white/5 text-[9px] uppercase hover:bg-white/10 hover:border-white/20 transition-all text-neutral-400"
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
                  className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  {submitting ? 'Registering...' : 'Register_Scheduled_Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskScheduler
