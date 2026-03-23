import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Auth: CRON_SECRET header only
    const cronSecret = req.headers.get("CRON_SECRET");
    if (!cronSecret || !process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find all posts where scheduledAt <= now AND status = 'draft'
    const scheduledPosts = await db
      .select({ id: blogPosts.id, title: blogPosts.title })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "draft"), lte(blogPosts.scheduledAt, now)));

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ published: 0, message: "Nenhum post agendado para publicar" });
    }

    const publishedIds: string[] = [];

    for (const post of scheduledPosts) {
      await db
        .update(blogPosts)
        .set({
          status: "published",
          publishedAt: now,
          scheduledAt: null,
          updatedAt: now,
        })
        .where(eq(blogPosts.id, post.id));
      publishedIds.push(post.id);
    }

    return NextResponse.json({
      published: publishedIds.length,
      ids: publishedIds,
      message: `${publishedIds.length} post(s) publicado(s) com sucesso`,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao publicar posts agendados" }, { status: 500 });
  }
}
