import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogComments, users } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;

    const allComments = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        parentId: blogComments.parentId,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
        authorId: blogComments.authorId,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
        authorRole: users.role,
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.authorId, users.id))
      .where(and(eq(blogComments.postId, postId), eq(blogComments.isApproved, true)))
      .orderBy(asc(blogComments.createdAt));

    // Build threaded tree (max 3 levels)
    type Comment = (typeof allComments)[number] & { children: Comment[] };
    const commentMap = new Map<string, Comment>();
    const roots: Comment[] = [];

    for (const c of allComments) {
      commentMap.set(c.id, { ...c, children: [] });
    }

    for (const c of allComments) {
      const node = commentMap.get(c.id)!;
      if (!c.parentId) {
        roots.push(node);
      } else {
        const parent = commentMap.get(c.parentId);
        if (parent) {
          // Max 3 levels: if parent already has a parentId and that parent also has a parentId,
          // attach to grandparent instead
          let target = parent;
          let depth = 1;
          let cursor = parent;
          while (cursor.parentId && depth < 2) {
            const ancestor = commentMap.get(cursor.parentId);
            if (ancestor) {
              target = ancestor;
              cursor = ancestor;
              depth++;
            } else {
              break;
            }
          }
          if (depth >= 2 && cursor.parentId) {
            // Already at max depth, attach to the deepest allowed parent
            target.children.push(node);
          } else {
            parent.children.push(node);
          }
        } else {
          roots.push(node);
        }
      }
    }

    return NextResponse.json(roots);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
