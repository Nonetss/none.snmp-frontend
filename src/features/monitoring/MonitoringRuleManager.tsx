import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Plus,
  RefreshCcw,
  AlertCircle,
  Search,
  Activity,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import type { MonitoringRule, MonitoringGroup, PortGroup } from './types'
import { MonitoringRuleCard } from './components/MonitoringRuleCard'
import { MonitoringRuleFormModal } from './components/MonitoringRuleFormModal'
import { MonitoringToast } from './components/MonitoringToast'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

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

  const fetchFormDependencies = async () => {
    try {
      const [groupsRes, portsRes] = await Promise.all([
        axios.get(`/api/v0/monitor/group`),
        axios.get(`/api/v0/monitor/port-group`),
      ])
      setDeviceGroups(groupsRes.data || [])
      setPortGroups(portsRes.data || [])
    } catch (err) {
      console.error('Failed to refresh form dependencies')
    }
  }

  const handleEdit = async (rule: MonitoringRule) => {
    setEditingId(rule.id)
    setFormData({
      name: rule.name,
      deviceGroupId: rule.deviceGroupId.toString(),
      portGroupId: rule.portGroupId.toString(),
      cronExpression: rule.cronExpression,
      enabled: rule.enabled,
    })
    await fetchFormDependencies()
    setShowForm(true)
  }

  const handleCreateNew = async () => {
    setEditingId(null)
    setFormData({
      name: '',
      deviceGroupId: '',
      portGroupId: '',
      cronExpression: '* * * * *',
      enabled: true,
    })
    await fetchFormDependencies()
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
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setSubmitting(true)
    try {
      await axios.delete(`/api/v0/monitor/rule/${deleteId}`)
      showToast('Rule deleted successfully')
      setDeleteId(null)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    } finally {
      setSubmitting(false)
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-white" />
              <h1 className="text-2xl font-bold tracking-tighter uppercase">RULES</h1>
            </div>
            {!isCollapsed && (
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em] animate-in fade-in duration-300">
                Automation Policies & Health Check Intervals
              </p>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2 duration-300">
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
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
            >
              <Plus className="w-4 h-4" /> Create_New_Rule
            </button>{' '}
          </div>
        )}
      </div>

      {error && !isCollapsed && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Rules Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-500">
          {processedRules.map((rule) => (
            <MonitoringRuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!isCollapsed && rules.length === 0 && !loading && (
        <div className="lg:col-span-2 p-20 text-center border border-dashed border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-4 opacity-20">
            <Activity className="w-12 h-12" />
            <span className="text-[10px] uppercase tracking-[0.5em]">
              No_Monitoring_Rules_Defined
            </span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <MonitoringRuleFormModal
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          deviceGroups={deviceGroups}
          portGroups={portGroups}
          submitting={submitting}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        submitting={submitting}
        message="Are you sure you want to delete this rule?"
      />

      {/* Toast Notification */}
      <MonitoringToast
        visible={toast.visible}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}

export default MonitoringRuleManager
