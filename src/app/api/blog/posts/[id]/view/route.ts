import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db
      .update(blogPosts)
      .set({ viewsCount: sql`${blogPosts.viewsCount} + 1` })
      .where(eq(blogPosts.id, id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update view count" }, { status: 500 });
  }
}
