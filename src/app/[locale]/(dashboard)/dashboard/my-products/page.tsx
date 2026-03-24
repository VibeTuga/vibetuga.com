import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSellerProducts } from "@/lib/db/queries/store";
import { Link } from "@/lib/navigation";
import { Package, Plus, Pencil } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Produtos | VibeTuga",
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

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-white/10 text-white/50" },
  pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400" },
  approved: { label: "Aprovado", className: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejeitado", className: "bg-red-500/20 text-red-400" },
  archived: { label: "Arquivado", className: "bg-white/10 text-white/30" },
};

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function MyProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const products = await getSellerProducts(session.user.id);

  return (
    <div>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
            Meus Produtos
          </h1>
          <p className="text-white/40 text-sm">Gere os teus produtos digitais na loja VibeTuga.</p>
        </div>
        <Link
          href="/dashboard/submit-product"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all shrink-0"
        >
          <Plus size={14} />
          Novo Produto
        </Link>
      </header>

      {products.length === 0 ? (
        <div className="text-center py-20 border border-white/5 bg-surface-container-lowest">
          <Package size={48} className="text-white/10 mx-auto mb-6" />
          <h2 className="font-headline text-xl font-bold text-white mb-3">
            Ainda não tens produtos
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
            Submete o teu primeiro produto digital — skills, templates, cursos, e muito mais.
          </p>
          <Link
            href="/dashboard/submit-product"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
          >
            <Plus size={14} />
            Submeter Primeiro Produto
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const status = STATUS_STYLES[product.status] ?? STATUS_STYLES.draft;
            const typeLabel = PRODUCT_TYPE_LABELS[product.productType] ?? product.productType;

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white truncate">{product.title}</h3>
                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/40">
                      {typeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
                    <span>{formatPrice(product.priceCents)}</span>
                    <span>·</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                </div>

                <span
                  className={`shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-1 ${status.className}`}
                >
                  {status.label}
                </span>

                <Link
                  href={`/dashboard/edit-product/${product.id}`}
                  className="shrink-0 p-2 text-white/30 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
