import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getProductUpdates } from "@/lib/db/queries/store";
import { db } from "@/lib/db";
import { storeProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Package } from "lucide-react";
import { ProductUpdateForm } from "./ProductUpdateForm";

export const metadata: Metadata = {
  title: "Atualizações do Produto | Dashboard | VibeTuga",
};

type Params = Promise<{ id: string }>;

export default async function ProductUpdatesPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const [product] = await db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      sellerId: storeProducts.sellerId,
    })
    .from(storeProducts)
    .where(eq(storeProducts.id, id))
    .limit(1);

  if (!product) notFound();

  if (product.sellerId !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard/my-products");
  }

  const updates = await getProductUpdates(product.id);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/my-products"
        className="inline-flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-widest hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar aos Produtos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-white mb-2">
          Atualizações
        </h1>
        <p className="text-white/50 text-sm">
          Gere as versões e changelogs de <span className="text-white">{product.title}</span>
        </p>
      </div>

      {/* New Update Form */}
      <div className="mb-10 p-6 bg-surface-container border border-white/5 rounded-xl">
        <h2 className="text-sm font-headline font-bold uppercase tracking-wider text-white mb-4">
          Nova Atualização
        </h2>
        <ProductUpdateForm productId={product.id} />
      </div>

      {/* Updates List */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Package size={18} className="text-tertiary" />
          <h2 className="text-sm font-headline font-bold uppercase tracking-wider text-white">
            Histórico de Versões
          </h2>
          <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
            {updates.length}
          </span>
        </div>

        {updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="p-5 bg-surface-container border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">
                    v{update.version}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">
                    {new Date(update.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                  {update.downloadKey && (
                    <span className="text-[10px] font-mono text-primary/60 bg-primary/5 px-2 py-0.5 rounded">
                      Novo download
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {update.changelog}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
              <Package size={24} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm">
              Este produto ainda não tem atualizações publicadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
