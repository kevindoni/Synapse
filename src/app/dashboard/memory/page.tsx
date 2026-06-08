'use client'

import { useEffect, useState } from 'react'
import { Database, Clock, BookOpen, Wrench } from 'lucide-react'

interface MemoryStats {
  stats: { episodes: number; knowledge: number; rules: number; totalSize: string }
}

export default function MemoryPage() {
  const [stats, setStats] = useState<MemoryStats['stats'] | null>(null)

  useEffect(() => {
    fetch('/api/memory').then((r) => r.json()).then((data) => setStats((data as MemoryStats).stats)).catch(() => {})
  }, [])

  const memoryTypes = [
    { type: 'Episodic', icon: Clock, description: 'Conversational experiences with 90-day rolling window', count: stats?.episodes || 0, color: 'text-primary', bgColor: 'bg-primary/10' },
    { type: 'Semantic', icon: BookOpen, description: 'Permanent knowledge facts extracted from episodes', count: stats?.knowledge || 0, color: 'text-accent', bgColor: 'bg-accent/10' },
    { type: 'Procedural', icon: Wrench, description: 'Compiled rules and decision procedures', count: stats?.rules || 0, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Persistent memory system with episodic, semantic, and procedural layers</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {memoryTypes.map((m) => (
          <div key={m.type} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${m.bgColor}`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <h3 className="font-medium text-sm">{m.type} Memory</h3>
            </div>
            <p className="text-xs text-muted-foreground">{m.description}</p>
            <div className="pt-2 border-t border-border">
              <div className="text-lg font-semibold">{m.count.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">entries</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Memory Operations</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={async () => { await fetch('/api/distill', { method: 'POST' }) }} className="p-3 border border-border rounded-md text-sm hover:bg-muted transition-colors text-left">
            <div className="font-medium">Distill Now</div>
            <div className="text-xs text-muted-foreground mt-1">Run experience distillation</div>
          </button>
          <div className="p-3 border border-border rounded-md text-sm">
            <div className="font-medium">Search</div>
            <div className="text-xs text-muted-foreground mt-1">Query across all memory types</div>
          </div>
          <div className="p-3 border border-border rounded-md text-sm">
            <div className="font-medium">Export</div>
            <div className="text-xs text-muted-foreground mt-1">Export all memory data</div>
          </div>
          <div className="p-3 border border-border rounded-md text-sm">
            <div className="font-medium">Cleanup</div>
            <div className="text-xs text-muted-foreground mt-1">Remove expired episodes</div>
          </div>
        </div>
      </div>
    </div>
  )
}
