import { db } from "@/lib/db";
import { users, userBadges, badges, showcaseProjects, blogPosts } from "@/lib/db/schema";
import { eq, and, count, or } from "drizzle-orm";
import { withApiV1Auth, apiV1Response, apiV1Error } from "@/lib/api-v1-middleware";
import type { NextResponse } from "next/server";
import type { ApiV1Context } from "@/lib/api-v1-middleware";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await withApiV1Auth(request);
  if (authResult instanceof Response) return authResult as NextResponse;
  const ctx = authResult as ApiV1Context;

  if (!ctx.scopes.includes("users:read")) {
    return apiV1Error("Missing scope: users:read", 403);
  }

  try {
    const { id } = await params;

    const [user] = await db
      .select({
        id: users.id,
        username: users.discordUsername,
        displayName: users.displayName,
        bio: users.bio,
        websiteUrl: users.websiteUrl,
        image: users.image,
        level: users.level,
        xpPoints: users.xpPoints,
        streakDays: users.streakDays,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isBanned, false)))
      .limit(1);

    if (!user) {
      return apiV1Error("User not found", 404);
    }

    // Fetch badges, project count, and post count in parallel
    const [userBadgesList, [projectCount], [postCount]] = await Promise.all([
      db
        .select({
          name: badges.name,
          slug: badges.slug,
          icon: badges.icon,
          awardedAt: userBadges.awardedAt,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, id)),
      db
        .select({ count: count() })
        .from(showcaseProjects)
        .where(
          and(
            eq(showcaseProjects.authorId, id),
            or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured")),
          ),
        ),
      db
        .select({ count: count() })
        .from(blogPosts)
        .where(and(eq(blogPosts.authorId, id), eq(blogPosts.status, "published"))),
    ]);

    const data = {
      id: user.id,
      displayName: user.displayName || user.username,
      bio: user.bio,
      websiteUrl: user.websiteUrl,
      image: user.image,
      level: user.level,
      xpPoints: user.xpPoints,
      streakDays: user.streakDays,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      badges: userBadgesList,
      projectCount: projectCount?.count ?? 0,
      postCount: postCount?.count ?? 0,
    };

    return apiV1Response(data);
  } catch {
    return apiV1Error("Failed to fetch user profile", 500);
  }
}
