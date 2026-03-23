import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challengeEntries, challengeEntryVotes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const voteLimiter = rateLimit({ interval: 60_000, limit: 30 });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!voteLimiter.check(ip).success) {
      return NextResponse.json(
        { error: "Muitos pedidos. Tenta novamente em breve." },
        { status: 429 },
      );
    }

    const { entryId } = await params;
    const entryIdNum = parseInt(entryId, 10);
    if (isNaN(entryIdNum)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    // Get entry
    const [entry] = await db
      .select({
        id: challengeEntries.id,
        userId: challengeEntries.userId,
        votesCount: challengeEntries.votesCount,
      })
      .from(challengeEntries)
      .where(eq(challengeEntries.id, entryIdNum))
      .limit(1);

    if (!entry) {
      return NextResponse.json({ error: "Entrada não encontrada." }, { status: 404 });
    }

    // Cannot vote on own entry
    if (entry.userId === session.user.id) {
      return NextResponse.json(
        { error: "Não podes votar na tua própria entrada." },
        { status: 403 },
      );
    }

    // Check existing vote
    const [existingVote] = await db
      .select({ entryId: challengeEntryVotes.entryId })
      .from(challengeEntryVotes)
      .where(
        and(
          eq(challengeEntryVotes.entryId, entryIdNum),
          eq(challengeEntryVotes.userId, session.user.id),
        ),
      )
      .limit(1);

    let voted: boolean;

    if (existingVote) {
      // Remove vote (toggle off)
      await db
        .delete(challengeEntryVotes)
        .where(
          and(
            eq(challengeEntryVotes.entryId, entryIdNum),
            eq(challengeEntryVotes.userId, session.user.id),
          ),
        );

      await db
        .update(challengeEntries)
        .set({ votesCount: sql`${challengeEntries.votesCount} - 1` })
        .where(eq(challengeEntries.id, entryIdNum));

      voted = false;
    } else {
      // Add vote
      await db.insert(challengeEntryVotes).values({
        entryId: entryIdNum,
        userId: session.user.id,
      });

      await db
        .update(challengeEntries)
        .set({ votesCount: sql`${challengeEntries.votesCount} + 1` })
        .where(eq(challengeEntries.id, entryIdNum));

      voted = true;
    }

    // Fetch updated count
    const [updated] = await db
      .select({ votesCount: challengeEntries.votesCount })
      .from(challengeEntries)
      .where(eq(challengeEntries.id, entryIdNum))
      .limit(1);

    return NextResponse.json({
      voted,
      votesCount: updated?.votesCount ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao votar." }, { status: 500 });
  }
}
