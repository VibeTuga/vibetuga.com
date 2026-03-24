"use client";

import type { SellerDailySale } from "@/lib/db/queries/store";

interface SalesChartProps {
  data: SellerDailySale[];
  days?: number;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function SalesChart({ data, days = 30 }: SalesChartProps) {
  // Fill in missing days with zero values
  const filledData = fillDays(data, days);
  const maxRevenue = Math.max(...filledData.map((d) => d.revenue), 1);
  const maxSales = Math.max(...filledData.map((d) => d.sales), 1);
  const totalRevenue = filledData.reduce((sum, d) => sum + d.revenue, 0);
  const totalSales = filledData.reduce((sum, d) => sum + d.sales, 0);

  const chartHeight = 200;
  const chartWidth = 100; // percentage
  const barCount = filledData.length;

  // Show labels every ~5 days
  const labelInterval = Math.max(1, Math.floor(barCount / 6));

  return (
    <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          Vendas &mdash; &uacute;ltimos {days} dias
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
          <span>&euro;{formatCents(totalRevenue)} total</span>
          <span>{totalSales} vendas</span>
        </div>
      </div>

      {totalSales === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-sm font-mono">
          Sem vendas neste per&iacute;odo
        </div>
      ) : (
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <div
              key={fraction}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ bottom: `${fraction * 100}%` }}
            >
              <span className="absolute -left-1 -translate-x-full text-[9px] font-mono text-white/20 -translate-y-1/2">
                &euro;{formatCents(Math.round(maxRevenue * fraction))}
              </span>
            </div>
          ))}

          {/* Bars */}
          <div
            className="absolute inset-0 flex items-end gap-px pl-10"
            style={{ width: `${chartWidth}%` }}
          >
            {filledData.map((day, i) => {
              const height = (day.revenue / maxRevenue) * 100;
              const salesHeight = (day.sales / maxSales) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                  style={{ height: "100%" }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-surface-container-highest border border-white/10 px-3 py-2 rounded text-[10px] font-mono whitespace-nowrap">
                      <p className="text-white/60">{formatDate(day.date)}</p>
                      <p className="text-primary">&euro;{formatCents(day.revenue)}</p>
                      <p className="text-tertiary">
                        {day.sales} {day.sales === 1 ? "venda" : "vendas"}
                      </p>
                    </div>
                  </div>
                  {/* Revenue bar */}
                  <div
                    className="w-full bg-primary/60 hover:bg-primary/80 transition-colors rounded-t-sm min-h-px"
                    style={{ height: `${Math.max(height, day.revenue > 0 ? 2 : 0)}%` }}
                  />
                  {/* Sales dot overlay */}
                  {day.sales > 0 && (
                    <div
                      className="absolute w-1.5 h-1.5 bg-tertiary rounded-full"
                      style={{ bottom: `${salesHeight}%` }}
                    />
                  )}
                  {/* X-axis label */}
                  {i % labelInterval === 0 && (
                    <span className="absolute -bottom-5 text-[8px] font-mono text-white/20 whitespace-nowrap">
                      {formatDate(day.date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-8 text-[10px] font-mono text-white/30">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 bg-primary/60 rounded-sm" /> Receita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-tertiary rounded-full" /> Vendas
        </span>
      </div>
    </div>
  );
}

function fillDays(data: SellerDailySale[], days: number): SellerDailySale[] {
  const map = new Map(data.map((d) => [d.date, d]));
  const result: SellerDailySale[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push(map.get(dateStr) ?? { date: dateStr, revenue: 0, sales: 0 });
  }

  return result;
}
