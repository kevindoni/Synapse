import { StatsSkeleton } from '@/components/ui/skeleton'

export default function IntelligenceLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 h-64 animate-pulse" />
        <div className="bg-card border border-border rounded-lg p-4 h-64 animate-pulse" />
      </div>
    </div>
  )
}
