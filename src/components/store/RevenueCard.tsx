"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RevenueCardProps {
  totalRevenue: number;
  totalSales: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthSales: number;
  lastMonthSales: number;
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getChangePercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function RevenueCard({
  totalRevenue,
  totalSales,
  thisMonthRevenue,
  lastMonthRevenue,
  thisMonthSales,
  lastMonthSales,
}: RevenueCardProps) {
  const revenueChange = getChangePercent(thisMonthRevenue, lastMonthRevenue);
  const salesChange = getChangePercent(thisMonthSales, lastMonthSales);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Revenue */}
      <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
          Receita Total
        </p>
        <p className="text-3xl font-black font-mono text-primary">
          &euro;{formatCents(totalRevenue)}
        </p>
        <p className="text-xs text-white/30 mt-1 font-mono">
          {totalSales} {totalSales === 1 ? "venda" : "vendas"}
        </p>
      </div>

      {/* This Month */}
      <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
          Este M&ecirc;s
        </p>
        <p className="text-3xl font-black font-mono text-white">
          &euro;{formatCents(thisMonthRevenue)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/30 font-mono">
            {thisMonthSales} {thisMonthSales === 1 ? "venda" : "vendas"}
          </span>
          {revenueChange !== null && <ChangeIndicator value={revenueChange} />}
        </div>
      </div>

      {/* Last Month */}
      <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
          M&ecirc;s Anterior
        </p>
        <p className="text-3xl font-black font-mono text-white/60">
          &euro;{formatCents(lastMonthRevenue)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/30 font-mono">
            {lastMonthSales} {lastMonthSales === 1 ? "venda" : "vendas"}
          </span>
          {salesChange !== null && <ChangeIndicator value={salesChange} label="vendas" />}
        </div>
      </div>
    </div>
  );
}

function ChangeIndicator({ value, label }: { value: number; label?: string }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono text-primary">
        <TrendingUp size={12} />+{value}%{label ? ` ${label}` : ""}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono text-error">
        <TrendingDown size={12} />
        {value}%{label ? ` ${label}` : ""}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-mono text-white/30">
      <Minus size={12} />
      0%
    </span>
  );
}
