export default function LeaderboardLoading() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-3 w-24 bg-white/5 animate-pulse mb-4" />
        <div className="h-8 w-48 bg-white/10 animate-pulse mb-2" />
        <div className="h-4 w-72 bg-white/5 animate-pulse" />
      </div>

      {/* Podium top 3 skeletons */}
      <div className="flex items-end justify-center gap-4 mb-12">
        {/* 2nd place */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-20 bg-white/5 animate-pulse" />
          <div className="h-4 w-12 bg-white/5 animate-pulse" />
          <div className="w-28 h-20 bg-white/5 animate-pulse" />
        </div>
        {/* 1st place */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 bg-white/10 animate-pulse mb-1" />
          <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-24 bg-white/5 animate-pulse" />
          <div className="h-4 w-16 bg-white/5 animate-pulse" />
          <div className="w-28 h-28 bg-white/5 animate-pulse" />
        </div>
        {/* 3rd place */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-18 bg-white/5 animate-pulse" />
          <div className="h-4 w-12 bg-white/5 animate-pulse" />
          <div className="w-28 h-16 bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-[#131313] divide-y divide-white/5">
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-3">
          <div className="h-3 w-8 bg-white/5 animate-pulse" />
          <div className="h-3 w-32 bg-white/5 animate-pulse flex-1" />
          <div className="h-3 w-16 bg-white/5 animate-pulse" />
          <div className="h-3 w-12 bg-white/5 animate-pulse" />
        </div>

        {/* Rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="h-4 w-6 bg-white/5 animate-pulse font-mono" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              <div>
                <div className="h-4 w-28 bg-white/10 animate-pulse mb-1" />
                <div className="h-3 w-16 bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-16 bg-white/5 animate-pulse font-mono" />
            <div className="h-5 w-20 bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
