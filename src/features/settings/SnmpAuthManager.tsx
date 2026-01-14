import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  X,
  Lock,
  Hash,
  Eye,
  EyeOff,
} from 'lucide-react'

interface SnmpAuth {
  id: number
  version: 'v1' | 'v2c' | 'v3'
  port: number
  community: string
  v3User?: string
  v3AuthProtocol?: 'md5' | 'sha'
  v3AuthKey?: string
  v3PrivProtocol?: 'aes' | 'des'
  v3PrivKey?: string
  v3Level?: 'noAuthNoPriv' | 'authNoPriv' | 'authPriv'
}

const SnmpAuthManager: React.FC = () => {
  const [auths, setAuths] = useState<SnmpAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Visibility states
  const [showCommunity, setShowCommunity] = useState(false)
  const [showAuthKey, setShowAuthKey] = useState(false)
  const [showPrivKey, setShowPrivKey] = useState(false)

  const [formData, setFormData] = useState<Partial<SnmpAuth>>({
    version: 'v2c',
    port: 161,
    community: 'public',
  })

  const fetchAuths = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/snmp/auth`)
      setAuths(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch SNMP authentications')
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
      const payload = {
        ...formData,
        community: formData.community || '',
      }
      if (editingId) {
        await axios.patch(`/api/v0/snmp/auth/${editingId}`, payload)
      } else {
        await axios.post(`/api/v0/snmp/auth`, payload)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({ version: 'v2c', port: 161, community: 'public' })
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
      await axios.delete(`/api/v0/snmp/auth/${id}`)
      await fetchAuths()
    } catch (err: any) {
      alert(err.message || 'Failed to delete configuration')
    }
  }

  const handleEdit = (auth: SnmpAuth) => {
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
    <div className="bg-black text-white font-mono space-y-8 w-full">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-white" />
            <h2 className="text-lg font-bold tracking-tighter uppercase">SNMP_Profiles</h2>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Credential profiles management
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ version: 'v2c', port: 161, community: 'public' })
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
                {auth.version}
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
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-tighter">
                  {auth.version === 'v3' ? auth.v3User : auth.community}
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Hash className="w-4 h-4" />
                <span className="text-[11px]">Port: {auth.port}</span>
              </div>
              {auth.version === 'v3' && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase">
                    <Lock className="w-3 h-3" /> {auth.v3Level}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] px-1 border border-white/10 text-neutral-400 uppercase">
                      {auth.v3AuthProtocol || 'no-auth'}
                    </span>
                    <span className="text-[9px] px-1 border border-white/10 text-neutral-400 uppercase">
                      {auth.v3PrivProtocol || 'no-priv'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
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
                  {editingId ? 'Edit_Profile' : 'New_Profile'}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    SNMP Version
                  </label>
                  <select
                    value={formData.version}
                    onChange={(e) => {
                      const newVersion = e.target.value as any
                      const newData: Partial<SnmpAuth> = { ...formData, version: newVersion }
                      if (newVersion === 'v3') {
                        newData.v3Level = newData.v3Level || 'authPriv'
                        newData.v3AuthProtocol = newData.v3AuthProtocol || 'sha'
                        newData.v3PrivProtocol = newData.v3PrivProtocol || 'aes'
                      }
                      setFormData(newData)
                    }}
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
                  >
                    <option value="v1">v1</option>
                    <option value="v2c">v2c</option>
                    <option value="v3">v3</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Port
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              {(formData.version === 'v1' || formData.version === 'v2c') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                    Community String
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                    <input
                      type={showCommunity ? 'text' : 'password'}
                      value={formData.community}
                      onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                      className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                      placeholder="public"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCommunity(!showCommunity)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                    >
                      {showCommunity ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {formData.version === 'v3' && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                      Security Level
                    </label>
                    <select
                      value={formData.v3Level || 'authPriv'}
                      onChange={(e) => setFormData({ ...formData, v3Level: e.target.value as any })}
                      className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 uppercase font-mono"
                    >
                      <option value="noAuthNoPriv">noAuthNoPriv</option>
                      <option value="authNoPriv">authNoPriv</option>
                      <option value="authPriv">authPriv</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.v3User || ''}
                      onChange={(e) => setFormData({ ...formData, v3User: e.target.value })}
                      className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                      required
                    />
                  </div>
                  {formData.v3Level !== 'noAuthNoPriv' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Auth Protocol
                        </label>
                        <select
                          value={formData.v3AuthProtocol || 'sha'}
                          onChange={(e) =>
                            setFormData({ ...formData, v3AuthProtocol: e.target.value as any })
                          }
                          className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                        >
                          <option value="md5">MD5</option>
                          <option value="sha">SHA</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Auth Key
                        </label>
                        <div className="relative">
                          <input
                            type={showAuthKey ? 'text' : 'password'}
                            value={formData.v3AuthKey || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, v3AuthKey: e.target.value })
                            }
                            className="w-full bg-black border border-white/10 pl-2 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthKey(!showAuthKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                          >
                            {showAuthKey ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {(formData.v3Level === 'authPriv' || !formData.v3Level) && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Priv Protocol
                        </label>
                        <select
                          value={formData.v3PrivProtocol || 'aes'}
                          onChange={(e) =>
                            setFormData({ ...formData, v3PrivProtocol: e.target.value as any })
                          }
                          className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                        >
                          <option value="aes">AES</option>
                          <option value="des">DES</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                          Priv Key
                        </label>
                        <div className="relative">
                          <input
                            type={showPrivKey ? 'text' : 'password'}
                            value={formData.v3PrivKey || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, v3PrivKey: e.target.value })
                            }
                            className="w-full bg-black border border-white/10 pl-2 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPrivKey(!showPrivKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                          >
                            {showPrivKey ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 px-4 py-2"
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

export default SnmpAuthManager
