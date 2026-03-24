import type { Metadata } from "next";
import { Link } from "@/lib/navigation";
import { Trophy, Clock, Users, Star, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { challenges, challengeEntries } from "@/lib/db/schema";
import { eq, desc, sql, or } from "drizzle-orm";
import { ChallengeCountdown } from "@/components/challenges/ChallengeCountdown";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Desafios | VibeTuga",
  description:
    "Participa nos desafios da comunidade VibeTuga. Compete, aprende e ganha XP e badges.",
  openGraph: {
    title: "Desafios | VibeTuga",
    description:
      "Participa nos desafios da comunidade VibeTuga. Compete, aprende e ganha XP e badges.",
    type: "website",
  },
  alternates: {
    canonical: "https://vibetuga.com/challenges",
  },
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "bg-green-500/20 text-green-400 border border-green-500/30",
  },
  voting: {
    label: "Votação",
    className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  },
  completed: { label: "Concluído", className: "bg-white/10 text-white/50 border border-white/10" },
  draft: { label: "Rascunho", className: "bg-white/5 text-white/30 border border-white/5" },
};

export default async function ChallengesPage() {
  const rows = await db
    .select({
      id: challenges.id,
      title: challenges.title,
      description: challenges.description,
      startAt: challenges.startAt,
      endAt: challenges.endAt,
      xpReward: challenges.xpReward,
      status: challenges.status,
      createdAt: challenges.createdAt,
      entryCount: sql<number>`cast(count(${challengeEntries.id}) as int)`,
    })
    .from(challenges)
    .leftJoin(challengeEntries, eq(challenges.id, challengeEntries.challengeId))
    .where(
      or(
        eq(challenges.status, "active"),
        eq(challenges.status, "voting"),
        eq(challenges.status, "completed"),
      ),
    )
    .groupBy(challenges.id)
    .orderBy(desc(challenges.startAt));

  const activeChallenges = rows.filter((c) => c.status === "active" || c.status === "voting");
  const pastChallenges = rows.filter((c) => c.status === "completed");

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="text-primary" size={28} />
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white">Desafios</h1>
          </div>
          <p className="text-white/50 max-w-2xl">
            Participa nos desafios da comunidade. Constrói, submete, vota e ganha XP e badges.
          </p>
        </div>

        {/* Active challenges */}
        {activeChallenges.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-6">
              Desafios Ativos
            </h2>
            <div className="space-y-6">
              {activeChallenges.map((challenge) => {
                const badge = STATUS_BADGE[challenge.status];
                return (
                  <Link
                    key={challenge.id}
                    href={`/challenges/${challenge.id}`}
                    className="block group"
                  >
                    <div className="relative bg-surface-container-low border border-primary/20 rounded-lg p-6 md:p-8 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(161,255,194,0.05)]">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            {challenge.xpReward > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-mono text-yellow-400/80">
                                <Star size={12} />+{challenge.xpReward} XP
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors mb-2">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-white/40 line-clamp-2">
                            {challenge.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <ChallengeCountdown endAt={challenge.endAt.toISOString()} />
                          <div className="flex items-center gap-1.5 text-xs font-mono text-white/30">
                            <Users size={14} />
                            {challenge.entryCount}{" "}
                            {challenge.entryCount === 1 ? "entrada" : "entradas"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-4 text-xs font-mono text-primary/60 group-hover:text-primary transition-colors">
                        Participar <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {activeChallenges.length === 0 && pastChallenges.length === 0 && (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 font-mono text-sm">
              Nenhum desafio disponível de momento. Volta em breve!
            </p>
          </div>
        )}

        {/* Past challenges */}
        {pastChallenges.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase text-white/30 tracking-widest mb-6">
              Desafios Anteriores
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pastChallenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="block group"
                >
                  <div className="bg-surface-container-lowest border border-white/5 rounded-lg p-5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-full bg-white/5 text-white/30">
                        Concluído
                      </span>
                      {challenge.xpReward > 0 && (
                        <span className="text-[10px] font-mono text-yellow-400/50">
                          +{challenge.xpReward} XP
                        </span>
                      )}
                    </div>
                    <h3 className="font-headline font-semibold text-white/70 group-hover:text-white transition-colors mb-1">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/20 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {challenge.endAt.toLocaleDateString("pt-PT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        {challenge.entryCount}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
