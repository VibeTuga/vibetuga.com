export default function ShowcaseLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-3 w-24 bg-white/5 animate-pulse mb-4" />
        <div className="h-8 w-56 bg-white/10 animate-pulse mb-2" />
        <div className="h-4 w-80 bg-white/5 animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-white/5 animate-pulse" />
        ))}
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#131313] overflow-hidden">
            {/* Cover image */}
            <div className="aspect-video bg-white/5 animate-pulse" />

            <div className="p-5">
              {/* Title */}
              <div className="h-5 w-3/4 bg-white/10 animate-pulse mb-2" />
              <div className="h-3 w-full bg-white/5 animate-pulse mb-1.5" />
              <div className="h-3 w-4/5 bg-white/5 animate-pulse mb-4" />

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-5 w-14 bg-white/5 animate-pulse" />
                ))}
              </div>

              {/* Author + votes */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-3 w-20 bg-white/5 animate-pulse" />
                </div>
                <div className="h-5 w-10 bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
