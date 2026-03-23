import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPostBySlug, getAdjacentPosts } from "@/lib/db/queries/blog";
import { formatDatePT, formatCount, getCategoryAccent } from "@/lib/blog-utils";
import { ViewTracker } from "@/components/blog/ViewTracker";
import { CommentSection } from "@/components/blog/CommentSection";
import { LikeButton } from "@/components/blog/LikeButton";
import { BookmarkButton } from "@/components/blog/BookmarkButton";
import { MarkdownContent } from "@/components/blog/MarkdownContent";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post não encontrado | VibeTuga" };
  }

  return {
    title: `${post.title} | VibeTuga Blog`,
    description: post.excerpt || `${post.title} — VibeTuga Blog`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorDisplayName || post.authorName || "VibeTuga"],
      ...(post.coverImage && { images: [{ url: post.coverImage, width: 1200, height: 630 }] }),
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const { prev, next } = await getAdjacentPosts(post.publishedAt, post.id);
  const accent = getCategoryAccent(post.categoryColor);
  const authorName = post.authorDisplayName || post.authorName || "Anónimo";

  return (
    <article className="max-w-[800px] mx-auto px-6 py-8">
      <ViewTracker postId={post.id} />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
        <Link href="/blog" className="hover:text-primary transition-colors">
          Blog
        </Link>
        <span>/</span>
        {post.categoryName && post.categorySlug && (
          <>
            <Link
              href={`/blog/category/${post.categorySlug}`}
              className={`${accent.categoryText} hover:opacity-80 transition-colors`}
            >
              {post.categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-white/20 truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        {/* Category & Post Type */}
        <div className="flex items-center gap-3 mb-4">
          {post.categoryName && (
            <Link
              href={`/blog/category/${post.categorySlug}`}
              className={`inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container border ${accent.categoryBorder} font-mono text-[10px] ${accent.categoryText} uppercase tracking-widest`}
            >
              <span className={`w-1.5 h-1.5 ${accent.dotBg} rounded-full animate-pulse`} />
              {post.categoryName}
            </Link>
          )}
          {post.postType === "admin" && (
            <span className="bg-secondary/90 text-black px-2 py-0.5 font-bold text-[10px] uppercase">
              Admin Post
            </span>
          )}
          {post.postType === "community" && (
            <span className="bg-white/10 text-white/80 px-2 py-0.5 font-bold text-[10px] uppercase">
              Community
            </span>
          )}
        </div>

        <h1 className="font-headline text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-white/50 text-lg border-l-2 border-primary pl-6 mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Author & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-3">
            {post.authorImage ? (
              <Image
                src={post.authorImage}
                alt={authorName}
                width={40}
                height={40}
                className={`rounded-full border ${accent.avatarBorder}`}
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-surface-container-highest border ${accent.avatarBorder}`}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase">{authorName}</span>
                {post.authorRole && (
                  <span className="text-[8px] bg-white/5 px-1.5 py-0.5 text-white/40 uppercase">
                    {post.authorRole}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/30 font-mono">
                {formatDatePT(post.publishedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-white/40">
            <span className="flex items-center gap-1.5 text-xs font-mono">
              {post.readingTimeMinutes} min leitura
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono">
              {formatCount(post.viewsCount)} views
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono">
              {formatCount(post.likesCount)} likes
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-[16/9] mb-10 rounded-sm overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 800px) 100vw, 800px"
            priority
          />
          <div className={`absolute top-0 left-0 w-full h-[3px] ${accent.barBg}`} />
        </div>
      )}

      {/* Content */}
      <MarkdownContent content={post.content} className="blog-content mb-12" />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 border-t border-white/5 pt-8">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mr-2">
            Tags:
          </span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-surface-container border border-white/5 text-xs font-mono text-white/50 hover:text-primary hover:border-primary/30 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Engagement buttons */}
      <div className="flex items-center gap-3 mb-12">
        <LikeButton postId={post.id} initialCount={post.likesCount} />
        <BookmarkButton postId={post.id} />
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialCount={post.commentsCount} />

      {/* Prev / Next navigation */}
      <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-8">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group p-6 bg-surface-container rounded-sm hover:bg-surface-container-high transition-colors"
          >
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Anterior
            </span>
            <p className="text-sm font-headline font-bold text-white group-hover:text-primary transition-colors mt-1 line-clamp-2">
              {prev.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group p-6 bg-surface-container rounded-sm hover:bg-surface-container-high transition-colors text-right"
          >
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Seguinte
            </span>
            <p className="text-sm font-headline font-bold text-white group-hover:text-primary transition-colors mt-1 line-clamp-2">
              {next.title}
            </p>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
