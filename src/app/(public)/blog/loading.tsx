export default function BlogLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-3 w-16 bg-white/5 rounded-sm animate-pulse mb-4" />
        <div className="h-8 w-48 bg-white/10 rounded-sm animate-pulse mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded-sm animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-white/5 rounded-sm animate-pulse" />
        ))}
      </div>

      {/* Post cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#131313] overflow-hidden">
            {/* Cover image placeholder */}
            <div className="aspect-[16/9] bg-white/5 animate-pulse" />

            <div className="p-5">
              {/* Category badge */}
              <div className="h-5 w-20 bg-white/5 rounded-sm animate-pulse mb-3" />

              {/* Title */}
              <div className="h-5 w-full bg-white/10 rounded-sm animate-pulse mb-2" />
              <div className="h-5 w-3/4 bg-white/10 rounded-sm animate-pulse mb-4" />

              {/* Excerpt */}
              <div className="h-3 w-full bg-white/5 rounded-sm animate-pulse mb-1.5" />
              <div className="h-3 w-5/6 bg-white/5 rounded-sm animate-pulse mb-1.5" />
              <div className="h-3 w-2/3 bg-white/5 rounded-sm animate-pulse mb-5" />

              {/* Meta row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
