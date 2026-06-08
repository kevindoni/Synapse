'use client'

import { useEffect, useState } from 'react'
import { Shield, Key, Plus, Trash2, Copy } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  createdAt: string
  lastUsedAt: string | null
  requestCount: number
}

export default function VaultPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/keys').then((r) => r.json()).then((data) => setKeys((data as { keys: ApiKey[] }).keys || [])).catch(() => {})
  }, [])

  async function handleCreate() {
    if (!newKeyName.trim()) return
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim() }),
    })
    const data = await res.json()
    if (data.key) {
      setCreatedKey(data.key)
      setNewKeyName('')
      setShowCreate(false)
      const refreshed = await fetch('/api/keys').then((r) => r.json())
      setKeys((refreshed as { keys: ApiKey[] }).keys || [])
    }
  }

  async function handleRevoke(id: string) {
    await fetch('/api/keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage API keys and access control</p>

      {createdKey && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary">API Key Created</h3>
            <button onClick={() => { navigator.clipboard.writeText(createdKey) }} className="flex items-center gap-1 text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <code className="text-xs font-mono break-all block bg-muted/50 p-2 rounded">{createdKey}</code>
          <p className="text-xs text-muted-foreground mt-2">Copy this key now. You won&apos;t be able to see it again.</p>
          <button onClick={() => setCreatedKey(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" /> API Keys ({keys.length})
            </h2>
            <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Generate Key
            </button>
          </div>

          {showCreate && (
            <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-2">
              <input placeholder="Key name (e.g. Production)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} className="flex-1 bg-muted border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              <button onClick={handleCreate} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">Create</button>
              <button onClick={() => { setShowCreate(false); setNewKeyName('') }} className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-muted">Cancel</button>
            </div>
          )}

          {keys.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
              No API keys generated yet. Create one to start using the gateway.
            </div>
          ) : (
            keys.map((k) => (
              <div key={k.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{k.name}</h3>
                  <button onClick={() => handleRevoke(k.id)} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded block mb-3">{k.keyPrefix}</code>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                  <span>Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</span>
                  <span>{k.requestCount.toLocaleString()} requests</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Security</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Key Format</span>
              <span className="font-mono text-xs">adn_...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hashing</span>
              <span className="font-mono text-xs">SHA-256</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rate Limit</span>
              <span>100 req/min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Keys</span>
              <span>{keys.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
