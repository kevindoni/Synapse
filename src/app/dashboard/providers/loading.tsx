import { CardSkeleton } from '@/components/ui/skeleton'

export default function ProvidersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
