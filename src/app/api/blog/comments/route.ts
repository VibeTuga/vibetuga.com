import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogComments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, parentId, content } = body;

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: "postId and content are required" }, { status: 400 });
    }

    if (content.trim().length > 5000) {
      return NextResponse.json({ error: "Comment too long (max 5000 chars)" }, { status: 400 });
    }

    const [comment] = await db
      .insert(blogComments)
      .values({
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
        content: content.trim(),
      })
      .returning();

    await awardXP(session.user.id, "blog_comment", postId).catch(() => null);

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
