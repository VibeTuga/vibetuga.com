import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedPosts, getCategories, getCategoryBySlug } from "@/lib/db/queries/blog";
import { getCategoryAccent } from "@/lib/blog-utils";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";
import { SearchInput, SortSelect } from "@/components/blog/BlogFilters";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Categoria não encontrada | VibeTuga" };
  }

  return {
    title: `${category.name} | Blog VibeTuga`,
    description: category.description || `Artigos sobre ${category.name} na comunidade VibeTuga.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ posts, totalPages, currentPage }, categories] = await Promise.all([
    getPublishedPosts({
      category: slug,
      q: sp.q,
      sort: sp.sort,
      page,
    }),
    getCategories(),
  ]);

  const accent = getCategoryAccent(category.color);

  const paginationParams: Record<string, string> = {};
  if (sp.q) paginationParams.q = sp.q;
  if (sp.sort) paginationParams.sort = sp.sort;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-12">
        <nav className="mb-4 flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className={accent.categoryText}>{category.name}</span>
        </nav>
        <h1 className="font-headline text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-white/60 text-lg max-w-2xl border-l-2 border-primary pl-6">
            {category.description}
          </p>
        )}
      </header>

      {/* Filters */}
      <section className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Category buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link
              href="/blog"
              className="px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex-shrink-0 transition-colors bg-surface-container border border-white/10 text-white/60 hover:text-white"
            >
              Tudo
            </Link>
            {categories.map((cat) => {
              const catAccent = getCategoryAccent(cat.color);
              const isActive = cat.slug === slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog/category/${cat.slug}`}
                  className={`px-4 py-1.5 text-xs font-bold uppercase rounded-sm flex-shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : `bg-surface-container border ${catAccent.categoryBorder} ${catAccent.categoryText} ${catAccent.categoryHover}`
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
          <p className="text-white/30 text-sm">Ainda não existem artigos nesta categoria.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/blog/category/${slug}`}
        searchParams={paginationParams}
      />
    </div>
  );
}
