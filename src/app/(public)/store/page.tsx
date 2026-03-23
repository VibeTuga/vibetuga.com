import { Suspense } from "react";
import type { Metadata } from "next";
import { getApprovedProducts } from "@/lib/db/queries/store";
import { ProductCard } from "@/components/store/ProductCard";
import { Pagination } from "@/components/blog/Pagination";
import { StoreTypeFilter, StoreSearchInput } from "@/components/store/StoreFilters";

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
};

type SearchParams = Promise<{
  type?: string;
  q?: string;
  page?: string;
}>;

export default async function StorePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const { products, totalPages, currentPage } = await getApprovedProducts({
    productType: params.type,
    q: params.q,
    page,
  });

  const paginationParams: Record<string, string> = {};
  if (params.type) paginationParams.type = params.type;
  if (params.q) paginationParams.q = params.q;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-2">
          Loja
        </h1>
        <p className="text-white/50 text-lg">Ferramentas, templates e kits para vibe coders.</p>
      </section>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
