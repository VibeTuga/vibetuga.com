import { db } from "@/lib/db";
import { users, xpEvents, badges, userBadges, levels } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

// ─── XP Action Constants ────────────────────────────────────

export const XP_VALUES = {
  blog_post_published: 50,
  blog_comment: 5,
  project_submitted: 30,
  project_featured: 100,
  product_sold: 20,
  product_reviewed: 10,
  daily_login: 5,
  streak_7_days: 50,
  streak_30_days: 200,
  referred_user: 25,
  community_helper: 15,
} as const;

export type XpAction = keyof typeof XP_VALUES;

// ─── Level Calculation ──────────────────────────────────────

async function calculateLevel(xpPoints: number): Promise<number> {
  const allLevels = await db
    .select({ level: levels.level, xpRequired: levels.xpRequired })
    .from(levels)
    .orderBy(sql`${levels.xpRequired} DESC`);

  for (const lvl of allLevels) {
    if (xpPoints >= lvl.xpRequired) {
      return lvl.level;
    }
  }

  return 1;
}

// ─── Award XP ───────────────────────────────────────────────

export async function awardXP(
  userId: string,
  action: XpAction,
  referenceId?: string,
): Promise<void> {
  const xpAmount = XP_VALUES[action];

  await db.insert(xpEvents).values({
    userId,
    action,
    xpAmount,
    referenceId: referenceId ?? null,
  });

  const [updated] = await db
    .update(users)
    .set({ xpPoints: sql`${users.xpPoints} + ${xpAmount}` })
    .where(eq(users.id, userId))
    .returning({ xpPoints: users.xpPoints });

  if (!updated) return;

  const newLevel = await calculateLevel(updated.xpPoints);

  await db.update(users).set({ level: newLevel }).where(eq(users.id, userId));

  await checkAndAwardBadges(userId);
}

// ─── Check And Award Badges ──────────────────────────────────

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const allBadges = await db.select({ id: badges.id, slug: badges.slug }).from(badges);

  if (allBadges.length === 0) return;

  const earnedBadgeIds = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  const earnedSet = new Set(earnedBadgeIds.map((b) => b.badgeId));
  const unearnedBadges = allBadges.filter((b) => !earnedSet.has(b.id));

  if (unearnedBadges.length === 0) return;

  const [user] = await db
    .select({
      xpPoints: users.xpPoints,
      level: users.level,
      streakDays: users.streakDays,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return;

  const commentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.action, "blog_comment")));

  const projectCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.action, "project_submitted")));

  const postCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.action, "blog_post_published")));

  const stats = {
    xpPoints: user.xpPoints,
    level: user.level,
    streakDays: user.streakDays,
    comments: Number(commentCount[0]?.count ?? 0),
    projects: Number(projectCount[0]?.count ?? 0),
    posts: Number(postCount[0]?.count ?? 0),
  };

  const toAward: string[] = [];

  for (const badge of unearnedBadges) {
    if (qualifiesForBadge(badge.slug, stats)) {
      toAward.push(badge.id);
    }
  }

  if (toAward.length > 0) {
    await db.insert(userBadges).values(toAward.map((badgeId) => ({ userId, badgeId })));
  }
}

// ─── Badge Qualification Logic ───────────────────────────────

interface UserStats {
  xpPoints: number;
  level: number;
  streakDays: number;
  comments: number;
  projects: number;
  posts: number;
}

function qualifiesForBadge(slug: string, stats: UserStats): boolean {
  switch (slug) {
    case "first-post":
      return stats.posts >= 1;
    case "first-project":
      return stats.projects >= 1;
    case "streak-7":
      return stats.streakDays >= 7;
    case "streak-30":
      return stats.streakDays >= 30;
    case "helpful":
      return stats.comments >= 10;
    case "level-5":
      return stats.level >= 5;
    case "level-10":
      return stats.level >= 10;
    default:
      return false;
  }
}
