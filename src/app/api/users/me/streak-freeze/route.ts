import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({
        streakFreezeUsedAt: users.streakFreezeUsedAt,
        streakDays: users.streakDays,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    // Check 30-day cooldown
    if (user.streakFreezeUsedAt) {
      const diffDays = Math.floor(
        (Date.now() - user.streakFreezeUsedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays < 30) {
        const remaining = 30 - diffDays;
        return NextResponse.json(
          {
            error: `Streak freeze disponível em ${remaining} dias`,
            daysRemaining: remaining,
          },
          { status: 429 },
        );
      }
    }

    const now = new Date();

    await db
      .update(users)
      .set({
        streakFreezeUsedAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      message: "Streak congelada com sucesso! A tua streak está protegida por hoje.",
      streakFreezeUsedAt: now.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Erro ao congelar streak" }, { status: 500 });
  }
}
