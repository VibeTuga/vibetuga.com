import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPostLikes, blogPosts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60 * 1000, limit: 30 });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: postId } = await params;
    const userId = session.user.id;

    // Check if already liked
    const existing = await db
      .select()
      .from(blogPostLikes)
      .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      // Unlike
      await db
        .delete(blogPostLikes)
        .where(and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)));

      await db
        .update(blogPosts)
        .set({ likesCount: sql`GREATEST(${blogPosts.likesCount} - 1, 0)` })
        .where(eq(blogPosts.id, postId));

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.insert(blogPostLikes).values({ postId, userId });

      await db
        .update(blogPosts)
        .set({ likesCount: sql`${blogPosts.likesCount} + 1` })
        .where(eq(blogPosts.id, postId));

      return NextResponse.json({ liked: true });
    }
  } catch {
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
