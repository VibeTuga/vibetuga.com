import type { Metadata } from "next";
import { db } from "@/lib/db";
import { challenges, challengeEntries, badges } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ChallengesManager } from "@/components/admin/ChallengesManager";

export const metadata: Metadata = {
  title: "Desafios | Admin VibeTuga",
};

export default async function AdminChallengesPage() {
  const rows = await db
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
      entryCount: sql<number>`cast(count(${challengeEntries.id}) as int)`,
    })
    .from(challenges)
    .leftJoin(challengeEntries, eq(challenges.id, challengeEntries.challengeId))
    .groupBy(challenges.id)
    .orderBy(desc(challenges.createdAt));

  const allBadges = await db
    .select({ id: badges.id, name: badges.name, icon: badges.icon })
    .from(badges);

  return (
    <div>
      <h1 className="text-2xl font-headline font-bold text-white mb-8">Gestão de Desafios</h1>
      <ChallengesManager initialChallenges={JSON.parse(JSON.stringify(rows))} badges={allBadges} />
    </div>
  );
}
