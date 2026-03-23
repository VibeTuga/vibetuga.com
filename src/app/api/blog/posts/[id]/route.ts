import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, blogRevisions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logAdminAction, getClientIp } from "@/lib/audit";

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

    // Authors can only edit their own posts
    if (session.user.role === "author") {
      const [existing] = await db
        .select({ authorId: blogPosts.authorId })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);
      if (!existing || existing.authorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      tags,
      coverImage,
      status,
      postType,
      scheduledAt,
    } = body;

    // Save current version as revision before applying edits
    if (title !== undefined || content !== undefined) {
      const [currentPost] = await db
        .select({ title: blogPosts.title, content: blogPosts.content })
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1);

      if (currentPost) {
        const [lastRevision] = await db
          .select({ revisionNumber: blogRevisions.revisionNumber })
          .from(blogRevisions)
          .where(eq(blogRevisions.postId, id))
          .orderBy(desc(blogRevisions.revisionNumber))
          .limit(1);

        const nextRevision = (lastRevision?.revisionNumber ?? 0) + 1;

        await db.insert(blogRevisions).values({
          postId: id,
          title: currentPost.title,
          content: currentPost.content,
          editedBy: session.user.id,
          revisionNumber: nextRevision,
        });
      }
    }

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
    if (scheduledAt !== undefined) {
      updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }

    const [post] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Audit log status changes by admin/moderator
    if (status !== undefined && ["admin", "moderator"].includes(session.user.role)) {
      const statusActions: Record<string, string> = {
        published: "post_approved",
        draft: "post_status_draft",
        archived: "post_status_archived",
        pending_review: "post_status_pending",
      };
      const action = statusActions[status] ?? `post_status_${status}`;
      const ip = getClientIp(request);
      logAdminAction({
        actorId: session.user.id,
        action,
        targetType: "post",
        targetId: id,
        details: { title: post.title, status },
        ipAddress: ip,
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      .returning({ id: blogPosts.id, title: blogPosts.title });

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const ip = getClientIp(request);
    logAdminAction({
      actorId: session.user.id,
      action: "post_deleted",
      targetType: "post",
      targetId: id,
      details: { title: deleted.title },
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
