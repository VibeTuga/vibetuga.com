import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Star, Clock, Users, ExternalLink, Crown } from "lucide-react";
import { db } from "@/lib/db";
import { challenges, challengeEntries, challengeEntryVotes, users, badges } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { ChallengeCountdown } from "@/components/challenges/ChallengeCountdown";
import { ChallengeEntryForm } from "@/components/challenges/ChallengeEntryForm";
import { EntryVoteButton } from "@/components/challenges/EntryVoteButton";

export const revalidate = 30;

type PageParams = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const challengeId = parseInt(id, 10);
  if (isNaN(challengeId)) return { title: "Desafio | VibeTuga" };

  const [challenge] = await db
    .select({ title: challenges.title, description: challenges.description })
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge) return { title: "Desafio | VibeTuga" };

  const desc = challenge.description.slice(0, 160);

  return {
    title: `${challenge.title} | Desafios VibeTuga`,
    description: desc,
    openGraph: {
      title: `${challenge.title} | Desafios VibeTuga`,
      description: desc,
      type: "website",
    },
  };
}

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

export default async function ChallengeDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id } = await params;
  const challengeId = parseInt(id, 10);
  if (isNaN(challengeId)) notFound();

  const session = await auth();

  const [challenge] = await db
    .select({
      id: challenges.id,
      title: challenges.title,
      description: challenges.description,
      startAt: challenges.startAt,
      endAt: challenges.endAt,
      xpReward: challenges.xpReward,
      badgeRewardId: challenges.badgeRewardId,
      status: challenges.status,
      createdAt: challenges.createdAt,
    })
    .from(challenges)
    .where(eq(challenges.id, challengeId))
    .limit(1);

  if (!challenge) notFound();

  // Get badge info
  let badgeReward: { name: string; icon: string | null } | null = null;
  if (challenge.badgeRewardId) {
    const [badge] = await db
      .select({ name: badges.name, icon: badges.icon })
      .from(badges)
      .where(eq(badges.id, challenge.badgeRewardId))
      .limit(1);
    badgeReward = badge ?? null;
  }

  // Get entries with user info
  const entries = await db
    .select({
      id: challengeEntries.id,
      submissionUrl: challengeEntries.submissionUrl,
      description: challengeEntries.description,
      votesCount: challengeEntries.votesCount,
      status: challengeEntries.status,
      createdAt: challengeEntries.createdAt,
      userId: challengeEntries.userId,
      userDisplayName: users.displayName,
      userImage: users.image,
      userLevel: users.level,
      userDiscordUsername: users.discordUsername,
    })
    .from(challengeEntries)
    .innerJoin(users, eq(challengeEntries.userId, users.id))
    .where(eq(challengeEntries.challengeId, challengeId))
    .orderBy(desc(challengeEntries.votesCount));

  // Check which entries current user has voted on
  let userVotedEntryIds = new Set<number>();
  let userHasSubmitted = false;
  if (session?.user?.id) {
    const votes = await db
      .select({ entryId: challengeEntryVotes.entryId })
      .from(challengeEntryVotes)
      .where(eq(challengeEntryVotes.userId, session.user.id));
    userVotedEntryIds = new Set(votes.map((v) => v.entryId));
    userHasSubmitted = entries.some((e) => e.userId === session.user.id);
  }

  const badge = STATUS_BADGE[challenge.status];
  const canSubmit = challenge.status === "active" && new Date() <= challenge.endAt;
  const canVote = challenge.status === "active" || challenge.status === "voting";

  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/30 mb-8">
          <Link href="/challenges" className="hover:text-primary transition-colors">
            Desafios
          </Link>
          <span>/</span>
          <span className="text-white/50">{challenge.title}</span>
        </div>

        {/* Challenge header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full ${badge.className}`}
            >
              {badge.label}
            </span>
            {challenge.status === "active" && (
              <ChallengeCountdown endAt={challenge.endAt.toISOString()} />
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-headline font-bold text-white mb-4">
            {challenge.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-white/30">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              {challenge.startAt.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}
              {" – "}
              {challenge.endAt.toLocaleDateString("pt-PT", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
            </div>
            {challenge.xpReward > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-400/80">
                <Star size={14} />+{challenge.xpReward} XP para o vencedor
              </div>
            )}
            {badgeReward && (
              <div className="flex items-center gap-1.5 text-purple-400/80">
                <Trophy size={14} />
                Badge: {badgeReward.name}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface-container-lowest border border-white/5 rounded-lg p-6 md:p-8 mb-10">
          <MarkdownContent content={challenge.description} />
        </div>

        {/* Submission form */}
        {canSubmit && session?.user?.id && !userHasSubmitted && (
          <div className="mb-10">
            <ChallengeEntryForm challengeId={challenge.id} />
          </div>
        )}

        {canSubmit && !session?.user?.id && (
          <div className="mb-10 bg-surface-container-lowest border border-white/5 rounded-lg p-6 text-center">
            <p className="text-white/40 text-sm mb-3">Faz login para participar neste desafio.</p>
            <Link
              href="/login"
              className="inline-flex px-5 py-2.5 bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
            >
              Entrar
            </Link>
          </div>
        )}

        {userHasSubmitted && canSubmit && (
          <div className="mb-10 bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-primary text-sm font-mono">
              Já submeteste a tua entrada neste desafio.
            </p>
          </div>
        )}

        {/* Entries */}
        {entries.length > 0 && (
          <section>
            <h2 className="text-sm font-mono uppercase text-primary/80 tracking-widest mb-6">
              Entradas ({entries.length})
            </h2>
            <div className="space-y-4">
              {entries.map((entry, idx) => {
                const isWinner = entry.status === "winner";
                const isOwnEntry = session?.user?.id === entry.userId;
                const hasVoted = userVotedEntryIds.has(entry.id);

                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-4 bg-surface-container-lowest border rounded-lg p-5 ${
                      isWinner ? "border-yellow-500/30 bg-yellow-500/[0.03]" : "border-white/5"
                    }`}
                  >
                    {/* Vote button */}
                    {canVote && session?.user?.id ? (
                      <EntryVoteButton
                        challengeId={challengeId}
                        entryId={entry.id}
                        initialVotesCount={entry.votesCount}
                        initialVoted={hasVoted}
                        disabled={isOwnEntry}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 px-3 py-2 bg-white/5 rounded text-white/30">
                        <span className="text-xs font-mono">{entry.votesCount}</span>
                        <span className="text-[9px] font-mono">votos</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {/* User avatar */}
                        {entry.userImage ? (
                          <Image
                            src={entry.userImage}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-primary">
                            {(entry.userDisplayName ??
                              entry.userDiscordUsername)?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${entry.userId}`}
                            className="text-sm font-headline font-semibold text-white hover:text-primary transition-colors"
                          >
                            {entry.userDisplayName ?? entry.userDiscordUsername}
                          </Link>
                          <span className="text-[10px] font-mono text-white/20">
                            Lv.{entry.userLevel}
                          </span>
                          {isWinner && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400">
                              <Crown size={12} /> Vencedor
                            </span>
                          )}
                          {idx === 0 && !isWinner && entries.length > 1 && (
                            <span className="text-[10px] font-mono text-primary/60">#1</span>
                          )}
                        </div>
                      </div>

                      {entry.description && (
                        <p className="text-sm text-white/50 mb-2">{entry.description}</p>
                      )}

                      <a
                        href={entry.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-primary/70 hover:text-primary transition-colors"
                      >
                        <ExternalLink size={12} />
                        {entry.submissionUrl.length > 60
                          ? `${entry.submissionUrl.slice(0, 60)}...`
                          : entry.submissionUrl}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {entries.length === 0 && challenge.status !== "draft" && (
          <div className="text-center py-12">
            <Users size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm font-mono">
              Ainda ninguém participou. Sê o primeiro!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
