'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Server,
} from 'lucide-react'

interface DashboardData {
  stats: {
    totalRequests: number
    todayTokens: number
    todayCost: number
    cacheHits: number
  }
  recentRequests: Array<{
    id: string
    requestId: string
    model: string
    providerId: string | null
    inputTokens: number | null
    outputTokens: number | null
    tokensSaved: number | null
    cost: number | null
    latencyMs: number | null
    statusCode: number | null
    fallbackUsed: number | null
    cached: number | null
    createdAt: string
  }>
  providers: Array<{
    id: string
    name: string
    prefix: string
    enabled: boolean
    health: {
      status: string
      avgLatencyMs: number | null
      successRate: number | null
    } | null
  }>
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'healthy' ? 'bg-primary' : status === 'degraded' ? 'bg-yellow-500' : 'bg-destructive'
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) setData(await res.json())
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Loading dashboard...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Unable to load dashboard data. Make sure the database is initialized.
      </div>
    )
  }

  const stats = [
    { label: 'Total Requests', value: formatNumber(data.stats.totalRequests), change: '', up: true, icon: Activity },
    { label: 'Tokens Used', value: formatNumber(data.stats.todayTokens), change: '', up: true, icon: Zap },
    { label: 'Total Cost', value: `$${Number(data.stats.todayCost).toFixed(2)}`, change: '', up: false, icon: DollarSign },
    { label: 'Cache Hits', value: formatNumber(data.stats.cacheHits), change: '', up: true, icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Recent Requests</h2>
          </div>
          {data.recentRequests.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No requests yet. Send a request to <code className="font-mono text-xs">/api/v1/chat/completions</code> to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentRequests.slice(0, 10).map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-4 text-sm">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="font-mono text-xs">{r.model}</span>
                  <span className="text-muted-foreground text-xs">{r.providerId || '—'}</span>
                  <span className="ml-auto text-muted-foreground text-xs">
                    {(r.inputTokens || 0) + (r.outputTokens || 0)} tok
                  </span>
                  <span className="text-muted-foreground text-xs w-16 text-right">
                    {r.latencyMs ? `${r.latencyMs}ms` : '—'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.cached ? 'bg-accent/10 text-accent'
                      : r.fallbackUsed ? 'bg-yellow-500/10 text-yellow-500'
                        : r.statusCode && r.statusCode >= 400 ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                  }`}>
                    {r.cached ? 'cached' : r.fallbackUsed ? 'fallback' : r.statusCode && r.statusCode >= 400 ? 'error' : 'success'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Providers</h2>
          </div>
          {data.providers.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No providers configured yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.providers.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                  <StatusDot status={p.health?.status || 'unknown'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.prefix}</div>
                  </div>
                  {p.health && (
                    <div className="text-xs text-muted-foreground">
                      {p.health.avgLatencyMs ? `${p.health.avgLatencyMs}ms` : '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
