"use client";

interface DailySale {
  date: string;
  sales: number;
  revenue: number;
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function SalesChart({ dailySales }: { dailySales: DailySale[] }) {
  // Fill 30 days
  const today = new Date();
  const days: DailySale[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = dailySales.find((s) => s.date === dateStr);
    days.push(existing ?? { date: dateStr, sales: 0, revenue: 0 });
  }

  const maxRevenue = Math.max(...days.map((d) => d.revenue), 1);

  return (
    <div className="bg-surface-container-lowest border border-white/5 p-6">
      <h3 className="font-headline text-sm font-bold text-white uppercase tracking-tight mb-4">
        Vendas — Últimos 30 dias
      </h3>
      <div className="flex items-end gap-[3px] h-40">
        {days.map((day) => {
          const height = Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0);
          const dateLabel = new Date(day.date).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
          });
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className="w-full bg-primary/60 hover:bg-primary transition-colors"
                style={{ height: `${height}%`, minHeight: day.revenue > 0 ? "3px" : "0" }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-surface-container-high border border-white/10 px-2 py-1 text-[9px] font-mono text-white whitespace-nowrap">
                  <div>{dateLabel}</div>
                  <div className="text-primary">{day.sales} vendas</div>
                  <div>{formatPrice(day.revenue)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[9px] font-mono text-white/20">
        <span>
          {new Date(days[0].date).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <span>Hoje</span>
      </div>
    </div>
  );
}
