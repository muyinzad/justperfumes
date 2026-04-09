'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login failed')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-2xl font-bold mb-2">
            JUST<span className="text-accent-gold">PERFUMES</span>
          </p>
          <h1 className="text-xl font-semibold">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-xl p-8 border border-border space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 rounded-lg border border-error/30">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-text-secondary mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@justperfumes.com"
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-gold transition-colors" />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-gold transition-colors" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-accent-gold text-bg-primary font-semibold rounded-lg
              hover:bg-accent-gold-lt transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
