import { Link } from "@/lib/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
};

function buildUrl(baseUrl: string, page: number, searchParams?: Record<string, string>): string {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", page.toString());
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(baseUrl, currentPage - 1, searchParams)}
          className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-primary/50 text-white/40 hover:text-primary transition-all group"
        >
          <svg
            className="w-5 h-5 group-active:scale-90 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center border border-white/5 text-white/20 cursor-not-allowed">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-white/20 mx-2">
            ...
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary font-mono text-sm font-bold"
          >
            {p.toString().padStart(2, "0")}
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(baseUrl, p as number, searchParams)}
            className="w-10 h-10 flex items-center justify-center border border-white/5 hover:bg-white/5 text-white/60 font-mono text-sm transition-colors"
          >
            {(p as number).toString().padStart(2, "0")}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(baseUrl, currentPage + 1, searchParams)}
          className="w-10 h-10 flex items-center justify-center border border-white/5 hover:border-primary/50 text-white/40 hover:text-primary transition-all group"
        >
          <svg
            className="w-5 h-5 group-active:scale-90 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center border border-white/5 text-white/20 cursor-not-allowed">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
