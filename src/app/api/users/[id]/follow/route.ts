import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userFollows } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";
import { rateLimit } from "@/lib/rate-limit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

const limiter = rateLimit({ interval: 60 * 1000, limit: 30 });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: targetUserId } = await params;
  const followerId = session.user.id;

  if (followerId === targetUserId) {
    return NextResponse.json({ error: "Não podes seguir-te a ti mesmo." }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(userFollows)
      .where(and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, targetUserId)))
      .limit(1);

    if (existing.length > 0) {
      // Unfollow
      await db
        .delete(userFollows)
        .where(
          and(eq(userFollows.followerId, followerId), eq(userFollows.followingId, targetUserId)),
        );

      return NextResponse.json({ following: false });
    }

    // Follow
    await db.insert(userFollows).values({
      followerId,
      followingId: targetUserId,
    });

    // Check if this is the first follower the target user ever gets
    const [followerCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(userFollows)
      .where(eq(userFollows.followingId, targetUserId));

    if (followerCount.count === 1) {
      await awardXP(targetUserId, "first_follower", followerId);
    }

    createNotification({
      userId: targetUserId,
      type: NOTIFICATION_TYPES.NEW_FOLLOWER,
      title: "Novo seguidor",
      body: "Alguém começou a seguir-te.",
      link: `/profile/${followerId}`,
      actorId: followerId,
      referenceId: followerId,
    }).catch(() => null);

    return NextResponse.json({ following: true });
  } catch {
    return NextResponse.json({ error: "Erro ao processar o pedido." }, { status: 500 });
  }
}
