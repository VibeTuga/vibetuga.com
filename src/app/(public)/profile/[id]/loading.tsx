export default function ProfileLoading() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      {/* Hero section skeleton */}
      <div className="bg-[#131313] p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse flex-shrink-0" />

          <div className="flex-1 text-center md:text-left">
            {/* Name */}
            <div className="h-7 w-40 bg-white/10 animate-pulse mb-2 mx-auto md:mx-0" />
            {/* Username */}
            <div className="h-4 w-28 bg-white/5 animate-pulse mb-4 mx-auto md:mx-0" />

            {/* Stats row */}
            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-6 w-12 bg-white/10 animate-pulse" />
                  <div className="h-3 w-10 bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Level / XP bar */}
            <div className="h-3 w-full bg-white/5 animate-pulse mb-1" />
            <div className="h-2 w-full bg-white/5 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-white/5 animate-pulse" />
        ))}
      </div>

      {/* Tab content skeleton — badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[#131313] p-4 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
            <div className="h-3 w-20 bg-white/5 animate-pulse" />
            <div className="h-2 w-14 bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
