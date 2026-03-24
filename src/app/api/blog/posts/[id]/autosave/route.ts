import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    const [existing] = await db
      .select({ authorId: blogPosts.authorId })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Authors can only autosave their own posts
    if (session.user.role === "author" && existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json({ error: "Title or content required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    // Silently update without changing updatedAt
    await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Falha ao guardar automaticamente" }, { status: 500 });
  }
}
