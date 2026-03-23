import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getUserProfile,
  getLevelName,
  getLevelXpRange,
  type ProfilePost,
  type ProfileProject,
  type ProfileBadge,
} from "@/lib/db/queries/profile";
import { XpProgressBar } from "@/components/profile/XpProgressBar";
import { LevelRing } from "@/components/profile/LevelRing";

// ─── helpers ────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderador",
  author: "Autor",
  seller: "Vendedor",
  member: "Membro",
};

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  moderator: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  author: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  seller: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  member: "bg-primary/20 text-primary border-primary/30",
};

const ACTION_LABELS: Record<string, string> = {
  blog_post_published: "Post publicado",
  blog_comment: "Comentário",
  project_submitted: "Projeto submetido",
  project_featured: "Projeto destacado",
  product_sold: "Produto vendido",
  product_reviewed: "Revisão de produto",
  daily_login: "Login diário",
  streak_7_days: "Streak de 7 dias",
  streak_30_days: "Streak de 30 dias",
  referred_user: "Utilizador referido",
  community_helper: "Ajuda à comunidade",
};

function getLevelRingClass(level: number): { border?: string; style?: CSSProperties } {
  if (level <= 3) return { border: "border-primary shadow-[0_0_20px_rgba(161,255,194,0.2)]" };
  if (level <= 6) return { border: "border-tertiary shadow-[0_0_20px_rgba(129,233,255,0.2)]" };
  if (level <= 9) return { border: "border-secondary shadow-[0_0_20px_rgba(216,115,255,0.2)]" };
  // Level 10: gradient ring
  return {
    style: {
      background: "conic-gradient(from 0deg, #a1ffc2, #81e9ff, #d873ff, #a1ffc2)",
      boxShadow: "0 0 20px rgba(161,255,194,0.3)",
    },
  };
}

function formatDatePT(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("pt-PT", { month: "short", year: "numeric" }).toUpperCase();
}

function formatXP(xp: number): string {
  return xp.toLocaleString("pt-PT");
}

// ─── sub-components ─────────────────────────────────────────

function PostRow({ post }: { post: ProfilePost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group flex gap-4 p-4 bg-surface-container hover:bg-surface-container-high transition-colors">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={80}
            height={54}
            className="object-cover shrink-0 opacity-80"
          />
        ) : (
          <div className="w-20 h-14 shrink-0 bg-surface-container-highest" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm text-white group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {post.title}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
            {post.categoryName && (
              <span className="text-primary/60 uppercase">{post.categoryName}</span>
            )}
            <span>{formatDatePT(post.publishedAt)}</span>
            <span>{post.readingTimeMinutes} min</span>
            <span>{post.viewsCount} views</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function ProjectRow({ project }: { project: ProfileProject }) {
  return (
    <Link href={`/showcase/${project.slug}`}>
      <article className="group flex gap-4 p-4 bg-surface-container hover:bg-surface-container-high transition-colors">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            width={80}
            height={54}
            className="object-cover shrink-0 opacity-80"
          />
        ) : (
          <div className="w-20 h-14 shrink-0 bg-surface-container-highest" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-headline font-bold text-sm text-white group-hover:text-tertiary transition-colors line-clamp-1">
              {project.title}
            </p>
            {project.status === "featured" && (
              <span className="shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase">
                DESTAQUE
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-[11px] text-white/40 line-clamp-1 mb-1">{project.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {(project.techStack ?? []).slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-1.5 py-0.5 bg-surface-container-highest text-[9px] font-mono text-white/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-xs font-bold text-white/40">{project.votesCount} ↑</p>
        </div>
      </article>
    </Link>
  );
}

function BadgeCard({ badge }: { badge: ProfileBadge }) {
  if (badge.earned) {
    return (
      <div className="group bg-surface-container-high p-5 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(161,255,194,0.05)] transition-all hover:bg-surface-bright">
        <div className="mb-4 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full text-primary drop-shadow-[0_0_8px_rgba(161,255,194,0.6)]">
          <span className="text-2xl">{badge.icon ?? "🏆"}</span>
        </div>
        <h3 className="font-headline font-bold text-sm mb-1 uppercase tracking-tight text-white">
          {badge.name}
        </h3>
        {badge.description && (
          <p className="text-xs text-white/50 mb-4 h-8 overflow-hidden line-clamp-2">
            {badge.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-primary">+{badge.xpReward} XP</span>
          <span className="text-primary text-xs">✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-surface-container opacity-40 p-5 rounded-lg border border-white/5 grayscale transition-all">
      <div className="mb-4 w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white/40">
        <span className="text-2xl">{badge.icon ?? "🔒"}</span>
      </div>
      <h3 className="font-headline font-bold text-sm mb-1 uppercase tracking-tight">
        {badge.name}
      </h3>
      {badge.description && (
        <p className="text-xs text-white/50 mb-4 h-8 overflow-hidden line-clamp-2">
          {badge.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/20">+{badge.xpReward} XP</span>
        <span className="text-white/20 text-xs">🔒</span>
      </div>
    </div>
  );
}

// ─── page ───────────────────────────────────────────────────

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getUserProfile(id);
  if (!profile) {
    return { title: "Perfil não encontrado — VibeTuga" };
  }
  const displayName = profile.user.displayName || profile.user.discordUsername;
  return {
    title: `${displayName} — VibeTuga`,
    description: profile.user.bio ?? `Perfil de ${displayName} na comunidade VibeTuga.`,
    openGraph: {
      title: `${displayName} — VibeTuga`,
      description: profile.user.bio ?? `Perfil de ${displayName} na comunidade VibeTuga.`,
      images: profile.user.image ? [{ url: profile.user.image, width: 1200, height: 630 }] : [],
    },
    alternates: {
      canonical: `https://vibetuga.com/profile/${id}`,
    },
  };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "badges" } = await searchParams;

  const profile = await getUserProfile(id);
  if (!profile) notFound();

  const { user, badges: allBadges, posts, projects, recentXpEvents } = profile;
  const displayName = user.displayName || user.discordUsername;
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const roleStyle = ROLE_STYLES[user.role] ?? ROLE_STYLES.member;

  const ring = getLevelRingClass(user.level);
  const levelRange = getLevelXpRange(user.level);
  const xpForDisplay = levelRange.next
    ? user.xpPoints - levelRange.current
    : user.xpPoints - levelRange.current;
  const xpNeeded = levelRange.next ? levelRange.next - levelRange.current : null;
  const progressPct =
    xpNeeded && xpNeeded > 0 ? Math.min(100, Math.round((xpForDisplay / xpNeeded) * 100)) : 100;

  const earnedCount = allBadges.filter((b) => b.earned).length;

  const tabs = [
    { key: "badges", label: "Badges", count: earnedCount },
    { key: "posts", label: "Posts", count: posts.length },
    { key: "projects", label: "Projetos", count: projects.length },
    { key: "activity", label: "Atividade", count: recentXpEvents.length },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Profile card */}
          <section className="bg-surface-container-low p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <span className="text-6xl font-mono">{"</>"}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              {/* Avatar with level ring */}
              <div className="relative mb-6">
                <LevelRing ring={ring} image={user.image} displayName={displayName} />

                {/* Role badge */}
                <div
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap border rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${roleStyle}`}
                >
                  {roleLabel}
                </div>
              </div>

              <h1 className="font-headline text-2xl font-bold tracking-tight mt-2 mb-0.5">
                {displayName}
              </h1>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-4">
                @{user.discordUsername}
              </p>

              {/* Streak */}
              {user.streakDays > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-white/5 mb-4">
                  <span className="text-orange-500 text-sm">🔥</span>
                  <span className="font-mono text-xs font-bold uppercase">
                    {user.streakDays} dias streak
                  </span>
                </div>
              )}

              <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-4">
                Desde {formatDatePT(user.createdAt)}
              </p>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-xs">{user.bio}</p>
              )}

              {/* Website link */}
              {user.websiteUrl && (
                <a
                  href={user.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors text-xs font-mono mb-6"
                >
                  <span>🌐</span>
                  <span className="truncate max-w-[180px]">
                    {user.websiteUrl.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}
            </div>

            {/* XP / Level progress */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline text-sm font-bold text-primary">
                  {getLevelName(user.level)} — Nível {user.level}
                </span>
                {xpNeeded && (
                  <span className="font-mono text-[10px] text-white/40">
                    {formatXP(user.xpPoints - levelRange.current)} / {formatXP(xpNeeded)} XP
                  </span>
                )}
              </div>
              <XpProgressBar progressPct={progressPct} />
              <div className="font-mono text-[10px] text-right text-white/40 tracking-widest">
                TOTAL_XP: {formatXP(user.xpPoints)}
              </div>
            </div>
          </section>

          {/* Mini stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-lg p-4 border border-white/5 flex flex-col gap-2">
              <span className="text-tertiary text-xl">🚀</span>
              <div className="font-headline text-lg font-black tracking-tighter leading-none">
                {projects.length}
              </div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                Projects
              </div>
            </div>
            <div className="bg-surface-container rounded-lg p-4 border border-white/5 flex flex-col gap-2">
              <span className="text-secondary text-xl">📝</span>
              <div className="font-headline text-lg font-black tracking-tighter leading-none">
                {posts.length}
              </div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                Posts
              </div>
            </div>
            <div className="bg-surface-container rounded-lg p-4 border border-white/5 flex flex-col gap-2">
              <span className="text-primary text-xl">⭐</span>
              <div className="font-headline text-lg font-black tracking-tighter leading-none">
                {String(earnedCount).padStart(2, "0")}
              </div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                Badges
              </div>
            </div>
            <div className="bg-surface-container rounded-lg p-4 border border-white/5 flex flex-col gap-2">
              <span className="text-white text-xl">🎖️</span>
              <div className="font-headline text-lg font-black tracking-tighter leading-none">
                {user.level}
              </div>
              <div className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                Nível
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-8">
          {/* Tab navigation (URL-driven) */}
          <div className="mb-8 overflow-x-auto">
            <nav className="flex gap-1 border-b border-white/5 min-w-max">
              {tabs.map((t) => (
                <Link
                  key={t.key}
                  href={`/profile/${id}?tab=${t.key}`}
                  className={`px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${
                    tab === t.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-white/40 hover:text-white border-b-2 border-transparent"
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className={`font-mono text-[9px] px-1 rounded ${tab === t.key ? "text-primary" : "text-white/20"}`}
                    >
                      ({t.count})
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Badges tab */}
          {tab === "badges" && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {allBadges.length === 0 ? (
                <div className="col-span-full text-center py-16 text-white/30 font-label uppercase tracking-widest text-xs">
                  Ainda não há badges disponíveis.
                </div>
              ) : (
                allBadges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)
              )}
            </div>
          )}

          {/* Posts tab */}
          {tab === "posts" && (
            <div className="flex flex-col gap-2">
              {posts.length === 0 ? (
                <div className="text-center py-16 text-white/30 font-label uppercase tracking-widest text-xs">
                  Ainda sem posts publicados.
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostRow key={post.id} post={post} />
                  ))}
                  <Link
                    href={`/blog?author=${id}`}
                    className="mt-4 text-center py-3 border border-white/10 text-xs font-label uppercase tracking-widest text-white/40 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    Ver todos os posts
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Projects tab */}
          {tab === "projects" && (
            <div className="flex flex-col gap-2">
              {projects.length === 0 ? (
                <div className="text-center py-16 text-white/30 font-label uppercase tracking-widest text-xs">
                  Ainda sem projetos aprovados.
                </div>
              ) : (
                <>
                  {projects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
                  <Link
                    href="/showcase"
                    className="mt-4 text-center py-3 border border-white/10 text-xs font-label uppercase tracking-widest text-white/40 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    Ver todos os projetos
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Activity tab */}
          {tab === "activity" && (
            <div className="flex flex-col gap-2">
              {recentXpEvents.length === 0 ? (
                <div className="text-center py-16 text-white/30 font-label uppercase tracking-widest text-xs">
                  Sem atividade recente.
                </div>
              ) : (
                recentXpEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-surface-container border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-primary text-sm">⚡</span>
                      <span className="text-sm text-white/70">
                        {ACTION_LABELS[event.action] ?? event.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-primary">
                        +{event.xpAmount} XP
                      </span>
                      <span className="font-mono text-[10px] text-white/30">
                        {formatDatePT(event.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
