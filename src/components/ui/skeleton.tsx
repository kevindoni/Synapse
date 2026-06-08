export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className || ''}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-4 py-2.5">
        <Skeleton className="h-3 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border px-4 py-3 flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  )
}
