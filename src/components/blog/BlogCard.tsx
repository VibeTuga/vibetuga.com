import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/db/queries/blog";
import { formatDatePT, formatCount, getCategoryAccent } from "@/lib/blog-utils";

export function BlogCard({ post }: { post: BlogPost }) {
  const accent = getCategoryAccent(post.categoryColor);
  const authorName = post.authorDisplayName || post.authorName || "Anónimo";

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={`group relative bg-surface-container rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full ${accent.hoverShadow}`}
      >
        {/* Top color bar */}
        <div className={`absolute top-0 left-0 w-full h-[3px] ${accent.barBg} z-10`} />

        {/* Image area */}
        <div className="aspect-[16/9] overflow-hidden relative">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container-low transition-transform duration-500 group-hover:scale-105 opacity-80" />
          )}

          {/* Category badge */}
          {post.categoryName && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 border border-white/10">
              <span className="font-mono text-[10px] text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 ${accent.dotBg} rounded-full animate-pulse`} />
                {post.categoryName}
              </span>
            </div>
          )}

          {/* Post type badge */}
          {post.postType === "admin" && (
            <div className="absolute top-4 right-4 bg-secondary/90 text-black px-2 py-0.5 font-bold text-[10px] uppercase">
              Admin Post
            </div>
          )}
          {post.postType === "community" && (
            <div className="absolute top-4 right-4 bg-white/10 text-white/80 px-2 py-0.5 font-bold text-[10px] uppercase backdrop-blur-md">
              Community
            </div>
          )}
          {post.postType === "guest" && (
            <div className="absolute top-4 right-4 bg-tertiary/20 text-tertiary px-2 py-0.5 font-bold text-[10px] uppercase backdrop-blur-md">
              Guest
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3
            className={`font-headline text-2xl font-bold text-white mb-3 ${accent.hoverText} transition-colors`}
          >
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-white/50 text-sm line-clamp-2 mb-6 font-body">{post.excerpt}</p>
          )}

          {/* Author & meta */}
          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
            <div className="flex items-center gap-3">
              {post.authorImage ? (
                <Image
                  src={post.authorImage}
                  alt={authorName}
                  width={32}
                  height={32}
                  className={`rounded-full border ${accent.avatarBorder}`}
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full bg-surface-container-highest border ${accent.avatarBorder}`}
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white uppercase">{authorName}</p>
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
            <div className="flex items-center gap-4 text-white/40">
              <span className="flex items-center gap-1 text-[10px] font-mono">
                {post.readingTimeMinutes} min
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono">
                {formatCount(post.viewsCount)}
              </span>
            </div>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-4 mt-4 justify-end">
            <span className="flex items-center gap-1 text-white/40 text-[10px] font-mono group-hover:text-primary transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {formatCount(post.likesCount)}
            </span>
            <span className="flex items-center gap-1 text-white/40 text-[10px] font-mono group-hover:text-tertiary transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.commentsCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
