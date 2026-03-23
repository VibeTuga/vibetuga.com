type Props = {
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  topSource: string;
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

function formatSourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function AnalyticsSummary({
  totalViews,
  viewsLast7Days,
  viewsLast30Days,
  topSource,
}: Props) {
  const stats = [
    { label: "Total de Visualizações", value: totalViews.toLocaleString("pt-PT") },
    { label: "Últimos 7 Dias", value: viewsLast7Days.toLocaleString("pt-PT") },
    { label: "Últimos 30 Dias", value: viewsLast30Days.toLocaleString("pt-PT") },
    { label: "Fonte Principal", value: formatSourceLabel(topSource) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface-container-lowest rounded-xl p-6">
          <p className="text-sm text-white/50 mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-primary font-mono">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
