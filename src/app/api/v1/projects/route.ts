import { db } from "@/lib/db";
import { showcaseProjects, users } from "@/lib/db/schema";
import { eq, desc, and, or, sql, count, ilike } from "drizzle-orm";
import { withApiV1Auth, apiV1Response, apiV1Error } from "@/lib/api-v1-middleware";
import type { NextResponse } from "next/server";
import type { ApiV1Context } from "@/lib/api-v1-middleware";

export async function GET(request: Request) {
  const authResult = await withApiV1Auth(request);
  if (authResult instanceof Response) return authResult as NextResponse;
  const ctx = authResult as ApiV1Context;

  if (!ctx.scopes.includes("projects:read")) {
    return apiV1Error("Missing scope: projects:read", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "12", 10)), 50);
    const tech = searchParams.get("tech");
    const q = searchParams.get("q");

    const conditions: ReturnType<typeof eq>[] = [
      or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured"))!,
    ];

    if (tech) {
      conditions.push(sql`${showcaseProjects.techStack} @> ARRAY[${tech}]::text[]`);
    }

    if (q && q.trim().length >= 2) {
      conditions.push(ilike(showcaseProjects.title, `%${q.trim()}%`));
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * limit;

    const [projectsResult, totalResult] = await Promise.all([
      db
        .select({
          id: showcaseProjects.id,
          title: showcaseProjects.title,
          slug: showcaseProjects.slug,
          description: showcaseProjects.description,
          coverImage: showcaseProjects.coverImage,
          liveUrl: showcaseProjects.liveUrl,
          repoUrl: showcaseProjects.repoUrl,
          techStack: showcaseProjects.techStack,
          aiToolsUsed: showcaseProjects.aiToolsUsed,
          votesCount: showcaseProjects.votesCount,
          createdAt: showcaseProjects.createdAt,
          authorUsername: users.discordUsername,
          authorDisplayName: users.displayName,
          authorImage: users.image,
        })
        .from(showcaseProjects)
        .leftJoin(users, eq(showcaseProjects.authorId, users.id))
        .where(whereClause)
        .orderBy(desc(showcaseProjects.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(showcaseProjects).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    const data = projectsResult.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      coverImage: p.coverImage,
      liveUrl: p.liveUrl,
      repoUrl: p.repoUrl,
      techStack: p.techStack,
      aiToolsUsed: p.aiToolsUsed,
      votesCount: p.votesCount,
      createdAt: p.createdAt,
      author: {
        username: p.authorDisplayName || p.authorUsername,
        image: p.authorImage,
      },
    }));

    return apiV1Response(data, { page, limit, total });
  } catch {
    return apiV1Error("Failed to fetch projects", 500);
  }
}
