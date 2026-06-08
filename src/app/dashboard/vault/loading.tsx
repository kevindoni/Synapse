import { CardSkeleton } from '@/components/ui/skeleton'

export default function VaultLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          {Array.from({ length: 2 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </div>
    </div>
  )
}
