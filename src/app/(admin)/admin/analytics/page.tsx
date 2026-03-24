import type { Metadata } from "next";
import {
  Users,
  FileText,
  ShoppingBag,
  DollarSign,
  Activity,
  TrendingUp,
  Globe,
} from "lucide-react";
import { getAdminAnalytics } from "@/lib/db/queries/admin-analytics";

export const metadata: Metadata = {
  title: "Analíticas | Admin VibeTuga",
};

export default async function AdminAnalyticsPage() {
  const stats = await getAdminAnalytics();

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-white mb-8">Analíticas</h1>

      {/* Main stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Utilizadores"
          value={stats.totalUsers.toLocaleString("pt-PT")}
          subtext={`+${stats.newUsersWeek} esta semana · +${stats.newUsersMonth} este mês`}
          icon={<Users size={18} />}
          trend={stats.usersWowChange}
          accentColor="primary"
        />
        <StatCard
          label="Total Posts"
          value={stats.totalPosts.toLocaleString("pt-PT")}
          subtext={`+${stats.postsWeek} esta semana`}
          icon={<FileText size={18} />}
          trend={stats.postsWowChange}
          accentColor="secondary"
        />
        <StatCard
          label="Produtos Ativos"
          value={stats.totalProducts.toLocaleString("pt-PT")}
          icon={<ShoppingBag size={18} />}
          accentColor="tertiary"
        />
        <StatCard
          label="Receita (Mês)"
          value={formatCurrency(stats.revenueMonthCents)}
          icon={<DollarSign size={18} />}
          accentColor="primary"
        />
        <StatCard
          label="Utilizadores Ativos"
          value={stats.activeUsers.toLocaleString("pt-PT")}
          subtext="últimos 7 dias"
          icon={<Activity size={18} />}
          trend={stats.activeUsersWowChange}
          accentColor="secondary"
        />
        <StatCard
          label="Novos Esta Semana"
          value={stats.newUsersWeek.toLocaleString("pt-PT")}
          icon={<TrendingUp size={18} />}
          trend={stats.usersWowChange}
          accentColor="tertiary"
        />
      </div>

      {/* Top referral sources */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-primary/60" />
          <h2 className="text-sm font-mono uppercase text-white/50 tracking-widest">
            Top Fontes de Referência
          </h2>
        </div>
        {stats.topReferralSources.length === 0 ? (
          <p className="text-xs font-mono text-white/20 py-8 text-center">
            Sem dados de referência disponíveis.
          </p>
        ) : (
          <div className="bg-surface-container rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4">
                    Fonte
                  </th>
                  <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4 text-right">
                    Views
                  </th>
                  <th className="text-[10px] font-mono uppercase text-white/30 tracking-widest py-3 px-4 text-right">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topReferralSources.map((source) => {
                  const totalViews = stats.topReferralSources.reduce((sum, s) => sum + s.views, 0);
                  const pct = totalViews > 0 ? ((source.views / totalViews) * 100).toFixed(1) : "0";
                  return (
                    <tr
                      key={source.source}
                      className="border-b border-white/5 last:border-0 hover:bg-surface-container-high/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-white capitalize">{source.source}</td>
                      <td className="py-3 px-4 text-sm text-white/60 font-mono text-right">
                        {source.views.toLocaleString("pt-PT")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-white/40 w-10 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  accentColor,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  trend?: string | null;
  accentColor: "primary" | "secondary" | "tertiary";
}) {
  const borderColorMap = {
    primary: "hover:border-primary",
    secondary: "hover:border-secondary",
    tertiary: "hover:border-tertiary",
  };

  const textColorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
  };

  const isPositive = trend?.startsWith("+");
  const trendColor = isPositive ? "text-green-400" : "text-red-400";

  return (
    <div
      className={`bg-surface-container p-6 border-b-2 border-transparent ${borderColorMap[accentColor]} transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
          {label}
        </span>
        {trend && (
          <div className={`flex items-center ${trendColor} text-[10px] font-mono`}>
            <TrendingUp size={12} className="mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-headline font-black text-white">{value}</h3>
          {subtext && <p className="text-[10px] font-mono text-white/25 mt-1">{subtext}</p>}
        </div>
        <div className={`${textColorMap[accentColor]} opacity-40`}>{icon}</div>
      </div>
    </div>
  );
}
