'use client'

import { useEffect, useState } from 'react'
import { Server, Plus, Eye, EyeOff, Trash2, RefreshCw, Key } from 'lucide-react'

interface ProviderData {
  providers: Array<{
    id: string
    name: string
    prefix: string
    type: string
    enabled: boolean
    config: string
    createdAt: string
    health: {
      status: string
      avgLatencyMs: number | null
      successRate: number | null
      errorRate: number | null
    } | null
  }>
}

interface AccountData {
  id: string
  providerId: string
  label: string | null
  enabled: boolean
  priority: number
  hasApiKey: boolean
  lastUsedAt: string | null
  createdAt: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderData['providers']>([])
  const [accounts, setAccounts] = useState<AccountData[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddAccount, setShowAddAccount] = useState<string | null>(null)
  const [accountForm, setAccountForm] = useState({ label: '', apiKey: '' })
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [fetching, setFetching] = useState<Record<string, boolean>>({})

  function loadData() {
    Promise.all([
      fetch('/api/providers').then((r) => r.json()).catch(() => ({ providers: [] })),
      fetch('/api/providers/accounts').then((r) => r.json()).catch(() => ({ accounts: [] })),
    ]).then(([pData, aData]) => {
      setProviders((pData as ProviderData).providers || [])
      setAccounts((aData as { accounts: AccountData[] }).accounts || [])
    })
  }

  useEffect(() => { loadData() }, [])

  async function handleAddAccount(providerId: string) {
    if (!accountForm.apiKey) return
    await fetch('/api/providers/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, label: accountForm.label, apiKey: accountForm.apiKey }),
    })
    setShowAddAccount(null)
    setAccountForm({ label: '', apiKey: '' })
    loadData()
  }

  async function handleDeleteAccount(id: string) {
    await fetch('/api/providers/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadData()
  }

  async function handleFetchModels(providerId: string) {
    setFetching((prev) => ({ ...prev, [providerId]: true }))
    try {
      await fetch('/api/providers/fetch-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      })
    } finally {
      setFetching((prev) => ({ ...prev, [providerId]: false }))
    }
  }

  async function handleToggleAccount(id: string, enabled: boolean) {
    await fetch('/api/providers/accounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    })
    loadData()
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Configure AI providers, manage API keys, and fetch available models</p>

      {providers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No providers registered. Bootstrap runs on startup.
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => {
            const providerAccounts = accounts.filter((a) => a.providerId === p.id)
            const isExpanded = expanded === p.id

            return (
              <div key={p.id} className="bg-card border border-border rounded-lg">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{p.name}</h3>
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{p.prefix}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Type: {p.type}</span>
                          <span>{providerAccounts.length} account(s)</span>
                          {p.health && (
                            <>
                              <span className={p.health.status === 'healthy' ? 'text-primary' : 'text-destructive'}>
                                {p.health.status}
                              </span>
                              {p.health.avgLatencyMs != null && <span>{p.health.avgLatencyMs}ms</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {p.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : p.id)}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
                      >
                        {isExpanded ? 'Collapse' : 'Manage'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Accounts</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFetchModels(p.id)}
                          disabled={fetching[p.id]}
                          className="flex items-center gap-1.5 px-2 py-1 text-xs border border-border rounded hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${fetching[p.id] ? 'animate-spin' : ''}`} />
                          Fetch Models
                        </button>
                        <button
                          onClick={() => setShowAddAccount(showAddAccount === p.id ? null : p.id)}
                          className="flex items-center gap-1.5 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add Account
                        </button>
                      </div>
                    </div>

                    {showAddAccount === p.id && (
                      <div className="bg-muted/50 border border-border rounded-md p-3 space-y-2">
                        <input
                          placeholder="Label (e.g. Production)"
                          value={accountForm.label}
                          onChange={(e) => setAccountForm({ ...accountForm, label: e.target.value })}
                          className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <div className="relative">
                          <input
                            type={showApiKey[`new-${p.id}`] ? 'text' : 'password'}
                            placeholder="API Key"
                            value={accountForm.apiKey}
                            onChange={(e) => setAccountForm({ ...accountForm, apiKey: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey((prev) => ({ ...prev, [`new-${p.id}`]: !prev[`new-${p.id}`] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showApiKey[`new-${p.id}`] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAddAccount(p.id)} disabled={!accountForm.apiKey} className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50">Save</button>
                          <button onClick={() => { setShowAddAccount(null); setAccountForm({ label: '', apiKey: '' }) }} className="px-3 py-1 border border-border rounded text-xs hover:bg-muted">Cancel</button>
                        </div>
                      </div>
                    )}

                    {providerAccounts.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2">No accounts configured. Add an API key to start using this provider.</div>
                    ) : (
                      providerAccounts.map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-muted/30 border border-border rounded-md px-3 py-2">
                          <div className="flex items-center gap-3">
                            <Key className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <span className="text-sm">{a.label || 'Unnamed'}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {a.hasApiKey ? 'Key configured' : 'No key'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {a.lastUsedAt ? `Used ${new Date(a.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                            </span>
                            <button
                              onClick={() => handleToggleAccount(a.id, !a.enabled)}
                              className={`text-xs px-2 py-0.5 rounded-full ${a.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                            >
                              {a.enabled ? 'Active' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(a.id)}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
