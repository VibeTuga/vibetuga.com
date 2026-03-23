import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { recordContentView, categorizeReferralSource } from "@/lib/db/queries/analytics";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const referer = request.headers.get("referer");
    const appHost = new URL(request.url).hostname;
    const source = categorizeReferralSource(referer, appHost);

    await db
      .update(blogPosts)
      .set({ viewsCount: sql`${blogPosts.viewsCount} + 1` })
      .where(eq(blogPosts.id, id));

    await recordContentView("blog_post", id, source);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registar visualização" }, { status: 500 });
  }
}
