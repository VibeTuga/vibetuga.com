import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getApprovedProjects, getFeaturedProjects } from "@/lib/db/queries/showcase";
import {
  ShowcaseTechFilter,
  ShowcaseSearchInput,
  SubmitProjectFAB,
} from "@/components/showcase/ShowcaseFilters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Showcase | VibeTuga",
  description:
    "Projetos construídos pela comunidade VibeTuga. Descobre o que a comunidade portuguesa de vibe coding está a construir.",
  openGraph: {
    title: "Showcase | VibeTuga",
    description:
      "Projetos construídos pela comunidade VibeTuga. Descobre o que a comunidade portuguesa de vibe coding está a construir.",
  },
};

type SearchParams = Promise<{
  tech?: string;
  q?: string;
  page?: string;
}>;

export default async function ShowcasePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [{ projects }, featuredProjects] = await Promise.all([
    getApprovedProjects({ techStack: params.tech, q: params.q, page }),
    getFeaturedProjects(),
  ]);

  const featuredProject = featuredProjects[0] ?? null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-white uppercase mb-2">
          Showcase
        </h1>
        <p className="font-label text-primary tracking-widest text-sm opacity-80">
          PROJETOS CONSTRUÍDOS PELA COMUNIDADE VIBETUGA.
        </p>
      </div>

      {/* Featured Project Banner */}
      {featuredProject && (
        <section className="mb-16">
          <div className="relative group overflow-hidden rounded-sm bg-surface-container border border-secondary/20 shadow-[0_0_30px_rgba(216,115,255,0.1)] hover:shadow-[0_0_40px_rgba(216,115,255,0.2)] transition-all duration-500">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3 h-[400px] overflow-hidden relative bg-surface-container-lowest">
                {featuredProject.coverImage ? (
                  <Image
                    src={featuredProject.coverImage}
                    alt={featuredProject.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-low" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-transparent to-transparent hidden lg:block" />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary text-on-secondary px-3 py-1 font-label text-[10px] font-bold tracking-widest uppercase">
                    Projeto em Destaque
                  </span>
                </div>
              </div>
              <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  {featuredProject.authorImage ? (
                    <img
                      src={featuredProject.authorImage}
                      alt={featuredProject.authorName ?? "Autor"}
                      className="w-10 h-10 rounded-full border border-secondary/40 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-secondary/40 flex items-center justify-center text-xs font-bold text-secondary">
                      {(featuredProject.authorDisplayName ??
                        featuredProject.authorName ??
                        "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-label text-secondary tracking-widest uppercase">
                      Criado por
                    </p>
                    <p className="text-sm font-bold text-white">
                      @{featuredProject.authorName ?? "anon"}
                    </p>
                  </div>
                </div>
                <h2 className="font-headline text-3xl font-black text-white mb-4 leading-tight uppercase">
                  {featuredProject.title}
                </h2>
                {featuredProject.description && (
                  <p className="text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-3">
                    {featuredProject.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-8">
                  {(featuredProject.techStack ?? []).slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-surface-container-highest border border-outline-variant text-[10px] text-white/70 font-label"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/showcase/${featuredProject.slug}`}
                  className="w-full py-4 bg-secondary text-on-secondary font-headline font-black uppercase tracking-tighter hover:bg-secondary-dim transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Ver Projeto
                  <svg
                    className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <section className="mb-12 sticky top-[80px] z-40 bg-background/90 backdrop-blur-md py-4">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <Suspense
            fallback={
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-surface-container-high animate-pulse" />
                <div className="h-8 w-16 bg-surface-container-high animate-pulse" />
                <div className="h-8 w-16 bg-surface-container-high animate-pulse" />
              </div>
            }
          >
            <ShowcaseTechFilter />
          </Suspense>
          <div className="flex gap-4 w-full md:w-auto">
            <Suspense
              fallback={<div className="h-8 w-64 bg-surface-container-lowest animate-pulse" />}
            >
              <ShowcaseSearchInput />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/showcase/${project.slug}`}
            className="group bg-surface-container-low border border-white/5 hover:border-primary/50 transition-all duration-300 flex flex-col hover:-translate-y-[4px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
          >
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden bg-surface-container-lowest">
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container opacity-60 group-hover:opacity-90 transition-opacity" />
              )}
              {project.status === "featured" && (
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-sm border border-primary/30">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-[9px] font-label font-bold text-primary tracking-tighter uppercase">
                      Featured
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex flex-col items-center bg-black/80 px-2 py-1 rounded-sm border border-white/10">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                <span className="font-label text-[10px] font-bold text-white">
                  {project.votesCount}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {project.authorImage ? (
                    <img
                      src={project.authorImage}
                      alt={project.authorName ?? "Autor"}
                      className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-[10px] font-bold text-white/50">
                      {(project.authorDisplayName ?? project.authorName ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs font-label text-white/50 tracking-tight">
                  @{project.authorName ?? "anon"}
                </span>
              </div>

              <h3 className="font-headline text-lg font-bold text-white mb-2 uppercase group-hover:text-primary transition-colors">
                {project.title}
              </h3>

              <p className="text-on-surface-variant text-xs mb-4 leading-relaxed line-clamp-2">
                {project.description ?? ""}
              </p>

              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {(project.techStack ?? []).slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[9px] font-label text-white/40 uppercase">
                    #{tag}
                  </span>
                ))}
                {(project.aiToolsUsed ?? []).length > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <svg
                      className="w-3 h-3 text-tertiary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-[9px] font-label text-tertiary uppercase">
                      {project.aiToolsUsed![0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {/* Empty placeholder card */}
        <div className="bg-surface-container-low border border-white/5 border-dashed flex items-center justify-center h-[400px]">
          <div className="text-center p-8">
            <svg
              className="w-12 h-12 text-white/10 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="font-headline text-white/20 uppercase font-black">Teu Projeto Aqui</p>
          </div>
        </div>
      </div>

      {/* Submit FAB */}
      <SubmitProjectFAB />
    </div>
  );
}
