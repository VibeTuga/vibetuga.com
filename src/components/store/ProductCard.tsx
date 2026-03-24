import Link from "next/link";
import Image from "next/image";
import type { StoreProduct } from "@/lib/db/queries/store";
import { WishlistButton } from "./WishlistButton";

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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-3 h-3 ${filled ? "text-primary" : "text-white/20"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function ProductCard({
  product,
  wishlisted,
  showWishlist = false,
}: {
  product: StoreProduct;
  wishlisted?: boolean;
  showWishlist?: boolean;
}) {
  const badgeColor = TYPE_BADGE_COLORS[product.productType] ?? TYPE_BADGE_COLORS.other;
  const typeLabel = TYPE_LABELS[product.productType] ?? TYPE_LABELS.other;
  const gradientColor = TYPE_GRADIENT_COLORS[product.productType] ?? TYPE_GRADIENT_COLORS.other;
  const avgRating = Number(product.avgRating) || 0;
  const reviewCount = Number(product.reviewCount) || 0;

  const priceFormatted = (product.priceCents / 100).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
  });

  const sellerName = product.sellerDisplayName || product.sellerName || "Vendedor";

  return (
    <Link
      href={`/store/${product.slug}`}
      className="flex flex-col bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high hover:border-primary/20 transition-all duration-300 group"
    >
      {/* Cover image */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden bg-black">
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`} />
        )}
        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`${badgeColor} text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase`}
          >
            {typeLabel}
          </span>
        </div>
        {showWishlist && (
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton productId={product.id} initialWishlisted={wishlisted} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2 font-headline group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Seller info */}
        <div className="flex items-center gap-3 mb-6">
          {product.sellerImage ? (
            <Image
              src={product.sellerImage}
              alt={sellerName}
              width={24}
              height={24}
              className="rounded-full border border-primary/20"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/60">
                {sellerName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-white/50">
            by <span className="text-white/80">{sellerName}</span>
          </span>
        </div>

        {/* Rating + Price */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <StarIcon filled />
                <span className="text-[10px] text-white font-mono">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-white/40 font-mono">({reviewCount})</span>
              </div>
            )}
            <span className="text-xl font-black text-primary font-mono">
              &euro;{priceFormatted}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
