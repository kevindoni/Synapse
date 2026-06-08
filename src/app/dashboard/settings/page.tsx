'use client'

import { useEffect, useState } from 'react'
import { Settings, Server, Brain, Shield, Database, Globe, Save } from 'lucide-react'

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'providers', label: 'Providers', icon: Server },
  { id: 'models', label: 'Models', icon: Brain },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'network', label: 'Network', icon: Globe },
]

export default function SettingsPage() {
  const [active, setActive] = useState('general')
  const [config, setConfig] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => setConfig((data as { settings: Record<string, string> }).settings || {})).catch(() => {})
  }, [])

  async function handleSave(updates: Record<string, string>) {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setConfig((prev) => ({ ...prev, ...updates }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <nav className="w-48 shrink-0 space-y-0.5">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${active === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 bg-card border border-border rounded-lg p-6 overflow-y-auto">
        {active === 'general' && <GeneralSettings config={config} onSave={handleSave} saved={saved} />}
        {active === 'providers' && <ProviderSettings config={config} onSave={handleSave} saved={saved} />}
        {active === 'security' && <SecuritySettings config={config} onSave={handleSave} saved={saved} />}
        {active === 'database' && <DatabaseSettings config={config} />}
        {active === 'network' && <NetworkSettings config={config} onSave={handleSave} saved={saved} />}
        {active === 'models' && (
          <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
            Model settings are managed in the Models page
          </div>
        )}
      </div>
    </div>
  )
}

function GeneralSettings({ config, onSave, saved }: { config: Record<string, string>; onSave: (u: Record<string, string>) => void; saved: boolean }) {
  const [port, setPort] = useState(config.port || '3333')
  const [logLevel, setLogLevel] = useState(config.logLevel || 'info')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">General Settings</h2>
        <button onClick={() => onSave({ port, logLevel })} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Gateway Port</label>
          <input type="number" value={port} onChange={(e) => setPort(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Log Level</label>
          <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-ring">
            <option>debug</option>
            <option>info</option>
            <option>warn</option>
            <option>error</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Data Directory</label>
          <code className="text-sm bg-muted border border-border rounded-md px-3 py-1.5 block">~/.synapse/</code>
        </div>
      </div>
    </div>
  )
}

function ProviderSettings({ config, onSave, saved }: { config: Record<string, string>; onSave: (u: Record<string, string>) => void; saved: boolean }) {
  const [timeout, setTimeout_] = useState(config.requestTimeout || '30000')
  const [retries, setRetries] = useState(config.maxRetries || '3')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Provider Settings</h2>
        <button onClick={() => onSave({ requestTimeout: timeout, maxRetries: retries })} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Configure global provider behavior, timeouts, and retries</p>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Request Timeout (ms)</label>
          <input type="number" value={timeout} onChange={(e) => setTimeout_(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Max Retries</label>
          <input type="number" value={retries} onChange={(e) => setRetries(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ config, onSave, saved }: { config: Record<string, string>; onSave: (u: Record<string, string>) => void; saved: boolean }) {
  const [rateLimit, setRateLimit] = useState(config.rateLimitEnabled !== 'false' ? 'true' : 'false')
  const [keyRotation, setKeyRotation] = useState(config.keyRotationDays || '90')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Security Settings</h2>
        <button onClick={() => onSave({ rateLimitEnabled: rateLimit, keyRotationDays: keyRotation })} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Key Rotation (days)</label>
          <input type="number" value={keyRotation} onChange={(e) => setKeyRotation(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={rateLimit === 'true'} onChange={(e) => setRateLimit(e.target.checked ? 'true' : 'false')} className="accent-primary" id="rate-limit" />
          <label htmlFor="rate-limit" className="text-sm">Enable rate limiting</label>
        </div>
      </div>
    </div>
  )
}

function DatabaseSettings({ config }: { config: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Database</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Engine</span>
          <span className="font-mono text-xs">SQLite (better-sqlite3)</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ORM</span>
          <span className="font-mono text-xs">Drizzle</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Journal Mode</span>
          <span className="font-mono text-xs">WAL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Location</span>
          <span className="font-mono text-xs">{config.dbPath || '~/.synapse/synapse.db'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tables</span>
          <span>21</span>
        </div>
      </div>
    </div>
  )
}

function NetworkSettings({ config, onSave, saved }: { config: Record<string, string>; onSave: (u: Record<string, string>) => void; saved: boolean }) {
  const [cors, setCors] = useState(config.corsEnabled !== 'false' ? 'true' : 'false')
  const [allowedOrigins, setAllowedOrigins] = useState(config.allowedOrigins || '*')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Network Settings</h2>
        <button onClick={() => onSave({ corsEnabled: cors, allowedOrigins })} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={cors === 'true'} onChange={(e) => setCors(e.target.checked ? 'true' : 'false')} className="accent-primary" id="cors" />
          <label htmlFor="cors" className="text-sm">Enable CORS</label>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Allowed Origins</label>
          <input type="text" value={allowedOrigins} onChange={(e) => setAllowedOrigins(e.target.value)} className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm w-full max-w-md focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
    </div>
  )
}
