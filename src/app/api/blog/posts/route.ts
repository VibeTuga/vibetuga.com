import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        status: blogPosts.status,
        postType: blogPosts.postType,
        tags: blogPosts.tags,
        coverImage: blogPosts.coverImage,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        authorName: users.discordUsername,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const privilegedRoles = ["admin", "moderator", "author"];
  const isPrivileged = privilegedRoles.includes(session.user.role);

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, categoryId, tags, coverImage, status, postType } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    if (typeof title !== "string" || title.trim().length > 200) {
      return NextResponse.json({ error: "Title must be at most 200 characters" }, { status: 400 });
    }
    if (typeof slug !== "string" || slug.trim().length > 200) {
      return NextResponse.json({ error: "Slug must be at most 200 characters" }, { status: 400 });
    }
    if (excerpt && (typeof excerpt !== "string" || excerpt.trim().length > 500)) {
      return NextResponse.json(
        { error: "Excerpt must be at most 500 characters" },
        { status: 400 },
      );
    }

    // Members can only submit community posts for review
    const isCommunitySubmission = postType === "community" && status === "pending_review";
    if (!isPrivileged && !isCommunitySubmission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const readingTimeMinutes = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

    // Force community submissions to pending_review
    const finalStatus = isPrivileged ? status || "draft" : "pending_review";
    const finalPostType = isPrivileged ? postType || "admin" : "community";

    const [post] = await db
      .insert(blogPosts)
      .values({
        authorId: session.user.id,
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        categoryId: categoryId || null,
        tags: tags || [],
        coverImage: coverImage || null,
        status: finalStatus,
        postType: finalPostType,
        readingTimeMinutes,
        publishedAt: finalStatus === "published" ? new Date() : null,
      })
      .returning();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
