import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import {
  getHomepageStats,
  getHomepageFeaturedProjects,
  getHomepageLatestPosts,
  getHomepageLeaderboard,
} from "@/lib/db/queries/homepage";
import { getLevelName } from "@/lib/db/queries/profile";
import { formatDatePT } from "@/lib/blog-utils";

const AnimateIn = dynamic(() => import("@/components/shared/AnimateIn").then((m) => m.AnimateIn));

export const metadata: Metadata = {
  title: "VibeTuga — Comunidade Portuguesa de Vibe Coding",
  description:
    "A comunidade portuguesa de vibe coding, IA e desenvolvimento assistido por agentes. Aprende, partilha e constrói o futuro da programação.",
  openGraph: {
    title: "VibeTuga — Comunidade Portuguesa de Vibe Coding",
    description:
      "A comunidade portuguesa de vibe coding, IA e desenvolvimento assistido por agentes. Aprende, partilha e constrói o futuro da programação.",
    type: "website",
  },
};

export const revalidate = 60;

const RANK_COLORS = ["#a1ffc2", "#c084fc", "#38bdf8", "#f59e0b", "#f472b6"];
const POST_HOVER_COLORS = [
  "hover:border-secondary",
  "hover:border-tertiary",
  "hover:border-secondary",
];

// ─── Static Hero Section (no data needed, renders immediately) ───────────────

function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <img
        src="/images/hero-bg.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-gradient" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <AnimateIn delay={0.05} duration={0.4}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label text-[10px] tracking-widest text-primary uppercase">
              System Online: v2.0.4
            </span>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.15} duration={0.5}>
          <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            Onde o código <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
              encontra a vibe
            </span>
          </h1>
        </AnimateIn>

        <AnimateIn delay={0.25} duration={0.5}>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 font-light">
            A comunidade portuguesa de vibe coding, AI tooling e desenvolvimento assistido por
            agentes.
          </p>
        </AnimateIn>

        <AnimateIn delay={0.35} duration={0.5}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://discord.vibetuga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary font-bold flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
            >
              Junta-te ao Discord
            </a>
            <Link
              href="/showcase"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-tertiary/40 text-tertiary font-bold hover:bg-tertiary/5 hover:border-tertiary transition-all"
            >
              Explora Projetos
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <section className="border-y border-outline-variant/10 bg-surface-container-low py-8">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-8 w-24 bg-surface-container-high animate-pulse rounded-sm" />
            <div className="h-3 w-16 bg-surface-container-high animate-pulse rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="h-8 w-48 bg-surface-container-high animate-pulse rounded-sm mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container border border-white/5 p-4">
            <div className="aspect-video mb-4 bg-surface-container-high animate-pulse" />
            <div className="h-5 w-3/4 bg-surface-container-high animate-pulse mb-2 rounded-sm" />
            <div className="h-4 w-1/2 bg-surface-container-high animate-pulse rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestContentSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24 border-t border-outline-variant/10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4">
              <div className="aspect-video bg-surface-container-high animate-pulse" />
              <div className="space-y-3">
                <div className="h-3 w-16 bg-surface-container-high animate-pulse rounded-sm" />
                <div className="h-6 w-3/4 bg-surface-container-high animate-pulse rounded-sm" />
                <div className="h-4 w-1/2 bg-surface-container-high animate-pulse rounded-sm" />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="h-8 w-32 bg-surface-container-high animate-pulse mb-8 rounded-sm" />
          <div className="bg-surface-container border border-white/5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="h-4 w-8 bg-surface-container-high animate-pulse rounded-sm" />
                <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" />
                <div className="h-4 w-24 bg-surface-container-high animate-pulse rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Async data sections (enable streaming SSR) ──────────────────────────────

async function StatsSection() {
  const stats = await getHomepageStats();
  const statsDisplay = [
    {
      value: stats.totalMembers.toLocaleString("pt-PT"),
      label: "Membros",
      color: "text-primary",
    },
    {
      value: stats.totalProjects.toLocaleString("pt-PT"),
      label: "Projetos",
      color: "text-tertiary",
    },
    {
      value: stats.totalPosts.toLocaleString("pt-PT"),
      label: "Blog Posts",
      color: "text-secondary",
    },
    { value: stats.totalXP.toLocaleString("pt-PT"), label: "XP Total", color: "text-white" },
  ];

  return (
    <section className="border-y border-outline-variant/10 bg-surface-container-low py-8">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {statsDisplay.map((stat, index) => (
          <AnimateIn key={stat.label} delay={index * 0.08} duration={0.4}>
            <div className="flex flex-col">
              <span className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                {stat.label}
              </span>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}

async function FeaturedProjectsSection() {
  const featuredProjects = await getHomepageFeaturedProjects();

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="font-headline text-3xl font-black uppercase tracking-tight mb-2">
            Projetos em Destaque
          </h2>
          <p className="text-on-surface-variant text-sm">O que a comunidade está a construir.</p>
        </div>
        <Link
          href="/showcase"
          className="text-primary text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all"
        >
          Ver todos
        </Link>
      </div>

      {featuredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-surface-container">
          <p className="text-on-surface-variant mb-4">Ainda não há projetos em destaque.</p>
          <Link
            href="/dashboard/submit-project"
            className="text-primary text-sm font-bold uppercase tracking-widest hover:underline"
          >
            Submete o teu projeto →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProjects.map((project, index) => (
            <AnimateIn key={project.id} delay={index * 0.08} duration={0.45}>
              <Link
                href={`/showcase/${project.slug}`}
                className="group bg-surface-container border border-white/5 p-4 transition-all hover:bg-surface-container-high hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] block"
              >
                {/* Cover image */}
                <div className="relative aspect-video mb-4 overflow-hidden bg-surface-container-lowest">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={`/images/project-placeholder-${(index % 4) + 1}.svg`}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  )}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-tertiary">
                      {project.techStack[0]}
                    </div>
                  )}
                </div>

                <h3 className="font-headline font-bold text-lg mb-2 truncate">{project.title}</h3>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-surface-container-highest" />
                  <span className="text-xs text-on-surface-variant">
                    {project.authorDisplayName ?? project.authorName ?? "anon"}
                  </span>
                </div>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 border border-white/10 text-white/40 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1 text-primary">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-xs font-mono font-bold">{project.votesCount ?? 0}</span>
                  </div>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      )}
    </section>
  );
}

async function LatestContentSection() {
  const [latestPosts, leaderboard] = await Promise.all([
    getHomepageLatestPosts(),
    getHomepageLeaderboard(),
  ]);

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-24 border-t border-outline-variant/10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Latest Posts (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-headline text-3xl font-black uppercase tracking-tight">
              Últimos Posts
            </h2>
            <Link href="/blog" className="text-white/40 hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-surface-container">
              <p className="text-on-surface-variant mb-4">Ainda não há posts publicados.</p>
              <Link
                href="/dashboard/submit-post"
                className="text-primary text-sm font-bold uppercase tracking-widest hover:underline"
              >
                Escreve o primeiro post →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {latestPosts.map((post, index) => (
                <AnimateIn key={post.id} delay={index * 0.1} duration={0.4}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`group grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 p-4 hover:bg-surface-container-low transition-colors border-l-2 border-transparent ${POST_HOVER_COLORS[index % POST_HOVER_COLORS.length]} block`}
                  >
                    <div className="relative aspect-video bg-surface-container-highest overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 200px"
                          className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={`/images/blog-placeholder-${(index % 3) + 1}.svg`}
                          alt={post.title}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        />
                      )}
                    </div>
                    <div>
                      {post.categoryName && (
                        <span
                          className="font-label text-[10px] font-bold uppercase tracking-widest mb-2 block"
                          style={{ color: post.categoryColor ?? undefined }}
                        >
                          {post.categoryName}
                        </span>
                      )}
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          {post.authorDisplayName ?? post.authorName ?? "anon"}
                        </span>
                        {post.readingTimeMinutes && (
                          <span className="flex items-center gap-1 font-mono">
                            {post.readingTimeMinutes} min read
                          </span>
                        )}
                        {post.viewsCount !== null && post.viewsCount !== undefined && (
                          <span className="flex items-center gap-1 font-mono">
                            {post.viewsCount.toLocaleString("pt-PT")} views
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1 font-mono">
                            {formatDatePT(post.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </AnimateIn>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Widget (1/3 width) */}
        <AnimateIn delay={0.2} duration={0.5} direction="left">
          <div>
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight mb-8">
              Leaderboard
            </h2>

            {leaderboard.length === 0 ? (
              <div className="bg-surface-container border border-white/5 p-8 text-center">
                <p className="text-on-surface-variant text-sm mb-2">Sê o primeiro!</p>
                <Link
                  href="/leaderboard"
                  className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Ver ranking completo
                </Link>
              </div>
            ) : (
              <div className="bg-surface-container border border-white/5 rounded-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-normal">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest font-normal">
                        User
                      </th>
                      <th className="px-4 py-3 text-[10px] font-label text-on-surface-variant uppercase tracking-widest text-right font-normal">
                        XP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {leaderboard.map((entry, index) => {
                      const isFirst = index === 0;
                      const rankColor = RANK_COLORS[index] ?? "#ffffff";
                      const displayName = entry.displayName ?? entry.discordUsername ?? "anon";
                      const initial = displayName.charAt(0).toUpperCase();

                      return (
                        <tr
                          key={entry.id}
                          className={`border-b border-white/5 ${isFirst ? "bg-primary/5" : ""}`}
                        >
                          <td
                            className={`px-4 py-4 font-bold ${isFirst ? "text-primary" : "text-on-surface-variant"}`}
                          >
                            #{index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              href={`/profile/${entry.id}`}
                              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                              {entry.image ? (
                                <Image
                                  src={entry.image}
                                  alt={displayName}
                                  width={32}
                                  height={32}
                                  className="rounded-full border border-outline-variant/30"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-outline-variant/30"
                                  style={{
                                    backgroundColor: `${rankColor}15`,
                                    color: rankColor,
                                  }}
                                >
                                  {initial}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-white font-bold">{displayName}</span>
                                <span className="text-[9px] text-primary/60 uppercase">
                                  {getLevelName(entry.level ?? 1)}
                                </span>
                              </div>
                            </Link>
                          </td>
                          <td
                            className={`px-4 py-4 text-right ${isFirst ? "text-primary" : "text-white/60"}`}
                          >
                            {(entry.xpPoints ?? 0).toLocaleString("pt-PT")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-4 text-center">
                  <Link
                    href="/leaderboard"
                    className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Ver ranking completo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<ProjectsSkeleton />}>
        <FeaturedProjectsSection />
      </Suspense>
      <Suspense fallback={<LatestContentSkeleton />}>
        <LatestContentSection />
      </Suspense>
    </>
  );
}
