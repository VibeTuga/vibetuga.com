import { Link } from "@/lib/navigation";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

type SeriesPost = {
  postId: string;
  order: number;
  title: string;
  slug: string;
  status: string;
};

type SeriesInfo = {
  seriesTitle: string;
  seriesSlug: string;
  currentOrder: number;
  totalPosts: number;
  posts: SeriesPost[];
  prev: SeriesPost | null;
  next: SeriesPost | null;
};

export function SeriesNavigation({ series }: { series: SeriesInfo }) {
  return (
    <div className="mb-8 bg-surface-container border border-primary/20 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-primary/10">
        <Link
          href={`/blog/series/${series.seriesSlug}`}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <BookOpen size={14} className="text-primary" />
          <span className="text-xs font-mono text-primary uppercase tracking-widest font-bold">
            Série
          </span>
        </Link>
        <span className="text-[10px] font-mono text-white/30">
          Parte {series.currentOrder} de {series.totalPosts}
        </span>
      </div>

      {/* Series Title */}
      <div className="px-5 py-3">
        <Link
          href={`/blog/series/${series.seriesSlug}`}
          className="font-headline font-bold text-white hover:text-primary transition-colors text-sm"
        >
          {series.seriesTitle}
        </Link>

        {/* Progress bar */}
        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${(series.currentOrder / series.totalPosts) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-2 border-t border-white/5">
        {series.prev && series.prev.status === "published" ? (
          <Link
            href={`/blog/${series.prev.slug}`}
            className="group flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-colors border-r border-white/5"
          >
            <ChevronLeft
              size={14}
              className="text-white/30 group-hover:text-primary transition-colors flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">
                Anterior
              </span>
              <span className="text-xs text-white/60 group-hover:text-white transition-colors truncate block">
                {series.prev.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {series.next && series.next.status === "published" ? (
          <Link
            href={`/blog/${series.next.slug}`}
            className="group flex items-center justify-end gap-2 px-4 py-3 hover:bg-white/5 transition-colors text-right"
          >
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest block">
                Seguinte
              </span>
              <span className="text-xs text-white/60 group-hover:text-white transition-colors truncate block">
                {series.next.title}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-white/30 group-hover:text-primary transition-colors flex-shrink-0"
            />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
