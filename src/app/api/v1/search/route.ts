import { db } from "@/lib/db";
import { blogPosts, blogCategories, showcaseProjects, users } from "@/lib/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { withApiV1Auth, apiV1Response, apiV1Error } from "@/lib/api-v1-middleware";
import type { NextResponse } from "next/server";
import type { ApiV1Context } from "@/lib/api-v1-middleware";

export async function GET(request: Request) {
  const authResult = await withApiV1Auth(request);
  if (authResult instanceof Response) return authResult as NextResponse;
  const ctx = authResult as ApiV1Context;

  if (!ctx.scopes.includes("search:read")) {
    return apiV1Error("Missing scope: search:read", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "10", 10)), 50);

    if (!q || q.length < 2) {
      return apiV1Error("Query parameter 'q' is required (min 2 characters)", 400);
    }

    const searchPattern = `%${q}%`;

    // Search posts and projects in parallel
    const [posts, projects] = await Promise.all([
      db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          categoryName: blogCategories.name,
          categorySlug: blogCategories.slug,
          authorUsername: users.discordUsername,
          authorDisplayName: users.displayName,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
        .where(
          and(
            eq(blogPosts.status, "published"),
            or(ilike(blogPosts.title, searchPattern), ilike(blogPosts.excerpt, searchPattern)),
          ),
        )
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit),
      db
        .select({
          id: showcaseProjects.id,
          title: showcaseProjects.title,
          slug: showcaseProjects.slug,
          description: showcaseProjects.description,
          coverImage: showcaseProjects.coverImage,
          techStack: showcaseProjects.techStack,
          authorUsername: users.discordUsername,
          authorDisplayName: users.displayName,
          createdAt: showcaseProjects.createdAt,
        })
        .from(showcaseProjects)
        .leftJoin(users, eq(showcaseProjects.authorId, users.id))
        .where(
          and(
            or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured")),
            or(
              ilike(showcaseProjects.title, searchPattern),
              ilike(showcaseProjects.description, searchPattern),
            ),
          ),
        )
        .orderBy(desc(showcaseProjects.createdAt))
        .limit(limit),
    ]);

    const data = {
      posts: posts.map((p) => ({
        type: "post" as const,
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        category: p.categoryName ? { name: p.categoryName, slug: p.categorySlug } : null,
        author: p.authorDisplayName || p.authorUsername,
        publishedAt: p.publishedAt,
      })),
      projects: projects.map((p) => ({
        type: "project" as const,
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        coverImage: p.coverImage,
        techStack: p.techStack,
        author: p.authorDisplayName || p.authorUsername,
        createdAt: p.createdAt,
      })),
    };

    return apiV1Response(data);
  } catch {
    return apiV1Error("Search failed", 500);
  }
}
