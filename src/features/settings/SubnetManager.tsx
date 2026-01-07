import React, { useEffect, useState } from 'react'
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
} from 'lucide-react'

interface SubnetInfo {
  id: number
  name: string
  cidr: string
  deviceCount: number
}

const SubnetManager: React.FC = () => {
  const [subnets, setSubnets] = useState<SubnetInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [scanningId, setScanningId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    cidr: '',
    subnetName: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await axios.patch(`/api/v0/snmp/subnet/${editingId}`, {
          cidr: formData.cidr,
          name: formData.subnetName,
        })
      } else {
        await axios.post(`/api/v0/snmp/scan`, formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({ cidr: '', subnetName: '' })
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (subnet: SubnetInfo) => {
    setEditingId(subnet.id)
    setFormData({
      cidr: subnet.cidr,
      subnetName: subnet.name,
    })
    setShowForm(true)
  }

  const handleTriggerScan = async (subnet: SubnetInfo) => {
    setScanningId(subnet.id)
    try {
      await axios.post(`/api/v0/snmp/scan`, {
        cidr: subnet.cidr,
        subnetName: subnet.name,
      })
      alert(`Scan triggered for ${subnet.cidr}`)
    } catch (err: any) {
      alert(err.message || 'Failed to trigger scan')
    } finally {
      setScanningId(null)
    }
  }

  if (loading && subnets.length === 0)
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
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Network.Subnets</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            IP Address Space & Discovery
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ cidr: '', subnetName: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add_Subnet_Scan
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Subnet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subnets.map((subnet) => (
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
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  <span className="text-[8px] text-emerald-500 uppercase font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  CIDR Range
                </label>
                <div className="relative flex items-center">
                  <Globe className="absolute mx-2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type="text"
                    value={formData.cidr}
                    onChange={(e) => setFormData({ ...formData, cidr: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    placeholder="192.168.1.0/24"
                    required
                  />
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 py-2"
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
    </div>
  )
}

export default SubnetManager
