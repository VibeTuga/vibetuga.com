import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const searchPattern = `%${q}%`;

    const results = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(
        and(
          eq(blogPosts.status, "published"),
          or(
            ilike(blogPosts.title, searchPattern),
            ilike(blogPosts.excerpt, searchPattern),
            ilike(blogPosts.content, searchPattern),
          ),
        ),
      )
      .orderBy(desc(blogPosts.publishedAt))
      .limit(10);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
