import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/db/queries/blog";
import { BookOpen } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Séries | VibeTuga Blog",
  description:
    "Séries de conteúdo organizado — aprende vibe coding passo a passo com as nossas coleções de artigos.",
  openGraph: {
    title: "Séries | VibeTuga Blog",
    description:
      "Séries de conteúdo organizado — aprende vibe coding passo a passo com as nossas coleções de artigos.",
  },
  alternates: {
    canonical: "https://vibetuga.com/blog/series",
  },
};

export default async function SeriesListingPage() {
  const series = await getAllSeries();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav className="mb-4 flex items-center gap-2 text-xs font-mono text-white/40 uppercase tracking-wider">
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-white/20">Séries</span>
        </nav>

        <h1 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter">
          Séries
        </h1>
        <p className="text-white/50 mt-2 max-w-xl">
          Conteúdo organizado em coleções temáticas. Segue uma série do início ao fim para
          aprendizagem estruturada.
        </p>
      </div>

      {/* Series grid */}
      {series.length === 0 ? (
        <div className="py-20 text-center">
          <BookOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 font-mono text-sm">Nenhuma série disponível ainda.</p>
          <p className="text-white/20 font-mono text-xs mt-1">
            Em breve teremos conteúdo organizado para ti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.map((s) => (
            <Link
              key={s.id}
              href={`/blog/series/${s.slug}`}
              className="group relative bg-surface-container rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Cover image */}
              {s.coverImage ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={s.coverImage}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-surface-container-high flex items-center justify-center">
                  <BookOpen size={40} className="text-white/10" />
                </div>
              )}

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h2 className="font-headline text-lg font-bold text-white group-hover:text-primary transition-colors mb-2">
                  {s.title}
                </h2>
                {s.description && (
                  <p className="text-white/40 text-sm line-clamp-2 mb-4 flex-1">{s.description}</p>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest mt-auto pt-4 border-t border-white/5">
                  <span>{s.authorDisplayName || s.authorName}</span>
                  <span>
                    {s.postCount} {s.postCount === 1 ? "parte" : "partes"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
