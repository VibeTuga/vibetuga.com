import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all draft posts where scheduledPublishAt <= now
    const scheduledPosts = await db
      .select({ id: blogPosts.id, title: blogPosts.title })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, "draft"),
          isNotNull(blogPosts.scheduledPublishAt),
          lte(blogPosts.scheduledPublishAt, now),
        ),
      );

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ published: 0 });
    }

    // Publish each post
    for (const post of scheduledPosts) {
      await db
        .update(blogPosts)
        .set({
          status: "published",
          publishedAt: now,
          scheduledPublishAt: null,
          updatedAt: now,
        })
        .where(eq(blogPosts.id, post.id));
    }

    return NextResponse.json({
      published: scheduledPosts.length,
      posts: scheduledPosts.map((p) => p.title),
    });
  } catch {
    return NextResponse.json({ error: "Failed to publish scheduled posts" }, { status: 500 });
  }
}
