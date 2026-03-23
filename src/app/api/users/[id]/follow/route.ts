import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userFollows, users } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { awardXP } from "@/lib/gamification";

const followLimiter = rateLimit({ interval: 60_000, limit: 30 });

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!followLimiter.check(ip).success) {
    return NextResponse.json({ error: "Demasiados pedidos. Tenta mais tarde." }, { status: 429 });
  }

  const { id: targetUserId } = await context.params;
  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    return NextResponse.json({ error: "Não podes seguir-te a ti próprio." }, { status: 400 });
  }

  // Check target user exists
  const [targetUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  // Check if already following
  const [existing] = await db
    .select()
    .from(userFollows)
    .where(
      and(eq(userFollows.followerId, currentUserId), eq(userFollows.followingId, targetUserId)),
    )
    .limit(1);

  let following: boolean;

  if (existing) {
    // Unfollow
    await db
      .delete(userFollows)
      .where(
        and(eq(userFollows.followerId, currentUserId), eq(userFollows.followingId, targetUserId)),
      );
    following = false;
  } else {
    // Check follower count before this follow (for first_follower XP)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userFollows)
      .where(eq(userFollows.followingId, targetUserId));

    const hadFollowersBefore = (countResult?.count ?? 0) > 0;

    // Follow
    await db.insert(userFollows).values({
      followerId: currentUserId,
      followingId: targetUserId,
    });
    following = true;

    // Award XP for first follower received
    if (!hadFollowersBefore) {
      await awardXP(targetUserId, "first_follower", currentUserId);
    }
  }

  // Get updated follower count
  const [followerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userFollows)
    .where(eq(userFollows.followingId, targetUserId));

  return NextResponse.json({
    following,
    followerCount: followerCount?.count ?? 0,
  });
}
