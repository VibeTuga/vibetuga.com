import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userFollows, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const PAGE_SIZE = 20;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id: userId } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const [followers, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        displayName: users.displayName,
        discordUsername: users.discordUsername,
        image: users.image,
        level: users.level,
        isVerified: users.isVerified,
        followedAt: userFollows.createdAt,
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId)),
  ]);

  return NextResponse.json({
    followers,
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}
