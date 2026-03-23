import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import type { SeriesForPost } from "@/lib/db/queries/blog";

export function SeriesBanner({
  series,
  currentPostId,
}: {
  series: SeriesForPost;
  currentPostId: string;
}) {
  return (
    <div className="bg-surface-container border border-primary/10 rounded-sm overflow-hidden mb-10">
      {/* Header */}
      <div className="px-5 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
        <BookOpen size={14} className="text-primary" />
        <Link
          href={`/blog/series/${series.seriesSlug}`}
          className="text-primary text-xs font-mono uppercase tracking-widest hover:underline"
        >
          Série: {series.seriesTitle}
        </Link>
        <span className="text-white/20 text-[10px] font-mono ml-auto">
          {series.currentOrder} / {series.totalPosts}
        </span>
      </div>

      {/* Post list (collapsible style — show all, highlight current) */}
      <div className="px-5 py-3 space-y-1 max-h-52 overflow-y-auto">
        {series.posts.map((post, idx) => {
          const isCurrent = post.postId === currentPostId;
          return (
            <div key={post.postId} className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold w-5 text-center flex-shrink-0 ${
                  isCurrent ? "text-primary" : "text-white/20"
                }`}
              >
                {idx + 1}
              </span>
              {isCurrent ? (
                <span className="text-primary text-xs font-bold truncate">{post.title}</span>
              ) : (
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-white/50 text-xs truncate hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Prev / Next navigation */}
      {(series.prev || series.next) && (
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-3">
          {series.prev ? (
            <Link
              href={`/blog/${series.prev.slug}`}
              className="flex items-center gap-1 text-xs font-mono text-white/40 hover:text-primary transition-colors"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Anterior</span>
            </Link>
          ) : (
            <div />
          )}
          <div className="flex-1" />
          {series.next ? (
            <Link
              href={`/blog/${series.next.slug}`}
              className="flex items-center gap-1 text-xs font-mono text-white/40 hover:text-primary transition-colors"
            >
              <span className="hidden sm:inline">Seguinte</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
