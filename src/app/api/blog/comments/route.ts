import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogComments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60 * 1000, limit: 10 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

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
