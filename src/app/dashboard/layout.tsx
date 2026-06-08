'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { AuthGuard, useAuth } from '@/lib/auth/guard'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import {
  LayoutDashboard,
  Server,
  Brain,
  Route,
  Wrench,
  Sparkles,
  MessageSquare,
  Shield,
  Settings,
  Database,
  Menu,
  X,
  Zap,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/dashboard/providers', label: 'Providers', icon: Server },
  { href: '/dashboard/models', label: 'Models', icon: Brain },
  { href: '/dashboard/routes', label: 'Routes', icon: Route },
  { href: '/dashboard/skills', label: 'Skills', icon: Wrench },
  { href: '/dashboard/intelligence', label: 'Intelligence', icon: Sparkles },
  { href: '/dashboard/playground', label: 'Playground', icon: MessageSquare },
  { href: '/dashboard/memory', label: 'Memory', icon: Database },
  { href: '/dashboard/vault', label: 'Vault', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ToastProvider>
        <ErrorBoundary>
          <DashboardShell>{children}</DashboardShell>
        </ErrorBoundary>
      </ToastProvider>
    </AuthGuard>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'hidden lg:flex flex-col w-64 border-r border-border bg-sidebar shrink-0',
          mobileOpen && 'fixed inset-y-0 left-0 z-50 flex lg:hidden'
        )}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground tracking-tight">Synapse</span>
          <span className="text-xs text-muted-foreground ml-auto font-mono">v2.0</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-sidebar-active font-medium'
                    : 'text-sidebar-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            System Online
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{user?.name || 'Admin'}</span>
            <button onClick={logout} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-3 w-3" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-14 px-4 border-b border-border bg-card shrink-0">
          <button
            className="lg:hidden mr-3 p-1 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-sm font-medium">
              {navItems.find((i) => pathname === i.href || (i.href !== '/dashboard' && pathname.startsWith(i.href)))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>localhost:3333</span>
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <button onClick={logout} className="lg:hidden flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
