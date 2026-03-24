import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserWishlist } from "@/lib/db/queries/store";
import { WishlistButton } from "@/components/store/WishlistButton";

export const metadata: Metadata = {
  title: "Lista de Desejos | Dashboard | VibeTuga",
};

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

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const items = await getUserWishlist(session.user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white flex items-center gap-3">
          <Heart size={20} className="text-error" />
          Lista de Desejos
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Produtos que guardaste para mais tarde
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const sellerName = item.sellerDisplayName || item.sellerName || "Vendedor";
            const avgRating = Number(item.avgRating) || 0;
            const reviewCount = Number(item.reviewCount) || 0;

            return (
              <div
                key={item.id}
                className="relative bg-surface-container border border-white/5 rounded-xl overflow-hidden group"
              >
                <Link href={`/store/${item.productSlug}`} className="block">
                  <div className="relative aspect-video bg-black">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.productTitle}
                        fill
                        className="object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-mono text-white/40 uppercase mb-1">
                      {TYPE_LABELS[item.productType] ?? "Outro"}
                    </p>
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-2">
                      {item.productTitle}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">by {sellerName}</span>
                      <span className="text-lg font-black text-primary font-mono">
                        &euro;
                        {(item.priceCents / 100).toLocaleString("pt-PT", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {reviewCount > 0 && (
                      <p className="text-[10px] font-mono text-white/30 mt-1">
                        ★ {avgRating.toFixed(1)} ({reviewCount})
                      </p>
                    )}
                  </div>
                </Link>
                <div className="absolute top-3 right-3">
                  <WishlistButton productId={item.productId} initialWishlisted={true} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart size={48} className="text-white/10 mb-4" />
          <h2 className="font-headline text-xl font-bold text-white mb-2">
            A tua lista de desejos está vazia
          </h2>
          <p className="text-white/40 text-sm max-w-md mb-6">
            Explora a loja e guarda os produtos que te interessam.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-headline font-bold text-xs tracking-widest uppercase rounded-sm hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
          >
            <ShoppingBag size={16} />
            Explorar Loja
          </Link>
        </div>
      )}
    </div>
  );
}
