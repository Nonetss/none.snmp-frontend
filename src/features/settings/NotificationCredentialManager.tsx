import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Bell,
  MoveDownIcon,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  X,
  Lock,
  User,
  Globe,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react'

interface NotificationCredential {
  id: number
  name: string
  baseUrl: string
  username?: string
  password?: string
  token?: string
}

const NotificationCredentialManager: React.FC = () => {
  const [credentials, setCredentials] = useState<NotificationCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const [formData, setFormData] = useState<Partial<NotificationCredential>>({
    name: '',
    baseUrl: '',
    username: '',
    password: '',
    token: '',
  })

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/notifications/credential`)
      setCredentials(response.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification credentials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredentials()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        baseUrl: formData.baseUrl,
        username: formData.username || undefined,
        password: formData.password || undefined,
        token: formData.token || undefined,
      }

      if (editingId) {
        await axios.patch(`/api/v0/notifications/credential/${editingId}`, payload)
      } else {
        await axios.post(`/api/v0/notifications/credential`, payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', baseUrl: '', username: '', password: '', token: '' })
      await fetchCredentials()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save configuration')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this credential?')) return
    try {
      await axios.delete(`/api/v0/notifications/credential/${id}`)
      await fetchCredentials()
    } catch (err: any) {
      alert(err.message || 'Failed to delete credential')
    }
  }

  const handleEdit = (cred: NotificationCredential) => {
    setFormData(cred)
    setEditingId(cred.id)
    setShowForm(true)
  }

  if (loading && credentials.length === 0)
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
            <h1 className="text-2xl font-bold tracking-tighter uppercase">
              Notification.Credentials
            </h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Notification service configurations (ntfy, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', baseUrl: '', username: '', password: '', token: '' })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add_Credential
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Credential List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((cred) => (
          <div
            key={cred.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                ID: {cred.id}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(cred)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cred.id)}
                  className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <Bell className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-bold uppercase tracking-tighter">{cred.name}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Globe className="w-4 h-4" />
                <span className="text-[11px] truncate">{cred.baseUrl}</span>
              </div>
              {cred.username && (
                <div className="flex items-center gap-3 text-neutral-500">
                  <User className="w-4 h-4" />
                  <span className="text-[11px]">{cred.username}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {credentials.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <Bell className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.3em]">
              No_Credentials_Configured
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
          <div className="relative w-full max-w-md bg-neutral-950 border border-white/20 shadow-[0_0_50px_-12px_rgba(255,255,255,0.3)] animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  {editingId ? 'Edit_Credential' : 'New_Credential'}
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
                  Provider Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                  placeholder="My ntfy Server"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Base URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    placeholder="https://ntfy.sh"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors py-2"
                >
                  Advanced Authentication (Optional)
                  <ArrowDown
                    className={`w-3 h-3 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                          placeholder="user"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                            placeholder="password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Token
                        </label>
                        <div className="relative">
                          <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                          <input
                            type={showToken ? 'text' : 'password'}
                            value={formData.token}
                            onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                            placeholder="tk_123"
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                          >
                            {showToken ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                      ? 'Update_Credential'
                      : 'Save_Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCredentialManager
