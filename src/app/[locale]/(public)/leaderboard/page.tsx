import dynamic from "next/dynamic";
import { Link } from "@/lib/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { users, showcaseProjects } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";

const AnimatedPodiumItem = dynamic(() =>
  import("@/components/leaderboard/AnimatedLeaderboard").then((m) => m.AnimatedPodiumItem),
);
const AnimatedTableRow = dynamic(() =>
  import("@/components/leaderboard/AnimatedLeaderboard").then((m) => m.AnimatedTableRow),
);

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Leaderboard | VibeTuga",
  description:
    "Rankings de XP e competição da comunidade VibeTuga. Descobre quem está a vibrar mais forte e sobe no leaderboard.",
  openGraph: {
    title: "Leaderboard | VibeTuga",
    description:
      "Rankings de XP e competição da comunidade VibeTuga. Descobre quem está a vibrar mais forte e sobe no leaderboard.",
  },
  alternates: {
    canonical: "https://vibetuga.com/leaderboard",
  },
};

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

function formatXP(xp: number): string {
  return xp.toLocaleString("pt-PT");
}

const podiumColors = [
  {
    rank: "#2",
    color: "tertiary",
    borderColor: "border-tertiary",
    bgColor: "bg-tertiary",
    textColor: "text-tertiary",
    onColor: "text-on-tertiary",
    shadow: "shadow-[0_0_20px_rgba(129,233,255,0.3)]",
    size: "w-24 h-24",
    padding: "p-8",
    order: "order-2 md:order-1",
    xpSize: "text-2xl",
    isFirst: false,
  },
  {
    rank: "#1",
    color: "primary",
    borderColor: "border-primary",
    bgColor: "bg-primary",
    textColor: "text-primary",
    onColor: "text-on-primary",
    shadow: "shadow-[0_0_30px_rgba(161,255,194,0.4)]",
    size: "w-32 h-32",
    padding: "p-10",
    order: "order-1 md:order-2",
    xpSize: "text-4xl",
    isFirst: true,
  },
  {
    rank: "#3",
    color: "secondary",
    borderColor: "border-secondary",
    bgColor: "bg-secondary",
    textColor: "text-secondary",
    onColor: "text-on-secondary",
    shadow: "shadow-[0_0_20px_rgba(216,115,255,0.3)]",
    size: "w-24 h-24",
    padding: "p-8",
    order: "order-3 md:order-3",
    xpSize: "text-2xl",
    isFirst: false,
  },
] as const;

const timeTabs = [
  { label: "Semanal", active: false },
  { label: "Mensal", active: false },
  { label: "All-Time", active: true },
] as const;

const categoryPills = [
  { label: "Geral", active: true },
  { label: "Criadores de Projetos", active: false },
  { label: "Top Sellers", active: false },
  { label: "Mais Helpful", active: false },
] as const;

export default async function LeaderboardPage() {
  const [session, topUsers] = await Promise.all([
    auth(),
    db
      .select({
        id: users.id,
        discordUsername: users.discordUsername,
        displayName: users.displayName,
        image: users.image,
        xpPoints: users.xpPoints,
        level: users.level,
        isVerified: users.isVerified,
        projectCount: sql<number>`cast(count(distinct ${showcaseProjects.id}) as int)`,
      })
      .from(users)
      .leftJoin(showcaseProjects, eq(showcaseProjects.authorId, users.id))
      .groupBy(users.id)
      .orderBy(desc(users.xpPoints))
      .limit(50),
  ]);

  const podium = topUsers.slice(0, 3);
  const tableRows = topUsers.slice(3);

  let currentUserRank: number | null = null;
  let currentUserData: (typeof topUsers)[number] | null = null;

  if (session?.user?.id) {
    const idx = topUsers.findIndex((u) => u.id === session.user.id);
    if (idx >= 0) {
      currentUserRank = idx + 1;
      currentUserData = topUsers[idx];
    } else {
      // user is outside top 50 — fetch their data separately
      const [userData] = await db
        .select({
          id: users.id,
          discordUsername: users.discordUsername,
          displayName: users.displayName,
          image: users.image,
          xpPoints: users.xpPoints,
          level: users.level,
          isVerified: users.isVerified,
          projectCount: sql<number>`cast(count(distinct ${showcaseProjects.id}) as int)`,
        })
        .from(users)
        .leftJoin(showcaseProjects, eq(showcaseProjects.authorId, users.id))
        .where(eq(users.id, session.user.id))
        .groupBy(users.id)
        .limit(1);

      if (userData) {
        currentUserData = userData;
        const [rankRow] = await db
          .select({ rank: sql<number>`cast(count(*) as int)` })
          .from(users)
          .where(sql`${users.xpPoints} > ${userData.xpPoints}`);
        currentUserRank = (rankRow?.rank ?? 0) + 1;
      }
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8 min-h-screen">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-background mb-2">
              Leaderboard
            </h1>
            <p className="font-label text-primary/60 uppercase tracking-widest text-sm">
              Quem está a vibrar mais forte.
            </p>
          </div>
          {/* Tab Toggle */}
          <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/20">
            {timeTabs.map((tab) => (
              <button
                key={tab.label}
                className={`px-6 py-2 text-xs font-label uppercase tracking-wider transition-all ${
                  tab.active
                    ? "text-on-background bg-surface-container-highest rounded shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="flex flex-wrap gap-3 mb-12">
        {categoryPills.map((pill) => (
          <button
            key={pill.label}
            className={`px-4 py-1.5 rounded-full text-xs font-label uppercase tracking-tighter transition-all ${
              pill.active
                ? "border border-primary text-primary bg-primary/5"
                : "border border-outline-variant/30 text-white/60 hover:border-white"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </section>

      {/* Top 3 Showcase */}
      {podium.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {podium.map((user, i) => {
            const config = podiumColors[i];
            const username = user.displayName || user.discordUsername;
            return (
              <AnimatedPodiumItem
                key={user.id}
                index={i}
                className={`${config.order} flex flex-col items-center bg-surface-container-high/60 backdrop-blur-xl ${config.padding} border-t-2 ${config.borderColor}/50 relative ${
                  config.isFirst
                    ? "transform md:scale-110 z-10 shadow-[0_20px_50px_rgba(161,255,194,0.15)]"
                    : ""
                }`}
              >
                {config.isFirst ? (
                  <div
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 ${config.bgColor} ${config.onColor} px-6 py-2 font-headline font-black italic text-xl tracking-tighter whitespace-nowrap`}
                  >
                    THE ALPHA {config.rank}
                  </div>
                ) : (
                  <div
                    className={`absolute -top-4 ${config.rank === "#2" ? "left-4" : "right-4"} ${config.bgColor} ${config.onColor} px-3 py-1 font-headline font-bold italic`}
                  >
                    {config.rank}
                  </div>
                )}

                <div
                  className={`${config.size} rounded-full border-4 ${config.borderColor} p-1 mb-4 ${config.shadow}`}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-black ${config.textColor}`}
                    >
                      {username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <Link href={`/profile/${user.id}`}>
                  <h3
                    className={`font-headline ${config.isFirst ? "text-2xl font-black" : "text-xl font-bold"} ${config.textColor} mb-1 hover:underline flex items-center gap-1.5 justify-center`}
                  >
                    {username}
                    {user.isVerified && <VerifiedBadge />}
                  </h3>
                </Link>

                <div
                  className={`px-3 py-0.5 ${config.isFirst ? `${config.bgColor} ${config.onColor} font-bold` : `${config.bgColor}/10 ${config.textColor} border ${config.borderColor}/20`} text-[10px] font-label uppercase mb-4`}
                >
                  {getLevelName(user.level)}_LVL{user.level}
                </div>

                <div
                  className={`font-label ${config.xpSize} font-black text-white ${config.isFirst ? "tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" : ""}`}
                >
                  {formatXP(user.xpPoints)} XP
                </div>
              </AnimatedPodiumItem>
            );
          })}
        </section>
      )}

      {/* Leaderboard Table */}
      {tableRows.length > 0 && (
        <section className="mb-24 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead className="font-label text-[10px] text-white/30 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 py-4 font-normal">Rank</th>
                <th className="px-6 py-4 font-normal">Cidadão</th>
                <th className="px-6 py-4 font-normal">Credencial</th>
                <th className="px-6 py-4 font-normal">XP Protocol</th>
                <th className="px-6 py-4 font-normal">Obras</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableRows.map((user, i) => {
                const rank = i + 4;
                const username = user.displayName || user.discordUsername;
                return (
                  <AnimatedTableRow
                    key={user.id}
                    index={i}
                    className="bg-surface-container-low hover:bg-surface-container transition-colors group"
                  >
                    <td className="px-6 py-4 font-label font-bold text-white/40 group-hover:text-primary">
                      #{String(rank).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={username}
                            className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center font-headline font-bold text-xs text-white/60">
                            {username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold">{username}</span>
                        {user.isVerified && <VerifiedBadge />}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-sm bg-surface-container-highest text-[10px] font-label text-white/60">
                        LVL {user.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-dim">
                      {formatXP(user.xpPoints)}
                    </td>
                    <td className="px-6 py-4 font-mono">{user.projectCount}</td>
                  </AnimatedTableRow>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {topUsers.length === 0 && (
        <section className="mb-24 text-center py-24 text-white/30 font-label uppercase tracking-widest text-sm">
          Ainda não há dados. Sê o primeiro a vibrar.
        </section>
      )}

      {/* Your Position (sticky bottom bar) — only shown when authenticated */}
      {session?.user && currentUserData && currentUserRank && (
        <section className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 md:pb-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-surface-container-high border-l-4 border-primary shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="font-headline font-black text-2xl italic text-primary">
                  #{currentUserRank}
                </div>
                <div className="hidden md:block w-[1px] h-8 bg-white/10" />
                <div className="flex items-center gap-3">
                  {currentUserData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUserData.image}
                      alt="Tu"
                      className="w-10 h-10 rounded-full object-cover border border-primary"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-primary flex items-center justify-center font-headline font-bold text-xs text-primary">
                      {(currentUserData.displayName || currentUserData.discordUsername)
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm">
                      Tu ({currentUserData.displayName || currentUserData.discordUsername})
                    </p>
                    <p className="text-[10px] font-label text-primary uppercase">Você está aqui</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8 pr-4">
                <div className="text-right">
                  <p className="text-[10px] font-label text-white/40 uppercase">Total XP</p>
                  <p className="font-mono font-bold text-primary text-xl">
                    {formatXP(currentUserData.xpPoints)}
                  </p>
                </div>
                <Link
                  href={`/profile/${session.user.id}`}
                  className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-4 py-2 hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
                >
                  Ver Perfil
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
