import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challenges, challengeEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";
import { rateLimit } from "@/lib/rate-limit";

const submitLimiter = rateLimit({ interval: 60_000, limit: 10 });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!submitLimiter.check(ip).success) {
      return NextResponse.json(
        { error: "Muitos pedidos. Tenta novamente em breve." },
        { status: 429 },
      );
    }

    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Get challenge and validate it's active
    const [challenge] = await db
      .select({
        id: challenges.id,
        status: challenges.status,
        endAt: challenges.endAt,
      })
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: "Desafio não encontrado." }, { status: 404 });
    }

    if (challenge.status !== "active") {
      return NextResponse.json(
        { error: "Este desafio não está a aceitar submissões." },
        { status: 400 },
      );
    }

    if (new Date() > challenge.endAt) {
      return NextResponse.json({ error: "O prazo para submissão já expirou." }, { status: 400 });
    }

    // Check if user already submitted
    const [existing] = await db
      .select({ id: challengeEntries.id })
      .from(challengeEntries)
      .where(
        and(
          eq(challengeEntries.challengeId, challengeId),
          eq(challengeEntries.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Já submeteste uma entrada para este desafio." },
        { status: 409 },
      );
    }

    const body = await request.json();
    const { submissionUrl, description } = body;

    if (!submissionUrl || typeof submissionUrl !== "string") {
      return NextResponse.json({ error: "URL de submissão é obrigatório." }, { status: 400 });
    }

    const [entry] = await db
      .insert(challengeEntries)
      .values({
        challengeId,
        userId: session.user.id,
        submissionUrl: String(submissionUrl).slice(0, 500),
        description: description ? String(description) : null,
        status: "submitted",
      })
      .returning();

    // Award XP for challenge entry
    await awardXP(session.user.id, "challenge_entry", String(challengeId));

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao submeter entrada." }, { status: 500 });
  }
}
