'use client'

import { useEffect, useState } from 'react'
import { Brain, Search } from 'lucide-react'

interface ModelData {
  models: Array<{
    id: string
    providerId: string
    name: string
    displayName: string | null
    pricingTier: string | null
    costPer1mInput: number | null
    costPer1mOutput: number | null
    contextWindow: number | null
    available: boolean
  }>
}

const categoryColors: Record<string, string> = {
  free: 'bg-primary/10 text-primary',
  cheap: 'bg-blue-500/10 text-blue-400',
  pay_per_use: 'bg-accent/10 text-accent',
  subscription: 'bg-yellow-500/10 text-yellow-400',
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelData['models']>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/models').then((r) => r.json()).then((data) => setModels((data as ModelData).models || [])).catch(() => {})
  }, [])

  const filtered = models.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()) || m.providerId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Browse and manage all available AI models</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-muted border border-border rounded-md text-sm w-56 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          {models.length === 0 ? 'No models registered yet. Fetch models from providers.' : 'No models match your search.'}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tier</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Context</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Input $/1M</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Output $/1M</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="font-mono text-xs">{m.name}</code>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.providerId}</td>
                  <td className="px-4 py-3">
                    {m.pricingTier && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[m.pricingTier] || 'bg-muted text-muted-foreground'}`}>
                        {m.pricingTier}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{m.contextWindow ? `${m.contextWindow / 1000}K` : '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{m.costPer1mInput != null ? `$${m.costPer1mInput}` : '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{m.costPer1mOutput != null ? `$${m.costPer1mOutput}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-primary">
                      <span className={`h-1.5 w-1.5 rounded-full ${m.available ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      {m.available ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
