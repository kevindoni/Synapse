'use client'

import { useEffect, useState } from 'react'
import { Route, Plus, ArrowRight } from 'lucide-react'

interface Pipeline {
  id: string
  name: string
  description: string | null
  nodes: Array<{ id: string; type: string; config: Record<string, unknown> }>
  connections: Array<{ from: string; to: string }>
  enabled: boolean
}

export default function RoutesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])

  useEffect(() => {
    fetch('/api/routes/pipeline').then((r) => r.json()).then((data) => setPipelines((data as { pipelines: Pipeline[] }).pipelines || [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Configure routing pipelines and fallback chains</p>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Add Pipeline
        </button>
      </div>

      {pipelines.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No pipelines configured. The default pipeline processes requests through provider routing with automatic fallback.
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Route className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-medium text-sm flex-1">{p.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {p.nodes?.length || 0} nodes
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {p.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              {p.description && (
                <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
              )}

              {p.nodes && p.nodes.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {p.nodes.map((n, i) => (
                    <span key={n.id} className="flex items-center gap-1">
                      {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {n.type}
                      </code>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
