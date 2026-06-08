export default function PlaygroundLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex-1 bg-card border border-border rounded-lg p-4 mb-4 flex items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Loading playground...</div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 animate-pulse rounded bg-muted" />
        <div className="h-10 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
