import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getRevisions, restoreRevision } from "@/lib/db/queries/revisions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "author"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Authors can only see revisions for their own posts
    if (session.user.role === "author") {
      const [post] = await db
        .select({ authorId: blogPosts.authorId })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);
      if (!post || post.authorId !== session.user.id) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      }
    }

    const revisions = await getRevisions(id);
    return NextResponse.json(revisions);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar revisões" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "author"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { id } = await params;

    // Authors can only restore revisions for their own posts
    if (session.user.role === "author") {
      const [post] = await db
        .select({ authorId: blogPosts.authorId })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);
      if (!post || post.authorId !== session.user.id) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { revisionId } = body;

    if (!revisionId || typeof revisionId !== "number") {
      return NextResponse.json({ error: "revisionId é obrigatório" }, { status: 400 });
    }

    const restored = await restoreRevision(id, revisionId, session.user.id);

    if (!restored) {
      return NextResponse.json({ error: "Revisão não encontrada" }, { status: 404 });
    }

    return NextResponse.json(restored);
  } catch {
    return NextResponse.json({ error: "Erro ao restaurar revisão" }, { status: 500 });
  }
}
