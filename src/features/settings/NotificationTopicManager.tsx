import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Hash,
  Plus,
  Trash2,
  Edit2,
  RefreshCcw,
  AlertCircle,
  X,
  Shield,
  MessageSquare,
  Link,
} from 'lucide-react'

interface NotificationTopic {
  id: number
  topic: string
  description: string
  credentialId: number
  credential?: {
    id: number
    name: string
  }
}

interface Credential {
  id: number
  name: string
}

const NotificationTopicManager: React.FC = () => {
  const [topics, setTopics] = useState<NotificationTopic[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<Partial<NotificationTopic>>({
    topic: '',
    description: '',
    credentialId: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [topicsRes, credsRes] = await Promise.all([
        axios.get(`/api/v0/notifications/topic`),
        axios.get(`/api/v0/notifications/credential`),
      ])
      setTopics(topicsRes.data || [])
      setCredentials(credsRes.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notification topics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.credentialId) {
      alert('Please select a credential provider')
      return
    }
    setSubmitting(true)

    try {
      const payload = {
        topic: formData.topic,
        description: formData.description,
        credentialId: Number(formData.credentialId),
      }

      if (editingId) {
        await axios.patch(`/api/v0/notifications/topic/${editingId}`, payload)
      } else {
        await axios.post(`/api/v0/notifications/topic`, payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ topic: '', description: '', credentialId: 0 })
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save topic')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return
    try {
      await axios.delete(`/api/v0/notifications/topic/${id}`)
      await fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to delete topic')
    }
  }

  const handleEdit = (topic: NotificationTopic) => {
    setFormData(topic)
    setEditingId(topic.id)
    setShowForm(true)
  }

  if (loading && topics.length === 0)
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
            <h1 className="text-2xl font-bold tracking-tighter uppercase">Notification.Topics</h1>
          </div>
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.4em]">
            Pub/Sub channels for alert delivery
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ topic: '', description: '', credentialId: credentials[0]?.id || 0 })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 border border-white text-xs font-bold hover:bg-white hover:text-black transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Add_Topic
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Topic List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="group relative border border-white/10 bg-neutral-900/20 p-6 space-y-4 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="px-2 py-1 bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                ID: {topic.id}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(topic)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="p-1 text-neutral-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white">
                <Hash className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold uppercase tracking-tighter">{topic.topic}</span>
              </div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest line-clamp-2">
                {topic.description}
              </p>

              <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-neutral-600" />
                <span className="text-[9px] text-neutral-500 font-bold uppercase">
                  Provider: {topic.credential?.name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {topics.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 bg-neutral-900/5">
            <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
            <p className="text-[11px] text-neutral-500 uppercase tracking-[0.3em]">
              No_Topics_Defined
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
                  {editingId ? 'Edit_Topic' : 'New_Topic'}
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
                  Topic Name
                </label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                    placeholder="alerts"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Credential Provider
                </label>
                <div className="relative">
                  <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                  <select
                    value={formData.credentialId}
                    onChange={(e) =>
                      setFormData({ ...formData, credentialId: Number(e.target.value) })
                    }
                    className="w-full bg-black border border-white/10 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-white/40 font-mono appearance-none uppercase"
                    required
                  >
                    <option value={0}>Select a provider...</option>
                    {credentials.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                </div>
                {credentials.length === 0 && (
                  <p className="text-[8px] text-amber-500 uppercase mt-1">
                    Warning: No credentials configured. Create one first.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-white/10 p-2 text-xs focus:outline-none focus:border-white/40 font-mono h-24 resize-none"
                  placeholder="Network alerts topic"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCcw className="w-3 h-3 animate-spin" />}
                  {submitting ? 'Processing...' : editingId ? 'Update_Topic' : 'Save_Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationTopicManager
