import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getApprovedProducts, getFeaturedCollections } from "@/lib/db/queries/store";
import { ProductCard } from "@/components/store/ProductCard";
import { Pagination } from "@/components/blog/Pagination";
import { StoreTypeFilter, StoreSearchInput } from "@/components/store/StoreFilters";

const StaggerGrid = dynamic(() =>
  import("@/components/shared/StaggerGrid").then((m) => m.StaggerGrid),
);

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Loja | VibeTuga",
  description:
    "O marketplace digital da comunidade VibeTuga. Skills, auto-runners, agent kits, prompt packs, templates e muito mais.",
  openGraph: {
    title: "Loja | VibeTuga",
    description:
      "O marketplace digital da comunidade VibeTuga. Skills, auto-runners, agent kits, prompt packs, templates e muito mais.",
  },
  alternates: {
    canonical: "https://vibetuga.com/store",
  },
};

type SearchParams = Promise<{
  type?: string;
  q?: string;
  page?: string;
}>;

export default async function StorePage({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isFeatureEnabled("store_enabled"))) notFound();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ products, totalPages, currentPage }, featuredCollections] = await Promise.all([
    getApprovedProducts({
      productType: params.type,
      q: params.q,
      page,
    }),
    getFeaturedCollections(),
  ]);

  const paginationParams: Record<string, string> = {};
  if (params.type) paginationParams.type = params.type;
  if (params.q) paginationParams.q = params.q;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-2">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white">
            Loja
          </h1>
          <Link
            href="/store/collections"
            className="text-xs font-mono text-white/40 uppercase tracking-widest hover:text-primary transition-colors"
          >
            Ver Coleções &rarr;
          </Link>
        </div>
        <p className="text-white/50 text-lg">Ferramentas, templates e kits para vibe coders.</p>
      </section>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">
            Coleções em Destaque
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {featuredCollections.map((c) => (
              <Link
                key={c.id}
                href={`/store/collections/${c.slug}`}
                className="group shrink-0 w-72 bg-surface-container border border-white/5 rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative h-28 bg-black">
                  {c.coverImage ? (
                    <Image
                      src={c.coverImage}
                      alt={c.name}
                      fill
                      className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                      sizes="288px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/10" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white font-headline group-hover:text-primary transition-colors mb-1">
                    {c.name}
                  </h3>
                  {c.description && (
                    <p className="text-xs text-white/40 line-clamp-1 mb-2">{c.description}</p>
                  )}
                  <span className="text-[10px] font-mono text-white/30">
                    {c.productCount} {c.productCount === 1 ? "produto" : "produtos"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Suspense fallback={null}>
          <StoreTypeFilter />
        </Suspense>
        <Suspense fallback={null}>
          <StoreSearchInput />
        </Suspense>
      </section>

      {/* Product Grid */}
      {products.length > 0 ? (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerGrid>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="font-label text-[10px] tracking-widest text-white/40 uppercase">
              Sem_Resultados
            </span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-white mb-2">
            Nenhum produto encontrado
          </h2>
          <p className="text-white/40 text-sm max-w-md">
            {params.type || params.q
              ? "Tenta ajustar os filtros ou a pesquisa para encontrar o que procuras."
              : "A loja ainda não tem produtos aprovados. Volta em breve!"}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/store"
        searchParams={paginationParams}
      />
    </div>
  );
}
