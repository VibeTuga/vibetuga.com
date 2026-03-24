import { Link } from "@/lib/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { BookOpen, User } from "lucide-react";
import { getAllSeries } from "@/lib/db/queries/series";
import { Pagination } from "@/components/blog/Pagination";

export const metadata: Metadata = {
  title: "Séries | VibeTuga Blog",
  description:
    "Séries de conteúdo do VibeTuga — tutoriais e guias passo-a-passo sobre vibe coding e AI.",
  openGraph: {
    title: "Séries | VibeTuga Blog",
    description:
      "Séries de conteúdo do VibeTuga — tutoriais e guias passo-a-passo sobre vibe coding e AI.",
    type: "website",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://vibetuga.com/blog/series",
  },
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function SeriesListingPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const { series, totalPages, currentPage } = await getAllSeries(page);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <nav className="mb-6 flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-white/60">Séries</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={24} className="text-primary" />
          <h1 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter">
            Séries
          </h1>
        </div>
        <p className="text-white/50 text-sm max-w-xl">
          Conteúdo organizado em séries passo-a-passo. Cada série agrupa posts relacionados numa
          ordem de leitura recomendada.
        </p>
      </div>

      {/* Series Grid */}
      {series.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 font-mono text-sm">Ainda não há séries publicadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/blog/series/${s.slug}`}
              className="group block bg-surface-container rounded-sm overflow-hidden border border-white/5 hover:border-primary/30 transition-all"
            >
              {/* Cover Image */}
              {s.coverImage ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={s.coverImage}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 bg-primary/90 text-black text-[10px] font-mono font-bold uppercase">
                      {s.postCount} {s.postCount === 1 ? "parte" : "partes"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/9] bg-surface-container-high flex items-center justify-center">
                  <BookOpen size={40} className="text-white/10" />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 bg-primary/90 text-black text-[10px] font-mono font-bold uppercase">
                      {s.postCount} {s.postCount === 1 ? "parte" : "partes"}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h2 className="font-headline text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {s.title}
                </h2>
                {s.description && (
                  <p className="text-sm text-white/40 line-clamp-2 mb-4">{s.description}</p>
                )}

                {/* Author */}
                <div className="flex items-center gap-2">
                  {s.authorImage ? (
                    <Image
                      src={s.authorImage}
                      alt={s.authorDisplayName || s.authorName || ""}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <User size={10} className="text-white/30" />
                    </div>
                  )}
                  <span className="text-xs text-white/40 font-mono">
                    {s.authorDisplayName || s.authorName}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/blog/series" />
        </div>
      )}
    </div>
  );
}
