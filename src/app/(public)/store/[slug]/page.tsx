import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, isProductInWishlist, getBundleItems } from "@/lib/db/queries/store";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { BuyButton } from "@/components/store/BuyButton";
import { ProductReviews } from "@/components/store/ProductReviews";
import { ReportButton } from "@/components/shared/ReportButton";
import { WishlistButton } from "@/components/store/WishlistButton";
import { BundleContents } from "@/components/store/BundleContents";
import { getProductJsonLd } from "@/lib/jsonld";
import { auth } from "@/lib/auth";

export const revalidate = 60;

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

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado | VibeTuga" };
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.title} - disponível na loja VibeTuga.`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vibetuga.com";
  const sellerName = product.sellerDisplayName || product.sellerName || "VibeTuga";
  const priceFormatted = (product.priceCents / 100).toFixed(2);
  const ogParams = new URLSearchParams({
    title: product.title,
    seller: sellerName,
    price: priceFormatted,
    productType: product.productType,
  });
  const ogImageUrl = `${baseUrl}/api/og/store?${ogParams.toString()}`;

  return {
    title: `${product.title} | Loja VibeTuga`,
    description,
    openGraph: {
      title: `${product.title} | Loja VibeTuga`,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Loja VibeTuga`,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://vibetuga.com/store/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), auth()]);

  if (!product) {
    notFound();
  }

  const userId = session?.user?.id;
  const [wishlisted, bundleItems] = await Promise.all([
    userId ? isProductInWishlist(userId, product.id) : false,
    product.isBundle ? getBundleItems(product.id) : [],
  ]);

  const badgeColor = TYPE_BADGE_COLORS[product.productType] ?? TYPE_BADGE_COLORS.other;
  const typeLabel = TYPE_LABELS[product.productType] ?? TYPE_LABELS.other;
  const gradientColor = TYPE_GRADIENT_COLORS[product.productType] ?? TYPE_GRADIENT_COLORS.other;
  const sellerName = product.sellerDisplayName || product.sellerName || "Vendedor";

  const priceFormatted = (product.priceCents / 100).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(product)) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono text-white/40">
        <Link href="/store" className="hover:text-primary transition-colors">
          Loja
        </Link>
        <span>/</span>
        <span className="text-white/60">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left: Image + Description */}
        <div className="lg:col-span-3">
          {/* Cover image */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-8">
            {product.coverImage ? (
              <Image
                src={product.coverImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`} />
            )}
            {/* Type badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`${badgeColor} text-[10px] font-black px-3 py-1 rounded tracking-widest uppercase`}
              >
                {typeLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-lg font-headline font-bold tracking-tight uppercase mb-4">
                Descrição
              </h2>
              <MarkdownContent
                content={product.description}
                className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed"
              />
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface-container-high text-white/50 text-[10px] font-label uppercase tracking-widest border border-white/5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            {/* Product info card */}
            <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
              <h1 className="text-2xl font-headline font-black tracking-tight text-white mb-4">
                {product.title}
              </h1>

              {/* Seller */}
              <Link
                href={`/profile/${product.sellerId}`}
                className="flex items-center gap-3 mb-6 group"
              >
                {product.sellerImage ? (
                  <Image
                    src={product.sellerImage}
                    alt={sellerName}
                    width={32}
                    height={32}
                    className="rounded-full border border-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/60">
                      {sellerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-white/60 group-hover:text-primary transition-colors">
                  {sellerName}
                </span>
              </Link>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/5">
                <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">
                  Preço
                </span>
                <span className="text-3xl font-black text-primary font-mono">
                  &euro;{priceFormatted}
                </span>
              </div>

              {/* Buy button + wishlist */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <BuyButton productId={product.id} />
                </div>
                {userId && (
                  <WishlistButton productId={product.id} initialWishlisted={wishlisted} size="md" />
                )}
              </div>
              {session?.user && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <ReportButton contentType="product" contentId={product.id} size="sm" />
                </div>
              )}
            </div>

            {/* Product details mini card */}
            <div className="p-6 bg-surface-container border border-white/5 rounded-xl">
              <h3 className="font-label text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                Detalhes
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/40">Tipo</dt>
                  <dd className="text-white font-mono text-xs">{typeLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/40">Publicado</dt>
                  <dd className="text-white font-mono text-xs">
                    {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                  </dd>
                </div>
                {product.updatedAt && (
                  <div className="flex justify-between">
                    <dt className="text-white/40">Atualizado</dt>
                    <dd className="text-white font-mono text-xs">
                      {new Date(product.updatedAt).toLocaleDateString("pt-PT")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle contents */}
      {product.isBundle && bundleItems.length > 0 && <BundleContents items={bundleItems} />}

      {/* Reviews section */}
      <ProductReviews productId={product.id} isAuthenticated={!!session?.user} />
    </div>
  );
}
