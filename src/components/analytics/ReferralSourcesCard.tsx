"use client";

type ReferralSource = {
  source: string;
  count: number;
};

type Props = {
  sources: ReferralSource[];
};

const SOURCE_COLORS: Record<string, string> = {
  direct: "#a1ffc2",
  search: "#81e9ff",
  discord: "#d873ff",
  internal: "#a1ffc2",
  twitter: "#81e9ff",
  facebook: "#d873ff",
  linkedin: "#81e9ff",
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direto",
  search: "Pesquisa",
  discord: "Discord",
  internal: "Interno",
  twitter: "Twitter / X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? "rgba(255,255,255,0.3)";
}

function getSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function ReferralSourcesCard({ sources }: Props) {
  if (sources.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
          Fontes de Tráfego
        </p>
        <p className="text-sm text-white/20 font-mono">Sem dados disponíveis</p>
      </div>
    );
  }

  const maxCount = Math.max(...sources.map((s) => s.count), 1);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
        Fontes de Tráfego
      </p>
      <div className="space-y-3">
        {sources.map((s) => {
          const color = getSourceColor(s.source);
          const width = (s.count / maxCount) * 100;

          return (
            <div key={s.source}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-white/60">{getSourceLabel(s.source)}</span>
                <span className="text-xs font-mono font-bold" style={{ color }}>
                  {s.count}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: color,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
