import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getPostsByTag } from "@/lib/db/queries/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { Pagination } from "@/components/blog/Pagination";

const StaggerGrid = dynamic(() =>
  import("@/components/shared/StaggerGrid").then((m) => m.StaggerGrid),
);

export const revalidate = 60;

type Props = {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag} | Blog VibeTuga`,
    description: `Artigos sobre ${decodedTag} — tutoriais, dicas e projetos da comunidade portuguesa de vibe coding.`,
    openGraph: {
      title: `#${decodedTag} | Blog VibeTuga`,
      description: `Artigos sobre ${decodedTag} — tutoriais, dicas e projetos da comunidade portuguesa de vibe coding.`,
    },
    alternates: {
      canonical: `https://vibetuga.com/blog/tag/${encodeURIComponent(decodedTag)}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const decodedTag = decodeURIComponent(tag);
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { posts, total, totalPages, currentPage } = await getPostsByTag(decodedTag, page);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-sm rounded-full">
            #{decodedTag}
          </span>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter mb-3">
          {decodedTag}
        </h1>
        <p className="text-white/50 text-sm font-mono">
          {total} {total === 1 ? "artigo" : "artigos"}
        </p>
      </header>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <StaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </StaggerGrid>
      ) : (
        <div className="text-center py-24">
          <p className="font-mono text-sm text-white/40 uppercase tracking-widest mb-2">
            NO_DATA_FOUND
          </p>
          <p className="text-white/30 text-sm">
            Nenhum artigo encontrado com a tag &quot;{decodedTag}&quot;.
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/blog/tag/${encodeURIComponent(decodedTag)}`}
      />
    </div>
  );
}
