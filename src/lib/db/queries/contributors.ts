import { cache } from "react";
import { db } from "@/lib/db";
import { users, badges, userBadges, xpEvents } from "@/lib/db/schema";
import { eq, and, sql, desc, gte, or, inArray } from "drizzle-orm";

// ─── Get contributors (verified users or users with contributor badge) ────────

export const getContributors = cache(async () => {
  // First find the contributor badge id
  const [contributorBadge] = await db
    .select({ id: badges.id })
    .from(badges)
    .where(eq(badges.slug, "contributor"))
    .limit(1);

  const contributorBadgeId = contributorBadge?.id;

  // Get users who have the contributor badge
  let badgeUserIds: string[] = [];
  if (contributorBadgeId) {
    const badgeUsers = await db
      .select({ userId: userBadges.userId })
      .from(userBadges)
      .where(eq(userBadges.badgeId, contributorBadgeId));
    badgeUserIds = badgeUsers.map((b) => b.userId);
  }

  // Build WHERE: isVerified = true OR userId in badgeUserIds
  const conditions =
    badgeUserIds.length > 0
      ? or(eq(users.isVerified, true), inArray(users.id, badgeUserIds))
      : eq(users.isVerified, true);

  const contributorBadgeCount = sql<number>`cast(count(distinct ${userBadges.badgeId}) as int)`;

  const result = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      image: users.image,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
      badgeCount: contributorBadgeCount,
    })
    .from(users)
    .leftJoin(userBadges, eq(userBadges.userId, users.id))
    .where(and(conditions, eq(users.isBanned, false)))
    .groupBy(users.id)
    .orderBy(desc(users.xpPoints));

  return result;
});

// ─── Get monthly highlights (top 3 by XP earned this month) ──────────────────

export const getMonthlyHighlights = cache(async () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await db
    .select({
      userId: xpEvents.userId,
      totalXp: sql<number>`cast(sum(${xpEvents.xpAmount}) as int)`,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      image: users.image,
      level: users.level,
      isVerified: users.isVerified,
    })
    .from(xpEvents)
    .innerJoin(users, eq(users.id, xpEvents.userId))
    .where(and(gte(xpEvents.createdAt, monthStart), eq(users.isBanned, false)))
    .groupBy(xpEvents.userId, users.id)
    .orderBy(desc(sql`sum(${xpEvents.xpAmount})`))
    .limit(3);

  return result;
});

// ─── Admin: get all users with contributor/verified status + badge info ───────

export const getAdminContributors = cache(async () => {
  const [contributorBadge, monthlyStarBadge] = await Promise.all([
    db.select({ id: badges.id }).from(badges).where(eq(badges.slug, "contributor")).limit(1),
    db.select({ id: badges.id }).from(badges).where(eq(badges.slug, "monthly-star")).limit(1),
  ]);

  const contributorBadgeId = contributorBadge[0]?.id ?? null;
  const monthlyStarBadgeId = monthlyStarBadge[0]?.id ?? null;

  const allUsers = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      image: users.image,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      isVerified: users.isVerified,
      isBanned: users.isBanned,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.xpPoints));

  // Get all user badges for contributor and monthly-star
  const badgeIds = [contributorBadgeId, monthlyStarBadgeId].filter(
    (id): id is string => id !== null,
  );

  const userBadgeMap: Map<string, Set<string>> = new Map();
  if (badgeIds.length > 0) {
    const ubs = await db
      .select({
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
      })
      .from(userBadges)
      .where(inArray(userBadges.badgeId, badgeIds));

    for (const ub of ubs) {
      if (!userBadgeMap.has(ub.userId)) {
        userBadgeMap.set(ub.userId, new Set());
      }
      userBadgeMap.get(ub.userId)!.add(ub.badgeId);
    }
  }

  return {
    users: allUsers.map((u) => ({
      ...u,
      hasContributorBadge: contributorBadgeId
        ? (userBadgeMap.get(u.id)?.has(contributorBadgeId) ?? false)
        : false,
      hasMonthlyStarBadge: monthlyStarBadgeId
        ? (userBadgeMap.get(u.id)?.has(monthlyStarBadgeId) ?? false)
        : false,
    })),
    contributorBadgeId,
    monthlyStarBadgeId,
  };
});

export type Contributor = Awaited<ReturnType<typeof getContributors>>[number];
export type MonthlyHighlight = Awaited<ReturnType<typeof getMonthlyHighlights>>[number];
