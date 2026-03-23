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

    // Build threaded tree (max 3 levels: root=0, reply=1, reply-to-reply=2)
    type Comment = (typeof allComments)[number] & { children: Comment[] };
    const commentMap = new Map<string, Comment>();
    const depthMap = new Map<string, number>();
    const roots: Comment[] = [];

    for (const c of allComments) {
      commentMap.set(c.id, { ...c, children: [] });
    }

    for (const c of allComments) {
      const node = commentMap.get(c.id)!;
      if (!c.parentId) {
        roots.push(node);
        depthMap.set(c.id, 0);
      } else {
        const parent = commentMap.get(c.parentId);
        if (parent) {
          const parentDepth = depthMap.get(c.parentId) ?? 0;
          if (parentDepth < 2) {
            // Attach to parent (depth 0 or 1)
            parent.children.push(node);
            depthMap.set(c.id, parentDepth + 1);
          } else {
            // Max depth reached — attach to parent but don't increase depth
            parent.children.push(node);
            depthMap.set(c.id, parentDepth);
          }
        } else {
          roots.push(node);
          depthMap.set(c.id, 0);
        }
      }
    }

    return NextResponse.json(roots);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
