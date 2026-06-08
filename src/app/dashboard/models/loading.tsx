import { TableSkeleton } from '@/components/ui/skeleton'

export default function ModelsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  )
}
