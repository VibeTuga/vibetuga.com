export default function BlogPostLoading() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-8 bg-white/5 animate-pulse" />
        <div className="h-3 w-2 bg-white/5 animate-pulse" />
        <div className="h-3 w-20 bg-white/5 animate-pulse" />
      </div>

      {/* Header skeleton */}
      <header className="mb-10">
        {/* Category badge */}
        <div className="h-6 w-24 bg-white/5 animate-pulse mb-4" />

        {/* Title */}
        <div className="h-10 w-full bg-white/10 animate-pulse mb-3 rounded-sm" />
        <div className="h-10 w-4/5 bg-white/10 animate-pulse mb-3 rounded-sm" />
        <div className="h-10 w-2/3 bg-white/10 animate-pulse mb-6 rounded-sm" />

        {/* Excerpt */}
        <div className="border-l-2 border-white/5 pl-6 mb-8">
          <div className="h-4 w-full bg-white/5 animate-pulse mb-2" />
          <div className="h-4 w-3/4 bg-white/5 animate-pulse" />
        </div>

        {/* Author & meta */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-white/10 animate-pulse mb-1.5" />
              <div className="h-3 w-16 bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-white/5 animate-pulse" />
            <div className="h-3 w-14 bg-white/5 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Cover image skeleton */}
      <div className="aspect-[16/9] bg-white/5 animate-pulse mb-10" />

      {/* Content skeleton */}
      <div className="space-y-3">
        {[100, 90, 95, 85, 100, 70, 88, 92, 75, 80, 60, 95].map((w, i) => (
          <div
            key={i}
            className={`h-4 bg-white/5 animate-pulse rounded-sm`}
            style={{ width: `${w}%` }}
          />
        ))}
        <div className="h-4" />
        {[85, 100, 78, 92, 65, 88, 100, 72].map((w, i) => (
          <div
            key={`p2-${i}`}
            className="h-4 bg-white/5 animate-pulse rounded-sm"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}
