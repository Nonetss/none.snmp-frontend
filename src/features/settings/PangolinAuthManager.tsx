import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCcw, AlertCircle, Eye, EyeOff, Link, ShieldCheck, Globe } from 'lucide-react'

interface PangolinAuthResponse {
  id: number
  url: string
  token: string
  org: {
    id: number
    name: string
    slug: string
  }
}

interface PangolinAuthFormData {
  url: string
  token: string
  orgName: string
  orgSlug: string
}

const PangolinAuthManager: React.FC = () => {
  const [authId, setAuthId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const [formData, setFormData] = useState<PangolinAuthFormData>({
    url: '',
    token: '',
    orgName: '',
    orgSlug: '',
  })

  const fetchAuth = async () => {
    setLoading(true)
    try {
      const response = await axios.get<PangolinAuthResponse>(`/api/v0/proxy/pangolin/auth`)
      if (response.data && response.data.id) {
        const data = response.data
        setAuthId(data.id)
        setFormData({
          url: data.url,
          token: data.token,
          orgName: data.org?.name || '',
          orgSlug: data.org?.slug || '',
        })
      } else {
        setAuthId(null)
      }
      setError(null)
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to fetch Pangolin credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (authId) {
        await axios.patch(`/api/v0/proxy/pangolin/auth`, formData)
      } else {
        await axios.post(`/api/v0/proxy/pangolin/auth`, formData)
      }
      await fetchAuth()
      alert('Pangolin credentials saved successfully')
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save configuration')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 bg-black text-white font-mono">
        <RefreshCcw className="w-6 h-6 animate-spin text-white" />
      </div>
    )

  return (
    <div className="bg-black text-white font-mono space-y-6 w-full">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <div className="w-1.5 h-4 bg-white" />
        <h2 className="text-lg font-bold tracking-tighter uppercase">Pangolin_Credentials</h2>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
            Pangolin URL
          </label>
          <div className="relative">
            <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
              placeholder="https://pangolin.example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
            Access Token
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
            <input
              type={showToken ? 'text' : 'password'}
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full bg-black border border-white/10 pl-9 pr-10 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
            >
              {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Organization Name
            </label>
            <div className="relative">
              <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                placeholder="Default Org"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Organization Slug
            </label>
            <div className="relative">
              <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <input
                type="text"
                value={formData.orgSlug}
                onChange={(e) => setFormData({ ...formData, orgSlug: e.target.value })}
                className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                placeholder="default-org"
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <RefreshCcw className="w-3 h-3 animate-spin" />}
            {submitting ? 'Processing...' : 'Save_Pangolin_Auth'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PangolinAuthManager
