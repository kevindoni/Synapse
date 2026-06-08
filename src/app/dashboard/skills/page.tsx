'use client'

import { useEffect, useState } from 'react'
import { Wrench, Plus, RotateCw, Package, Download } from 'lucide-react'

interface SkillsData {
  skills: Array<{
    id: string
    name: string
    description: string | null
    enabled: boolean
    groupId: string | null
    usageCount: number | null
    qualityScore: number | null
    tags: string | null
    createdAt: string
  }>
  groups: Array<{
    id: string
    name: string
    description: string | null
    rotationStrategy: string
    enabled: boolean
  }>
}

export default function SkillsPage() {
  const [data, setData] = useState<SkillsData | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', systemPrompt: '' })

  useEffect(() => {
    fetch('/api/skills').then((r) => r.json()).then(setData).catch(() => {})
  }, [])

  async function handleCreate() {
    if (!form.name || !form.systemPrompt) return
    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    })
    setShowCreate(false)
    setForm({ name: '', description: '', systemPrompt: '' })
    const res = await fetch('/api/skills')
    setData(await res.json())
  }

  const skills = data?.skills || []
  const groups = data?.groups || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage skills, groups, and rotation strategies</p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Import
          </button>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Create Skill
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium">New Skill</h3>
          <input placeholder="Skill name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <textarea placeholder="System prompt..." value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={4} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" /> Skills ({skills.length})
          </h2>
          {skills.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              No skills created yet. Click &quot;Create Skill&quot; to add one.
            </div>
          ) : (
            skills.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description || 'No description'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {s.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{s.usageCount || 0} uses</span>
                  {s.qualityScore != null && <span>Quality: {Number(s.qualityScore).toFixed(1)}</span>}
                  {s.groupId && <span className="bg-muted px-1.5 py-0.5 rounded">Grouped</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" /> Groups ({groups.length})
            </h2>
            {groups.length === 0 ? (
              <div className="text-xs text-muted-foreground">No groups yet.</div>
            ) : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <div key={g.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{g.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <RotateCw className="h-3 w-3" /> {g.rotationStrategy.replace('_', ' ')}
                      </div>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${g.enabled ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
