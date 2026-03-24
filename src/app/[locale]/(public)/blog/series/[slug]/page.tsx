import { notFound } from "next/navigation";
import { Link } from "@/lib/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { BookOpen, Check, Clock, Eye, User } from "lucide-react";
import { getSeriesBySlug } from "@/lib/db/queries/series";
import { formatDatePT } from "@/lib/blog-utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    return { title: "Série não encontrada | VibeTuga" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vibetuga.com";
  const authorName = series.authorDisplayName || series.authorName || "VibeTuga";
  const description =
    series.description ||
    `${series.title} — série de ${series.posts.length} partes por ${authorName}`;

  return {
    title: `${series.title} | Séries | VibeTuga Blog`,
    description,
    openGraph: {
      title: series.title,
      description,
      type: "website",
      images: series.coverImage
        ? [{ url: series.coverImage, width: 1200, height: 630, alt: series.title }]
        : [{ url: `${baseUrl}/images/og-default.png`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://vibetuga.com/blog/series/${slug}`,
    },
  };
}

export const revalidate = 300;

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) notFound();

  const publishedPosts = series.posts.filter((p) => p.status === "published");
  const authorName = series.authorDisplayName || series.authorName || "Anónimo";
  const totalReadingTime = publishedPosts.reduce((sum, p) => sum + (p.readingTimeMinutes ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: series.title,
            description: series.description || undefined,
            numberOfItems: publishedPosts.length,
            itemListElement: publishedPosts.map((post, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://vibetuga.com/blog/${post.slug}`,
              name: post.title,
            })),
          }),
        }}
      />

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
        <span className="text-white/60 truncate max-w-[200px]">{series.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        {series.coverImage && (
          <div className="relative aspect-[21/9] mb-8 rounded-sm overflow-hidden">
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-primary" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
            Série · {publishedPosts.length} {publishedPosts.length === 1 ? "parte" : "partes"}
          </span>
        </div>

        <h1 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter mb-4">
          {series.title}
        </h1>

        {series.description && (
          <p className="text-white/50 text-lg border-l-2 border-primary pl-6 mb-6">
            {series.description}
          </p>
        )}

        {/* Author & Stats */}
        <div className="flex flex-wrap items-center gap-6 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            {series.authorImage ? (
              <Image
                src={series.authorImage}
                alt={authorName}
                width={32}
                height={32}
                className="rounded-full border border-primary/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-primary/30 flex items-center justify-center">
                <User size={14} className="text-white/30" />
              </div>
            )}
            <span className="text-sm font-bold text-white">{authorName}</span>
          </div>

          <div className="flex items-center gap-4 text-white/40">
            <span className="flex items-center gap-1.5 text-xs font-mono">
              <Clock size={12} />
              {totalReadingTime} min total
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono">
              <Eye size={12} />
              {publishedPosts
                .reduce((s, p) => s + (p.viewsCount ?? 0), 0)
                .toLocaleString("pt-PT")}{" "}
              views
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Progresso da Série
          </span>
          <span className="text-[10px] font-mono text-primary">
            {publishedPosts.length}/{series.posts.length} publicados
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${series.posts.length > 0 ? (publishedPosts.length / series.posts.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {series.posts.map((post, index) => {
          const isPublished = post.status === "published";
          return (
            <div key={post.id} className="relative">
              {isPublished ? (
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start gap-4 p-5 bg-surface-container rounded-sm border border-white/5 hover:border-primary/30 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-sm">
                    <span className="text-sm font-mono font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-white group-hover:text-primary transition-colors mb-1 line-clamp-1">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-white/40 line-clamp-2 mb-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-white/30">
                      {post.categoryName && (
                        <span
                          className="text-[10px] font-mono uppercase"
                          style={{ color: post.categoryColor || undefined }}
                        >
                          {post.categoryName}
                        </span>
                      )}
                      <span className="text-[10px] font-mono">{post.readingTimeMinutes} min</span>
                      {post.publishedAt && (
                        <span className="text-[10px] font-mono">
                          {formatDatePT(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check size={16} className="text-primary/40 mt-3 flex-shrink-0" />
                </Link>
              ) : (
                <div className="flex items-start gap-4 p-5 bg-surface-container/50 rounded-sm border border-white/5 opacity-50">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm">
                    <span className="text-sm font-mono font-bold text-white/30">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-white/50 mb-1">{post.title}</h3>
                    <span className="text-[10px] font-mono text-white/30 uppercase">Em breve</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
