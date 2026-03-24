import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSellerAnalytics } from "@/lib/db/queries/store";
import { BarChart3, TrendingUp, Package } from "lucide-react";
import { SalesChart } from "./SalesChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Análise de Vendas | VibeTuga",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  skill: "Skill",
  auto_runner: "Auto Runner",
  agent_kit: "Agent Kit",
  prompt_pack: "Prompt Pack",
  template: "Template",
  course: "Curso",
  guide: "Guia",
  other: "Outro",
};

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function SellerAnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const canSell = ["admin", "moderator", "seller"].includes(session.user.role);
  if (!canSell) {
    redirect("/dashboard");
  }

  const analytics = await getSellerAnalytics(session.user.id);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Análise de Vendas
        </h1>
        <p className="text-white/40 text-sm">
          Acompanha o desempenho dos teus produtos na loja VibeTuga.
        </p>
      </header>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-container-lowest border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Receita Total
            </span>
          </div>
          <p className="font-headline text-3xl font-black text-white tracking-tight">
            {formatPrice(analytics.totalRevenue)}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-tertiary/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-tertiary" />
            </div>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Total de Vendas
            </span>
          </div>
          <p className="font-headline text-3xl font-black text-white tracking-tight">
            {analytics.totalSales}
          </p>
        </div>
      </div>

      {/* Sales chart */}
      <div className="mb-8">
        <SalesChart dailySales={analytics.dailySales} />
      </div>

      {/* Top products */}
      <div className="bg-surface-container-lowest border border-white/5">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-headline text-sm font-bold text-white uppercase tracking-tight">
            Top Produtos
          </h3>
          <p className="text-[10px] font-mono text-white/30 mt-1">
            Os teus produtos com mais receita
          </p>
        </div>

        {analytics.topProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={32} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">Ainda sem vendas registadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Produto
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Tipo
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Preço
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Vendas
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.slice(0, 5).map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3 font-bold text-white truncate max-w-[200px]">
                      {product.title}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/40">
                        {PRODUCT_TYPE_LABELS[product.productType] ?? product.productType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-white/60">
                      {formatPrice(product.priceCents)}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-white/60">
                      {product.salesCount}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-primary font-bold">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
