import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { RefreshCcw, AlertCircle, Eye, EyeOff, Link, User, Lock } from 'lucide-react'

interface NpmAuth {
  id: number
  url: string
  username: string
  password: string
}

const NpmAuthManager: React.FC = () => {
  const [auth, setAuth] = useState<NpmAuth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<Partial<NpmAuth>>({
    url: '',
    username: '',
    password: '',
  })

  const fetchAuth = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v0/proxy/npm/auth`)
      if (response.data && response.data.id) {
        setAuth(response.data)
        setFormData(response.data)
      } else {
        setAuth(null)
      }
      setError(null)
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to fetch NPM credentials')
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
      if (auth?.id) {
        await axios.patch(`/api/v0/proxy/npm/auth`, formData)
      } else {
        await axios.post(`/api/v0/proxy/npm/auth`, formData)
      }
      await fetchAuth()
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
        <h2 className="text-lg font-bold tracking-tighter uppercase">
          Nginx_Proxy_Manager_Credentials
        </h2>
      </div>

      {error && (
        <div className="p-4 border border-red-500/50 bg-red-500/10 flex items-center gap-3 text-red-500 text-xs uppercase">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
            NPM Instance URL
          </label>
          <div className="relative">
            <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
              placeholder="https://npm.example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-neutral-500 uppercase font-bold tracking-tighter">
              Email / Username
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-black border border-white/10 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/40 font-mono"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

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
                required
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
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <RefreshCcw className="w-3 h-3 animate-spin" />}
            {submitting ? 'Processing...' : 'Save_NPM_Auth'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NpmAuthManager
