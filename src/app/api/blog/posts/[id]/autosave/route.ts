import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogRevisions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "author"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
    }

    // Verify post exists and user has access
    const [post] = await db
      .select({ authorId: blogPosts.authorId, title: blogPosts.title, content: blogPosts.content })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Authors can only autosave their own posts
    if (session.user.role === "author" && post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Skip if nothing changed
    if (post.title === title && post.content === content) {
      return NextResponse.json({ skipped: true, message: "Sem alterações" });
    }

    // Get next revision number
    const [lastRevision] = await db
      .select({ revisionNumber: blogRevisions.revisionNumber })
      .from(blogRevisions)
      .where(eq(blogRevisions.postId, id))
      .orderBy(desc(blogRevisions.revisionNumber))
      .limit(1);

    const nextRevision = (lastRevision?.revisionNumber ?? 0) + 1;

    // Save current state as a revision (autosave)
    await db.insert(blogRevisions).values({
      postId: id,
      title: post.title,
      content: post.content,
      editedBy: session.user.id,
      revisionNumber: nextRevision,
    });

    // Update the post with new content
    await db
      .update(blogPosts)
      .set({ title, content, updatedAt: new Date() })
      .where(eq(blogPosts.id, id));

    return NextResponse.json({ saved: true, revisionNumber: nextRevision });
  } catch {
    return NextResponse.json({ error: "Erro ao guardar automaticamente" }, { status: 500 });
  }
}
