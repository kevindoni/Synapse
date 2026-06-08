import { CardSkeleton } from '@/components/ui/skeleton'

export default function MemoryLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="bg-card border border-border rounded-lg p-4 h-40 animate-pulse" />
    </div>
  )
}
