import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPurchases } from "@/lib/db/queries/store";
import Link from "next/link";
import { ShoppingBag, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minhas Compras | VibeTuga",
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function MyPurchasesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const purchases = await getUserPurchases(session.user.id);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Minhas Compras
        </h1>
        <p className="text-white/40 text-sm">Produtos que adquiriste na loja VibeTuga.</p>
      </header>

      {purchases.length === 0 ? (
        <div className="text-center py-20 border border-white/5 bg-surface-container-lowest">
          <ShoppingBag size={48} className="text-white/10 mx-auto mb-6" />
          <h2 className="font-headline text-xl font-bold text-white mb-3">
            Ainda não tens compras
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
            Explora a loja e descobre skills, templates, cursos, e muito mais da comunidade
            VibeTuga.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
          >
            <ShoppingBag size={14} />
            Explorar Loja
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => {
            const typeLabel = PRODUCT_TYPE_LABELS[purchase.productType] ?? purchase.productType;

            return (
              <div
                key={purchase.id}
                className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/store/${purchase.productSlug}`}
                      className="text-sm font-bold text-white truncate hover:text-primary transition-colors"
                    >
                      {purchase.productTitle}
                    </Link>
                    <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/40">
                      {typeLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
                    <span>{formatPrice(purchase.pricePaidCents)}</span>
                    <span>·</span>
                    <span>{formatDate(purchase.createdAt)}</span>
                    {purchase.sellerDisplayName || purchase.sellerName ? (
                      <>
                        <span>·</span>
                        <span>por {purchase.sellerDisplayName ?? purchase.sellerName}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {purchase.downloadKey && (
                  <Link
                    href={`/api/upload/${purchase.downloadKey}`}
                    className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider hover:bg-primary/20 transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
