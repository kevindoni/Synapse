'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Brain, TrendingUp, Lightbulb } from 'lucide-react'

interface NeuralRouterData {
  defaultStrategy: string
  totalSamples: number
  accuracy: number
}

interface ForensicsData {
  recentFailures: Array<Record<string, unknown>>
  slowRequests: Array<Record<string, unknown>>
}

export default function IntelligencePage() {
  const [routerData, setRouterData] = useState<NeuralRouterData | null>(null)
  const [forensicsData, setForensicsData] = useState<ForensicsData | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/intelligence/neural-router').then((r) => r.json()).catch(() => null),
      fetch('/api/intelligence/forensics').then((r) => r.json()).catch(() => null),
    ]).then(([router, forensics]) => {
      if (router) setRouterData(router as NeuralRouterData)
      if (forensics) setForensicsData(forensics as ForensicsData)
    })
  }, [])

  const metrics = [
    { label: 'Routing Strategy', value: routerData?.defaultStrategy || '—', icon: Brain },
    { label: 'Training Samples', value: (routerData?.totalSamples || 0).toLocaleString(), icon: TrendingUp },
    { label: 'Router Accuracy', value: routerData ? `${(routerData.accuracy * 100).toFixed(1)}%` : '—', icon: Sparkles },
    { label: 'Recent Failures', value: (forensicsData?.recentFailures?.length || 0).toString(), icon: Lightbulb },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Self-learning engine, neural router, and request forensics</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</span>
              <m.icon className="h-4 w-4 text-accent" />
            </div>
            <span className="text-2xl font-semibold">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium">Neural Router</h2>
            <button
              onClick={async () => {
                const strategy = routerData?.defaultStrategy === 'hybrid' ? 'priority' : 'hybrid'
                await fetch('/api/intelligence/neural-router', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ strategy }),
                })
                setRouterData((prev) => prev ? { ...prev, defaultStrategy: strategy } : null)
              }}
              className="text-xs px-2 py-1 border border-border rounded hover:bg-muted"
            >
              Toggle Strategy
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Strategy</span>
              <span className="font-medium capitalize">{routerData?.defaultStrategy || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Samples</span>
              <span>{(routerData?.totalSamples || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className={routerData && routerData.accuracy > 0.8 ? 'text-primary' : 'text-yellow-500'}>
                {routerData ? `${(routerData.accuracy * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-primary flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Request Forensics</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recent Failures</span>
              <span>{forensicsData?.recentFailures?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Slow Requests (&gt;3s)</span>
              <span>{forensicsData?.slowRequests?.length || 0}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Forensic analysis runs automatically on each request, providing root cause analysis, latency breakdowns, and optimization suggestions.
            </div>
            <button
              onClick={async () => { await fetch('/api/distill', { method: 'POST' }) }}
              className="w-full px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-md text-sm hover:bg-accent/20 transition-colors"
            >
              Trigger Distillation Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
