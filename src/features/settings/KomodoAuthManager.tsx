import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  X,
  Link,
  Key,
  Lock,
  Eye,
  EyeOff,
  Box,
} from 'lucide-react'

interface KomodoAuth {
  id: number
  url: string
  key: string
  secret: string
}

const KomodoAuthManager: React.FC = () => {
  const [auths, setAuths] = useState<KomodoAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Visibility states
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const [formData, setFormData] = useState<Partial<KomodoAuth>>({
    url: '',
    key: '',
    secret: '',
  })

  const fetchAuths = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/komodo/auth`)
      // The API might return a single object or an array.
      // Based on the requirement for "multiple profiles", we treat it as an array.
      const data = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : []
      setAuths(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Komodo credentials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuths()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await axios.patch(`/api/v0/komodo/auth/${editingId}`, formData)
      } else {
        await axios.post(`/api/v0/komodo/auth`, formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({ url: '', key: '', secret: '' })
      await fetchAuths()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save configuration')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return
    try {
      await axios.delete(`/api/v0/komodo/auth/${id}`)
      await fetchAuths()
    } catch (err: any) {
      alert(err.message || 'Failed to delete configuration')
    }
  }

  const handleEdit = (auth: KomodoAuth) => {
    setFormData(auth)
    setEditingId(auth.id)
    setShowForm(true)
  }

  if (loading && auths.length === 0)
    return (
      <div className="flex items-center justify-center h-48 bg-black text-white font-mono">
        <RefreshCcw className="w-6 h-6 animate-spin text-white" />
      </div>
    )

  return (
    <div className="bg-black text-white font-mono space-y-8 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h2 className="text-lg font-bold tracking-tighter uppercase">Komodo_Profiles</h2>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Credential profiles management
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ url: '', key: '', secret: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add_Profile
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Auth List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auths.map((auth) => (
          <div
            key={auth.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                ID: {auth.id}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(auth)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(auth.id)}
                  className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-neutral-300">
                <Box className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tighter truncate block max-w-[200px]">
                  {auth.url}
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Key className="w-4 h-4" />
                <span className="text-[11px] truncate block max-w-[200px]">Key: {auth.key}</span>
              </div>
            </div>
          </div>
        ))}
        {auths.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 text-neutral-600 uppercase text-[10px] tracking-widest">
            No_Profiles_Configured
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
          <div className="relative w-full max-w-md bg-neutral-950 border border-white/20 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit_Komodo_Profile' : 'New_Komodo_Profile'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Server URL
                </label>
                <div className="relative">
                  <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    placeholder="https://komodo.example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  API Secret
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={formData.secret}
                    onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                  >
                    {showSecret ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-3 h-3 animate-spin" />}
                  {submitting ? 'Processing...' : editingId ? 'Update_Profile' : 'Save_Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default KomodoAuthManager
