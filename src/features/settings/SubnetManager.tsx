import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  Network,
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Globe,
  Database,
  Activity,
  Play,
  Edit2,
  Check,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react'

interface SubnetInfo {
  id: number
  name: string
  cidr: string
  deviceCount: number
  scanPingable?: boolean
}

const SubnetManager: React.FC = () => {
  const [subnets, setSubnets] = useState<SubnetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [scanningId, setScanningId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 5000)
  }

  const [formData, setFormData] = useState({
    cidr: '',
    mask: '24',
    subnetName: '',
    createIfPingable: false,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/snmp/subnet`)
      setSubnets(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subnets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const processedSubnets = useMemo(() => {
    let filtered = subnets
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = subnets.filter(
        (s) => (s.name?.toLowerCase().includes(q) ?? false) || s.cidr.toLowerCase().includes(q)
      )
    }
    // Sort by ID ascending
    return [...filtered].sort((a, b) => a.id - b.id)
  }, [subnets, searchQuery])

  const sanitizeMask = (m: any): string => {
    const s = String(m).trim()
    if (!s || s === 'undefined' || s === 'null' || s === '') return '24'
    return s
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const maskValue = sanitizeMask(formData.mask)
    const cleanIp = formData.cidr.split('/')[0].trim()
    const fullCidr = `${cleanIp}/${maskValue}`

    try {
      if (editingId) {
        await axios.patch(`/api/v0/snmp/subnet/${editingId}`, {
          cidr: fullCidr,
          name: formData.subnetName,
          scanPingable: formData.createIfPingable,
        })
      } else {
        await axios.post(`/api/v0/snmp/scan`, {
          cidr: fullCidr,
          subnetName: formData.subnetName,
          createIfPingable: formData.createIfPingable,
        })
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({ cidr: '', mask: '24', subnetName: '', createIfPingable: false })
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (subnet: SubnetInfo) => {
    setEditingId(subnet.id)
    const fullCidr = subnet.cidr || ''
    const parts = fullCidr.split('/')
    const ip = parts[0] || ''
    const mask = sanitizeMask(parts[1])

    setFormData({
      cidr: ip,
      mask: mask,
      subnetName: subnet.name || '',
      createIfPingable: subnet.scanPingable || false,
    })
    setShowForm(true)
  }

  const handleTriggerScan = async (subnet: SubnetInfo) => {
    setScanningId(subnet.id)
    try {
      await axios.post(`/api/v0/snmp/scan/${subnet.id}`)
      showToast(`Scan initiated successfully for ${subnet.cidr}`)
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger scan')
    } finally {
      setScanningId(null)
    }
  }

  if (loading && subnets.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-black text-white font-mono">
        <RefreshCcw className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-[10px] tracking-[0.3em] uppercase opacity-50">Loading.Subnets()</span>
      </div>
    )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Network.Subnets</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            IP Address Space & Discovery
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="FILTER_SUBNETS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900/50 border border-white/10 px-10 py-2 text-xs focus:outline-none focus:border-white/30 w-64 uppercase placeholder:text-neutral-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              setEditingId(null)
              setFormData({ cidr: '', mask: '24', subnetName: '', createIfPingable: false })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Add_Subnet_Scan
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Subnet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedSubnets.map((subnet) => (
          <div
            key={subnet.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[9px] font-bold uppercase tracking-widest text-white">
                ID: {subnet.id}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(subnet)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="Edit Subnet"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTriggerScan(subnet)}
                  disabled={scanningId === subnet.id}
                  className={`p-1 transition-colors ${
                    scanningId === subnet.id
                      ? 'text-white animate-pulse'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                  title="Trigger Re-scan"
                >
                  <Play className={`w-4 h-4 ${scanningId === subnet.id ? 'fill-white' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-bold font-mono">{subnet.cidr}</span>
              </div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                {subnet.name}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Database className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold">
                    {subnet.deviceCount} Devices
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span className="text-[8px] text-emerald-500 uppercase font-bold">Active</span>
                  </div>
                  {subnet.scanPingable && (
                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-blue-400" />
                      <span className="text-[8px] text-blue-400 uppercase font-bold">
                        Ping_Discovery
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {processedSubnets.length === 0 && !loading && (
        <div className="p-12 text-center border border-white/10 bg-neutral-900/5">
          <div className="flex flex-col items-center gap-3 opacity-30">
            <Filter className="w-8 h-8" />
            <span className="text-[10px] uppercase tracking-[0.3em]">No_Subnets_Match_Query</span>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit.Subnet' : 'New.Subnet.Scan'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Network Address Range
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3 relative flex items-center">
                    <Globe className="absolute mx-2 w-3.5 h-3.5 text-neutral-600" />
                    <input
                      type="text"
                      value={formData.cidr}
                      onChange={(e) => setFormData({ ...formData, cidr: e.target.value })}
                      className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                      placeholder="192.168.1.0"
                      required
                    />
                  </div>
                  <div className="col-span-1 relative flex items-center">
                    <span className="absolute left-2 text-neutral-600 text-xs font-bold">/</span>
                    <select
                      value={formData.mask}
                      onChange={(e) => setFormData({ ...formData, mask: e.target.value })}
                      className="w-full bg-black border border-white/10 pl-5 pr-2 py-2 text-xs focus:outline-none focus:border-white/40 font-mono appearance-none cursor-pointer"
                    >
                      <option value="24">24</option>
                      {Array.from({ length: 25 }, (_, i) => (32 - i).toString())
                        .filter((m) => m !== '24')
                        .map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-2 pointer-events-none text-neutral-600">
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Subnet Name
                </label>
                <input
                  type="text"
                  value={formData.subnetName}
                  onChange={(e) => setFormData({ ...formData, subnetName: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                  placeholder="Office Network"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIfPingable"
                  checked={formData.createIfPingable}
                  onChange={(e) => setFormData({ ...formData, createIfPingable: e.target.checked })}
                  className="w-4 h-4 bg-black border border-white/10 rounded-none checked:bg-white checked:border-white appearance-none cursor-pointer relative after:content-[''] after:hidden checked:after:block after:absolute after:left-1 after:top-0 after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45"
                />
                <label
                  htmlFor="createIfPingable"
                  className="text-[10px] text-neutral-400 uppercase font-bold tracking-tighter cursor-pointer select-none"
                >
                  Create devices if only pingable (No SNMP)
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-3 h-3 animate-spin" />}
                  {submitting
                    ? 'Processing...'
                    : editingId
                      ? 'Update_Configuration'
                      : 'Trigger_Network_Discovery'}
                </button>
              </div>

              <p className="text-[8px] text-neutral-600 leading-relaxed uppercase">
                Note: Discovery will ping all hosts in the range and attempt SNMP auth with all
                configured profiles.
              </p>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-full duration-500">
          <div className="bg-black border border-white/20 p-4 min-w-[300px] shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 rounded-none border border-emerald-500/50 flex items-center justify-center bg-emerald-500/10">
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">
                System.Notification
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

export default SubnetManager
