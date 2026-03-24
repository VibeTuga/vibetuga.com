export default function StoreLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Terminal cursor animation */}
        <div className="flex items-center gap-2 font-mono text-sm text-white/30">
          <span className="text-[#a1ffc2]">$</span>
          <span>a carregar</span>
          <span className="inline-block w-2 h-4 bg-[#a1ffc2] animate-pulse" />
        </div>
        {/* Pulsing dots */}
        <div className="flex gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#a1ffc2]"
            style={{ animation: "pulse 1.2s ease-in-out infinite" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#a1ffc2]"
            style={{ animation: "pulse 1.2s ease-in-out 0.2s infinite" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#a1ffc2]"
            style={{ animation: "pulse 1.2s ease-in-out 0.4s infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
