export default function QrCodesLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted" />
          <div>
            <div className="h-7 w-40 bg-muted rounded-lg mb-2" />
            <div className="h-4 w-64 bg-muted rounded-md" />
          </div>
        </div>
        <div className="h-8 w-36 bg-muted rounded-full" />
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div className="h-72 rounded-xl bg-muted" />
          <div className="h-96 rounded-xl bg-muted" />
        </div>
        {/* Right column */}
        <div className="space-y-4">
          <div className="h-[420px] rounded-xl bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
