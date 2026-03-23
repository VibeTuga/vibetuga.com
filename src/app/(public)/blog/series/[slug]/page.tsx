import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getSeriesBySlug } from "@/lib/db/queries/blog";
import { formatDatePT } from "@/lib/blog-utils";
import { BookOpen, ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    return { title: "Série não encontrada | VibeTuga" };
  }

  return {
    title: `${series.title} | VibeTuga Blog`,
    description: series.description || `Série: ${series.title} — VibeTuga Blog`,
    openGraph: {
      title: series.title,
      description: series.description || undefined,
      ...(series.coverImage && {
        images: [{ url: series.coverImage, width: 1200, height: 630 }],
      }),
    },
    alternates: {
      canonical: `https://vibetuga.com/blog/series/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) notFound();

  const publishedPosts = series.posts.filter((p) => p.status === "published");
  const authorName = series.authorDisplayName || series.authorName || "VibeTuga";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span>/</span>
        <Link href="/blog/series" className="hover:text-primary transition-colors">
          Séries
        </Link>
        <span>/</span>
        <span className="text-white/20 truncate max-w-[200px]">{series.title}</span>
      </nav>

      {/* Series header */}
      <header className="mb-10">
        {series.coverImage && (
          <div className="relative aspect-[21/9] mb-6 rounded-sm overflow-hidden">
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              className="object-cover"
              sizes="(max-width: 800px) 100vw, 800px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-primary" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
            Série &middot; {publishedPosts.length}{" "}
            {publishedPosts.length === 1 ? "parte" : "partes"}
          </span>
        </div>

        <h1 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">
          {series.title}
        </h1>

        {series.description && (
          <p className="text-white/50 text-lg max-w-2xl">{series.description}</p>
        )}

        <div className="flex items-center gap-3 mt-6 text-white/30">
          {series.authorImage ? (
            <Image
              src={series.authorImage}
              alt={authorName}
              width={28}
              height={28}
              className="rounded-full border border-white/10"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-white/10" />
          )}
          <span className="text-xs font-mono uppercase">{authorName}</span>
        </div>
      </header>

      {/* Posts list */}
      {publishedPosts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-white/40 font-mono text-sm">
            Esta série ainda não tem posts publicados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {publishedPosts.map((post, idx) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex items-start gap-4 p-5 bg-surface-container rounded-sm hover:bg-surface-container-high transition-all duration-200 hover:-translate-y-[2px]"
            >
              {/* Part number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-mono text-sm font-bold">{idx + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="font-headline font-bold text-white group-hover:text-primary transition-colors text-sm md:text-base">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-white/40 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  {post.publishedAt && <span>{formatDatePT(post.publishedAt)}</span>}
                  {post.readingTimeMinutes > 0 && <span>{post.readingTimeMinutes} min</span>}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={18}
                className="text-white/10 group-hover:text-primary flex-shrink-0 mt-2 transition-colors"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
