import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getUserWishlist } from "@/lib/db/queries/store";
import { Heart } from "lucide-react";

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

const TYPE_BADGE_COLORS: Record<string, string> = {
  skill: "bg-primary text-on-primary",
  auto_runner: "bg-tertiary text-on-tertiary-container",
  agent_kit: "bg-secondary text-on-secondary",
  template: "bg-tertiary text-on-tertiary-container",
  course: "bg-secondary text-on-secondary",
  prompt_pack: "bg-primary text-on-primary",
  guide: "bg-tertiary text-on-tertiary-container",
  other: "bg-white/40 text-black",
};

const TYPE_GRADIENT_COLORS: Record<string, string> = {
  skill: "from-primary/30 to-primary/5",
  auto_runner: "from-tertiary/30 to-tertiary/5",
  agent_kit: "from-secondary/30 to-secondary/5",
  template: "from-tertiary/30 to-tertiary/5",
  course: "from-secondary/30 to-secondary/5",
  prompt_pack: "from-primary/30 to-primary/5",
  guide: "from-tertiary/30 to-tertiary/5",
  other: "from-white/20 to-white/5",
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const wishlist = await getUserWishlist(session.user.id);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-white mb-2">
          Lista de Desejos
        </h1>
        <p className="text-white/50 text-sm">Produtos que guardaste para mais tarde.</p>
      </div>

      {/* Wishlist Grid */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const badgeColor = TYPE_BADGE_COLORS[item.productType] ?? TYPE_BADGE_COLORS.other;
            const typeLabel = TYPE_LABELS[item.productType] ?? TYPE_LABELS.other;
            const gradientColor =
              TYPE_GRADIENT_COLORS[item.productType] ?? TYPE_GRADIENT_COLORS.other;
            const sellerName = item.sellerDisplayName || item.sellerName || "Vendedor";
            const priceFormatted = (item.priceCents / 100).toLocaleString("pt-PT", {
              minimumFractionDigits: 2,
            });

            return (
              <Link
                key={item.id}
                href={`/store/${item.slug}`}
                className="flex flex-col bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high hover:border-primary/20 transition-all duration-300 group"
              >
                {/* Cover image */}
                <div className="relative aspect-video rounded-t-xl overflow-hidden bg-black">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`} />
                  )}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`${badgeColor} text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase`}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Heart size={18} className="text-secondary fill-secondary" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-white mb-1 font-headline group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs text-white/40 mb-4">by {sellerName}</span>
                  <div className="mt-auto">
                    <span className="text-xl font-black text-primary font-mono">
                      &euro;{priceFormatted}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
            <Heart size={28} className="text-white/20" />
          </div>
          <h2 className="font-headline text-xl font-bold text-white mb-2">Lista vazia</h2>
          <p className="text-white/40 text-sm max-w-md mb-6">
            Ainda não adicionaste nenhum produto à tua lista de desejos. Explora a loja e guarda os
            teus favoritos!
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
          >
            Explorar Loja
          </Link>
        </div>
      )}
    </div>
  );
}
