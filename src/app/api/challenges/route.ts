import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challenges, challengeEntries, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function GET(request: NextRequest) {
  if (!(await isFeatureEnabled("challenges_enabled"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const conditions = status
      ? [eq(challenges.status, status as "draft" | "active" | "voting" | "completed")]
      : [];

    const rows = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        startAt: challenges.startAt,
        endAt: challenges.endAt,
        xpReward: challenges.xpReward,
        badgeRewardId: challenges.badgeRewardId,
        status: challenges.status,
        createdAt: challenges.createdAt,
        entryCount: sql<number>`cast(count(${challengeEntries.id}) as int)`,
      })
      .from(challenges)
      .leftJoin(challengeEntries, eq(challenges.id, challengeEntries.challengeId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(challenges.id)
      .orderBy(desc(challenges.startAt));

    return NextResponse.json({ challenges: rows });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar desafios." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isFeatureEnabled("challenges_enabled"))) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    }

    // Admin only
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar desafios." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startAt,
      endAt,
      xpReward,
      badgeRewardId,
      status: challengeStatus,
    } = body;

    if (!title || !description || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Título, descrição e datas são obrigatórios." },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(challenges)
      .values({
        title: String(title).slice(0, 200),
        description: String(description),
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        xpReward: xpReward ? Number(xpReward) : 0,
        badgeRewardId: badgeRewardId || null,
        status: challengeStatus || "draft",
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ challenge: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar desafio." }, { status: 500 });
  }
}
