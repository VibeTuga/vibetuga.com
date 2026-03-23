import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userFollows, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  try {
    const [followers, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          discordUsername: users.discordUsername,
          displayName: users.displayName,
          image: users.image,
          level: users.level,
          isVerified: users.isVerified,
        })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followerId, users.id))
        .where(eq(userFollows.followingId, userId))
        .orderBy(userFollows.createdAt)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(userFollows)
        .where(eq(userFollows.followingId, userId)),
    ]);

    return NextResponse.json({
      followers,
      total: totalResult[0]?.count ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar seguidores." }, { status: 500 });
  }
}
