import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { title, slug, excerpt, content, categoryId, tags, coverImage, status, postType } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) {
      updates.content = content;
      updates.readingTimeMinutes = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    }
    if (categoryId !== undefined) updates.categoryId = categoryId || null;
    if (tags !== undefined) updates.tags = tags;
    if (coverImage !== undefined) updates.coverImage = coverImage || null;
    if (status !== undefined) {
      updates.status = status;
      if (status === "published") {
        updates.publishedAt = new Date();
      }
    }
    if (postType !== undefined) updates.postType = postType;

    const [post] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
