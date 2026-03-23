import { cache } from "react";
import { db } from "@/lib/db";
import { users, xpEvents, blogComments, blogPosts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { LEVEL_XP, getLevelName } from "./profile";

export const XP_ACTION_LABELS: Record<string, string> = {
  blog_post_published: "Post publicado",
  blog_comment: "Comentário no blog",
  project_submitted: "Projeto submetido",
  project_featured: "Projeto em destaque",
  product_sold: "Produto vendido",
  product_reviewed: "Review de produto",
  daily_login: "Login diário",
  streak_7_days: "Streak de 7 dias",
  streak_30_days: "Streak de 30 dias",
  referred_user: "Utilizador referido",
  community_helper: "Ajudante da comunidade",
};

export function getXpActionLabel(action: string): string {
  return XP_ACTION_LABELS[action] ?? action;
}

export const getUserDashboardActivity = cache(async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      discordUsername: users.discordUsername,
      image: users.image,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      streakDays: users.streakDays,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [recentXpEvents, recentCommentsOnPosts] = await Promise.all([
    // Last 20 XP events for the user
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
      .limit(20),

    // Last 10 comments on user's blog posts (by other users)
    db
      .select({
        commentId: blogComments.id,
        commentContent: blogComments.content,
        commentCreatedAt: blogComments.createdAt,
        postId: blogPosts.id,
        postTitle: blogPosts.title,
        postSlug: blogPosts.slug,
        commenterId: users.id,
        commenterName: users.displayName,
        commenterDiscordUsername: users.discordUsername,
        commenterImage: users.image,
      })
      .from(blogComments)
      .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
      .innerJoin(users, eq(blogComments.authorId, users.id))
      .where(
        and(
          eq(blogPosts.authorId, userId),
          // Exclude user's own comments on their own posts
        ),
      )
      .orderBy(desc(blogComments.createdAt))
      .limit(10),
  ]);

  // Calculate XP progress to next level
  const currentLevelXp = LEVEL_XP[user.level] ?? 0;
  const nextLevelXp = LEVEL_XP[user.level + 1] ?? null;
  const levelName = getLevelName(user.level);

  return {
    user,
    levelName,
    currentLevelXp,
    nextLevelXp,
    recentXpEvents,
    recentCommentsOnPosts,
  };
});

export type DashboardActivity = NonNullable<Awaited<ReturnType<typeof getUserDashboardActivity>>>;
export type DashboardXpEvent = DashboardActivity["recentXpEvents"][number];
export type DashboardComment = DashboardActivity["recentCommentsOnPosts"][number];
