'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export function useAuth() {
  const [user, setUser] = useState<{ id: string; role: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('synapse_token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/auth/login', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Invalid token')
        return r.json()
      })
      .then((data) => {
        setUser(data.user)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('synapse_token')
        localStorage.removeItem('synapse_user')
        setLoading(false)
      })
  }, [router])

  function logout() {
    localStorage.removeItem('synapse_token')
    localStorage.removeItem('synapse_user')
    setUser(null)
    router.push('/login')
  }

  return { user, loading, logout }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
