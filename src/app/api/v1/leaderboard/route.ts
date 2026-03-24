import { db } from "@/lib/db";
import { users, userBadges } from "@/lib/db/schema";
import { desc, count, eq } from "drizzle-orm";
import { withApiV1Auth, apiV1Response, apiV1Error } from "@/lib/api-v1-middleware";
import type { NextResponse } from "next/server";
import type { ApiV1Context } from "@/lib/api-v1-middleware";

export async function GET(request: Request) {
  const authResult = await withApiV1Auth(request);
  if (authResult instanceof Response) return authResult as NextResponse;
  const ctx = authResult as ApiV1Context;

  if (!ctx.scopes.includes("leaderboard:read")) {
    return apiV1Error("Missing scope: leaderboard:read", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "25", 10)), 100);

    const leaderboard = await db
      .select({
        id: users.id,
        username: users.discordUsername,
        displayName: users.displayName,
        level: users.level,
        xpPoints: users.xpPoints,
        image: users.image,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.isBanned, false))
      .orderBy(desc(users.xpPoints))
      .limit(limit);

    // Get badge counts for these users
    const userIds = leaderboard.map((u) => u.id);
    const badgeCounts =
      userIds.length > 0
        ? await db
            .select({
              userId: userBadges.userId,
              count: count(),
            })
            .from(userBadges)
            .groupBy(userBadges.userId)
        : [];

    const badgeMap = new Map(badgeCounts.map((b) => [b.userId, b.count]));

    const data = leaderboard.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.displayName || user.username,
      level: user.level,
      xpPoints: user.xpPoints,
      badgesCount: badgeMap.get(user.id) ?? 0,
      image: user.image,
      isVerified: user.isVerified,
    }));

    return apiV1Response(data);
  } catch {
    return apiV1Error("Failed to fetch leaderboard", 500);
  }
}
