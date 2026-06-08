import { CardSkeleton } from '@/components/ui/skeleton'

export default function SkillsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
