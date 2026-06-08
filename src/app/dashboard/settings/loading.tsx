export default function SettingsLoading() {
  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      <div className="w-48 shrink-0 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="flex-1 bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-9 w-40 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
