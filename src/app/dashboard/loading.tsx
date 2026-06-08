import { StatsSkeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 h-64 animate-pulse" />
        <div className="bg-card border border-border rounded-lg p-4 h-64 animate-pulse" />
      </div>
    </div>
  )
}
