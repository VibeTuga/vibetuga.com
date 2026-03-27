import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getContributors, getMonthlyHighlights } from "@/lib/db/queries/contributors";
import { getContributorsPageJsonLd } from "@/lib/jsonld";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contribuidores | VibeTuga",
  description:
    "Conhece os membros reconhecidos do programa de contribuidores da comunidade VibeTuga. Quem constrói, ensina e inspira a comunidade portuguesa de vibe coding.",
  openGraph: {
    title: "Contribuidores | VibeTuga",
    description:
      "Conhece os membros reconhecidos do programa de contribuidores da comunidade VibeTuga.",
  },
  alternates: {
    canonical: "https://vibetuga.com/contributors",
  },
};

// ─── helpers ────────────────────────────────────────────────

const LEVEL_NAMES: Record<number, string> = {
  1: "Noob",
  2: "Script Kiddie",
  3: "Vibe Coder",
  4: "Prompt Whisperer",
  5: "AI Tamer",
  6: "Code Wizard",
  7: "Agent Builder",
  8: "Tuga Master",
  9: "Vibe Lord",
  10: "Lenda",
};

function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? `LVL ${level}`;
}

function getLevelRingClass(level: number): { border?: string; style?: CSSProperties } {
  if (level <= 3) return { border: "border-primary shadow-[0_0_20px_rgba(161,255,194,0.2)]" };
  if (level <= 6) return { border: "border-tertiary shadow-[0_0_20px_rgba(129,233,255,0.2)]" };
  if (level <= 9) return { border: "border-secondary shadow-[0_0_20px_rgba(216,115,255,0.2)]" };
  return {
    style: {
      background: "conic-gradient(from 0deg, #a1ffc2, #81e9ff, #d873ff, #a1ffc2)",
      boxShadow: "0 0 20px rgba(161,255,194,0.3)",
    },
  };
}

const highlightColors = [
  {
    text: "text-primary",
    border: "border-primary",
    bg: "bg-primary",
    on: "text-on-primary",
    shadow: "shadow-[0_0_20px_rgba(161,255,194,0.3)]",
  },
  {
    text: "text-tertiary",
    border: "border-tertiary",
    bg: "bg-tertiary",
    on: "text-on-tertiary",
    shadow: "shadow-[0_0_20px_rgba(129,233,255,0.3)]",
  },
  {
    text: "text-secondary",
    border: "border-secondary",
    bg: "bg-secondary",
    on: "text-on-secondary",
    shadow: "shadow-[0_0_20px_rgba(216,115,255,0.3)]",
  },
] as const;

function formatXP(xp: number): string {
  return xp.toLocaleString("pt-PT");
}

// ─── page ───────────────────────────────────────────────────

export default async function ContributorsPage() {
  const [contributors, highlights] = await Promise.all([getContributors(), getMonthlyHighlights()]);

  const jsonLd = getContributorsPageJsonLd();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Section ── */}
      <section className="mb-16">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-background mb-3">
          Contribuidores
        </h1>
        <p className="font-label text-primary/60 uppercase tracking-widest text-sm mb-6">
          Quem constrói a comunidade.
        </p>
        <div className="max-w-2xl">
          <p className="text-white/60 text-sm leading-relaxed">
            O Programa de Contribuidores reconhece os membros que mais impactam a comunidade
            VibeTuga — seja através de código, conteúdo, mentoria ou simplesmente ajudando outros a
            crescer. Contribuidores verificados ganham um badge exclusivo, aparecem nesta página e
            recebem destaque especial na comunidade.
          </p>
        </div>
      </section>

      {/* ── Monthly Highlights ── */}
      {highlights.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl">🌟</span>
            <h2 className="font-headline text-2xl font-bold tracking-tight">Destaques do Mês</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((user, i) => {
              const color = highlightColors[i];
              const username = user.displayName || user.discordUsername;
              return (
                <Link
                  key={user.userId}
                  href={`/profile/${user.userId}`}
                  className={`group bg-surface-container-low border border-white/5 hover:border-${color.text.replace("text-", "")}/30 p-6 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 w-full h-0.5 ${color.bg}/50`} />
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-14 h-14 rounded-full border-2 ${color.border} p-0.5 ${color.shadow}`}
                    >
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={username}
                          width={52}
                          height={52}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-bold text-sm ${color.text}`}
                        >
                          {username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {username}
                        {user.isVerified && <VerifiedBadge />}
                      </h3>
                      <p className="text-[10px] font-label text-white/40 uppercase tracking-widest">
                        {getLevelName(user.level)}_LVL{user.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono font-bold text-xl ${color.text}`}>
                      +{formatXP(user.totalXp)}
                    </span>
                    <span className="text-[10px] font-label text-white/30 uppercase">
                      XP este mês
                    </span>
                  </div>
                  <div
                    className={`absolute top-3 right-3 ${color.bg} ${color.on} w-7 h-7 flex items-center justify-center font-headline font-black text-sm`}
                  >
                    {i + 1}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Contributors Grid ── */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🤝</span>
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            Programa de Contribuidores
          </h2>
          <span className="ml-auto px-3 py-1 bg-primary/10 text-primary text-[10px] font-label uppercase tracking-widest border border-primary/20">
            {contributors.length} membro{contributors.length !== 1 ? "s" : ""}
          </span>
        </div>

        {contributors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributors.map((user) => {
              const username = user.displayName || user.discordUsername;
              const ring = getLevelRingClass(user.level);
              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="group bg-surface-container-low border border-white/5 hover:border-primary/20 p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with level ring */}
                    {ring.style ? (
                      <div
                        style={{
                          ...ring.style,
                          padding: "2px",
                          borderRadius: "50%",
                          display: "inline-block",
                        }}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={username}
                              width={48}
                              height={48}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-bold text-xs text-primary">
                              {username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-full border-2 ${ring.border} p-0.5`}>
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={username}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-bold text-xs text-primary">
                            {username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-sm text-white group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                        {username}
                        {user.isVerified && <VerifiedBadge />}
                      </h3>
                      <p className="font-mono text-[10px] text-white/30 truncate">
                        @{user.discordUsername}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-label text-white/40 uppercase mb-0.5">
                        LVL {user.level}
                      </p>
                      <p className="text-[10px] font-mono text-primary-dim">
                        {user.badgeCount} badge{user.badgeCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-white/30 font-label uppercase tracking-widest text-sm">
            Ainda não há contribuidores. Sê o primeiro!
          </div>
        )}
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-surface-container-low border border-white/5 p-8 md:p-12 text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-3">
          Queres ser contribuidor?
        </h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-8">
          Contribui para a comunidade através de posts, projetos, mentoria ou código. Pede o upgrade
          do teu role e junta-te ao programa.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-block bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest px-8 py-3 hover:shadow-[0_0_20px_rgba(161,255,194,0.3)] active:scale-95 transition-all"
        >
          Pedir Role de Contribuidor
        </Link>
      </section>
    </div>
  );
}
