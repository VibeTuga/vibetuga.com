import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projectVotes, showcaseProjects } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const voteLimiter = rateLimit({ interval: 60_000, limit: 30 });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: projectId } = await params;

    const body = await request.json();
    const { voteType } = body;

    if (voteType !== "up" && voteType !== "down") {
      return NextResponse.json({ error: "Tipo de voto inválido." }, { status: 400 });
    }

    // Get the project to check ownership
    const [project] = await db
      .select({
        id: showcaseProjects.id,
        authorId: showcaseProjects.authorId,
        votesCount: showcaseProjects.votesCount,
      })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }

    if (project.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Não podes votar no teu próprio projeto." },
        { status: 403 },
      );
    }

    // Check existing vote
    const [existingVote] = await db
      .select({
        id: projectVotes.id,
        voteType: projectVotes.voteType,
      })
      .from(projectVotes)
      .where(and(eq(projectVotes.projectId, projectId), eq(projectVotes.userId, session.user.id)))
      .limit(1);

    let voted: boolean;
    let resultVoteType: string | null;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote type — toggle off (remove vote)
        await db.delete(projectVotes).where(eq(projectVotes.id, existingVote.id));

        const delta = voteType === "up" ? -1 : 1;
        await db
          .update(showcaseProjects)
          .set({ votesCount: sql`${showcaseProjects.votesCount} + ${delta}` })
          .where(eq(showcaseProjects.id, projectId));

        voted = false;
        resultVoteType = null;
      } else {
        // Different vote type — switch vote
        await db
          .update(projectVotes)
          .set({ voteType, createdAt: new Date() })
          .where(eq(projectVotes.id, existingVote.id));

        // Net change is +2 or -2 (removing old + adding new)
        const delta = voteType === "up" ? 2 : -2;
        await db
          .update(showcaseProjects)
          .set({ votesCount: sql`${showcaseProjects.votesCount} + ${delta}` })
          .where(eq(showcaseProjects.id, projectId));

        voted = true;
        resultVoteType = voteType;
      }
    } else {
      // No existing vote — insert new vote
      await db.insert(projectVotes).values({
        projectId,
        userId: session.user.id,
        voteType,
      });

      const delta = voteType === "up" ? 1 : -1;
      await db
        .update(showcaseProjects)
        .set({ votesCount: sql`${showcaseProjects.votesCount} + ${delta}` })
        .where(eq(showcaseProjects.id, projectId));

      voted = true;
      resultVoteType = voteType;
    }

    // Fetch updated count
    const [updated] = await db
      .select({ votesCount: showcaseProjects.votesCount })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.id, projectId))
      .limit(1);

    return NextResponse.json({
      voted,
      voteType: resultVoteType,
      votesCount: updated?.votesCount ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
