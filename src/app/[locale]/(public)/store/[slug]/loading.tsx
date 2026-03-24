export default function ProductDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-8 bg-white/5 animate-pulse" />
        <div className="h-3 w-2 bg-white/5 animate-pulse" />
        <div className="h-3 w-32 bg-white/5 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left column */}
        <div className="lg:col-span-3">
          {/* Cover image skeleton */}
          <div className="aspect-video bg-white/5 animate-pulse rounded-xl mb-8" />

          {/* Description skeleton */}
          <div className="mb-8">
            <div className="h-5 w-24 bg-white/10 animate-pulse mb-4 rounded-sm" />
            <div className="space-y-2">
              {[100, 95, 88, 100, 72, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-white/5 animate-pulse rounded-sm"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>

          {/* Tags skeleton */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-white/5 animate-pulse rounded-sm" />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
            {/* Title skeleton */}
            <div className="h-7 w-full bg-white/10 animate-pulse rounded-sm mb-2" />
            <div className="h-7 w-3/4 bg-white/10 animate-pulse rounded-sm mb-4" />

            {/* Seller skeleton */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-20 bg-white/5 animate-pulse rounded-sm" />
            </div>

            {/* Price skeleton */}
            <div className="mb-6 pb-6 border-b border-white/5">
              <div className="h-3 w-10 bg-white/5 animate-pulse mb-2" />
              <div className="h-8 w-28 bg-white/10 animate-pulse rounded-sm" />
            </div>

            {/* Button skeleton */}
            <div className="h-14 w-full bg-white/10 animate-pulse rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
