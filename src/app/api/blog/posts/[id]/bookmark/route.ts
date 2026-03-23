import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPostBookmarks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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

    const existing = await db
      .select()
      .from(blogPostBookmarks)
      .where(and(eq(blogPostBookmarks.postId, postId), eq(blogPostBookmarks.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(blogPostBookmarks)
        .where(and(eq(blogPostBookmarks.postId, postId), eq(blogPostBookmarks.userId, userId)));

      return NextResponse.json({ bookmarked: false });
    } else {
      await db.insert(blogPostBookmarks).values({ postId, userId });

      return NextResponse.json({ bookmarked: true });
    }
  } catch {
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
