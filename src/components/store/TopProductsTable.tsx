"use client";

import { Link } from "@/lib/navigation";
import type { SellerTopProduct } from "@/lib/db/queries/store";

interface TopProductsTableProps {
  products: SellerTopProduct[];
}

const TYPE_LABELS: Record<string, string> = {
  skill: "Skill",
  auto_runner: "Auto Runner",
  agent_kit: "Agent Kit",
  template: "Template",
  course: "Curso",
  prompt_pack: "Prompt Pack",
  guide: "Guide",
  other: "Outro",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
          Top Produtos
        </h3>
        <p className="text-white/20 text-sm font-mono text-center py-8">Ainda sem produtos</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
      <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
        Top Produtos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] font-mono text-white/30 uppercase tracking-widest pb-3 pr-4">
                Produto
              </th>
              <th className="text-left text-[10px] font-mono text-white/30 uppercase tracking-widest pb-3 pr-4">
                Tipo
              </th>
              <th className="text-right text-[10px] font-mono text-white/30 uppercase tracking-widest pb-3 pr-4">
                Pre&ccedil;o
              </th>
              <th className="text-right text-[10px] font-mono text-white/30 uppercase tracking-widest pb-3 pr-4">
                Vendas
              </th>
              <th className="text-right text-[10px] font-mono text-white/30 uppercase tracking-widest pb-3">
                Receita
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 pr-4">
                  <Link
                    href={`/store/${product.slug}`}
                    className="text-white hover:text-primary transition-colors font-medium"
                  >
                    <span className="text-white/20 font-mono text-xs mr-2">#{i + 1}</span>
                    {product.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {TYPE_LABELS[product.productType] ?? product.productType}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-white/60">
                  &euro;{formatCents(product.priceCents)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-tertiary">
                  {product.salesCount}
                </td>
                <td className="py-3 text-right font-mono text-primary font-bold">
                  &euro;{formatCents(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
