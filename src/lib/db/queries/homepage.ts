import { cache } from "react";
import { db } from "@/lib/db";
import { users, blogPosts, blogCategories, showcaseProjects } from "@/lib/db/schema";
import { eq, desc, or, sql } from "drizzle-orm";

export const getHomepageStats = cache(async () => {
  try {
    const [membersResult, projectsResult, postsResult, xpResult] = await Promise.all([
      db.select({ value: sql<number>`count(*)::int` }).from(users),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(showcaseProjects)
        .where(
          or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured")),
        ),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(eq(blogPosts.status, "published")),
      db.select({ value: sql<number>`coalesce(sum(xp_points), 0)::int` }).from(users),
    ]);

    return {
      totalMembers: membersResult[0]?.value ?? 0,
      totalProjects: projectsResult[0]?.value ?? 0,
      totalPosts: postsResult[0]?.value ?? 0,
      totalXP: xpResult[0]?.value ?? 0,
    };
  } catch {
    return { totalMembers: 0, totalProjects: 0, totalPosts: 0, totalXP: 0 };
  }
});

export const getHomepageFeaturedProjects = cache(async (limit = 4) => {
  try {
    return await db
      .select({
        id: showcaseProjects.id,
        title: showcaseProjects.title,
        slug: showcaseProjects.slug,
        description: showcaseProjects.description,
        coverImage: showcaseProjects.coverImage,
        techStack: showcaseProjects.techStack,
        aiToolsUsed: showcaseProjects.aiToolsUsed,
        votesCount: showcaseProjects.votesCount,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
      })
      .from(showcaseProjects)
      .leftJoin(users, eq(showcaseProjects.authorId, users.id))
      .where(or(eq(showcaseProjects.status, "featured"), eq(showcaseProjects.status, "approved")))
      .orderBy(desc(showcaseProjects.votesCount), desc(showcaseProjects.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
});

export const getHomepageLatestPosts = cache(async (limit = 3) => {
  try {
    return await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewsCount: blogPosts.viewsCount,
        publishedAt: blogPosts.publishedAt,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
  } catch {
    return [];
  }
});

export const getHomepageLeaderboard = cache(async (limit = 5) => {
  try {
    return await db
      .select({
        id: users.id,
        discordUsername: users.discordUsername,
        displayName: users.displayName,
        image: users.image,
        xpPoints: users.xpPoints,
        level: users.level,
      })
      .from(users)
      .orderBy(desc(users.xpPoints))
      .limit(limit);
  } catch {
    return [];
  }
});

export type HomepageStats = Awaited<ReturnType<typeof getHomepageStats>>;
export type HomepageFeaturedProject = Awaited<
  ReturnType<typeof getHomepageFeaturedProjects>
>[number];
export type HomepageLatestPost = Awaited<ReturnType<typeof getHomepageLatestPosts>>[number];
export type HomepageLeaderboardEntry = Awaited<ReturnType<typeof getHomepageLeaderboard>>[number];
