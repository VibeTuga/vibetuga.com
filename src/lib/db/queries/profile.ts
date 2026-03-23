import { cache } from "react";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  blogCategories,
  showcaseProjects,
  xpEvents,
  badges,
  userBadges,
  userFollows,
} from "@/lib/db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";

export const LEVEL_NAMES: Record<number, string> = {
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

export const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 2000,
  7: 4000,
  8: 8000,
  9: 15000,
  10: 30000,
};

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? `LVL ${level}`;
}

export function getLevelXpRange(level: number): { current: number; next: number | null } {
  return {
    current: LEVEL_XP[level] ?? 0,
    next: LEVEL_XP[level + 1] ?? null,
  };
}

export const getUserProfile = cache(async (userId: string, sessionUserId?: string | null) => {
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      discordUsername: users.discordUsername,
      image: users.image,
      bio: users.bio,
      websiteUrl: users.websiteUrl,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      streakDays: users.streakDays,
      createdAt: users.createdAt,
      isBanned: users.isBanned,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [
    allBadges,
    earnedBadges,
    posts,
    projects,
    recentXpEvents,
    followerCountResult,
    followingCountResult,
    isFollowingResult,
  ] = await Promise.all([
    db
      .select({
        id: badges.id,
        name: badges.name,
        slug: badges.slug,
        description: badges.description,
        icon: badges.icon,
        xpReward: badges.xpReward,
      })
      .from(badges)
      .orderBy(badges.name),

    db
      .select({
        badgeId: userBadges.badgeId,
        awardedAt: userBadges.awardedAt,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId)),

    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        postType: blogPosts.postType,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        categoryName: blogCategories.name,
        categoryColor: blogCategories.color,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(and(eq(blogPosts.authorId, userId), eq(blogPosts.status, "published")))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(5),

    db
      .select({
        id: showcaseProjects.id,
        title: showcaseProjects.title,
        slug: showcaseProjects.slug,
        description: showcaseProjects.description,
        coverImage: showcaseProjects.coverImage,
        techStack: showcaseProjects.techStack,
        aiToolsUsed: showcaseProjects.aiToolsUsed,
        status: showcaseProjects.status,
        votesCount: showcaseProjects.votesCount,
        liveUrl: showcaseProjects.liveUrl,
        repoUrl: showcaseProjects.repoUrl,
        createdAt: showcaseProjects.createdAt,
      })
      .from(showcaseProjects)
      .where(
        and(
          eq(showcaseProjects.authorId, userId),
          or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured")),
        ),
      )
      .orderBy(desc(showcaseProjects.createdAt))
      .limit(5),

    db
      .select({
        id: xpEvents.id,
        action: xpEvents.action,
        xpAmount: xpEvents.xpAmount,
        createdAt: xpEvents.createdAt,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId))
      .orderBy(desc(xpEvents.createdAt))
      .limit(10),

    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId)),

    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId)),

    sessionUserId
      ? db
          .select({ followerId: userFollows.followerId })
          .from(userFollows)
          .where(
            and(eq(userFollows.followerId, sessionUserId), eq(userFollows.followingId, userId)),
          )
          .limit(1)
      : Promise.resolve([]),
  ]);

  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));
  const earnedBadgeMap = new Map(earnedBadges.map((b) => [b.badgeId, b.awardedAt]));

  const badgesWithStatus = allBadges.map((badge) => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
    awardedAt: earnedBadgeMap.get(badge.id) ?? null,
  }));

  return {
    user,
    badges: badgesWithStatus,
    posts,
    projects,
    recentXpEvents,
    followerCount: followerCountResult[0]?.count ?? 0,
    followingCount: followingCountResult[0]?.count ?? 0,
    isFollowing: isFollowingResult.length > 0,
  };
});

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;
export type ProfilePost = UserProfile["posts"][number];
export type ProfileProject = UserProfile["projects"][number];
export type ProfileBadge = UserProfile["badges"][number];
