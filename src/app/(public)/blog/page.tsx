import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, getCategories } from "@/lib/db/queries/blog";
import { getCategoryAccent } from "@/lib/blog-utils";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";
import { SearchInput, SortSelect } from "@/components/blog/BlogFilters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | VibeTuga",
  description:
    "Artigos, tutoriais e deep dives sobre vibe coding. A comunidade portuguesa de desenvolvimento assistido por IA.",
  openGraph: {
    title: "Blog | VibeTuga",
    description:
      "Artigos, tutoriais e deep dives sobre vibe coding. A comunidade portuguesa de desenvolvimento assistido por IA.",
  },
};

type SearchParams = Promise<{
  category?: string;
  tag?: string;
  q?: string;
  sort?: string;
  page?: string;
}>;

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ posts, totalPages, currentPage }, categories] = await Promise.all([
    getPublishedPosts({
      category: params.category,
      tag: params.tag,
      q: params.q,
      sort: params.sort,
      page,
    }),
    getCategories(),
  ]);

  const activeCategory = params.category;

  // Build searchParams for pagination (exclude page)
  const paginationParams: Record<string, string> = {};
  if (params.category) paginationParams.category = params.category;
  if (params.tag) paginationParams.tag = params.tag;
  if (params.q) paginationParams.q = params.q;
  if (params.sort) paginationParams.sort = params.sort;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Blog
        </h1>
        <p className="text-white/60 text-lg max-w-2xl border-l-2 border-primary pl-6">
          Artigos, tutoriais e deep dives sobre vibe coding.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Category buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link
              href="/blog"
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex-shrink-0 transition-colors ${
                !activeCategory
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              Tudo
            </Link>
            {categories.map((cat) => {
              const accent = getCategoryAccent(cat.color);
              const isActive = activeCategory === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : `bg-surface-container border ${accent.categoryBorder} ${accent.categoryText} ${accent.categoryHover}`
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-4">
            <Suspense>
              <SearchInput />
              <SortSelect />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="font-mono text-sm text-white/40 uppercase tracking-widest mb-2">
            NO_DATA_FOUND
          </p>
          <p className="text-white/30 text-sm">
            {params.q
              ? `Nenhum resultado para "${params.q}"`
              : "Ainda não existem artigos publicados."}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/blog"
        searchParams={paginationParams}
      />
    </div>
  );
}
