'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('synapse_token', data.token)
      localStorage.setItem('synapse_user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Synapse</h1>
          <p className="text-sm text-muted-foreground">AI Gateway & Intelligence Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="text-sm font-medium block mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Default password: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">changeme</code>
        </p>
      </div>
    </div>
  )
}
