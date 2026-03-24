import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { showcaseProjects, users } from "@/lib/db/schema";
import { eq, desc, and, or, sql, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";

const PROJECTS_PER_PAGE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const techStack = searchParams.get("techStack");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const conditions: ReturnType<typeof eq>[] = [
      or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured"))!,
    ];

    if (techStack) {
      conditions.push(sql`${showcaseProjects.techStack} @> ARRAY[${techStack}]::text[]`);
    }

    const whereClause = and(...conditions);
    const offset = (page - 1) * PROJECTS_PER_PAGE;

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
          videoUrl: showcaseProjects.videoUrl,
          techStack: showcaseProjects.techStack,
          aiToolsUsed: showcaseProjects.aiToolsUsed,
          status: showcaseProjects.status,
          votesCount: showcaseProjects.votesCount,
          createdAt: showcaseProjects.createdAt,
          authorName: users.discordUsername,
          authorDisplayName: users.displayName,
          authorImage: users.image,
        })
        .from(showcaseProjects)
        .leftJoin(users, eq(showcaseProjects.authorId, users.id))
        .where(whereClause)
        .orderBy(desc(showcaseProjects.createdAt))
        .limit(PROJECTS_PER_PAGE)
        .offset(offset),
      db.select({ count: count() }).from(showcaseProjects).where(whereClause),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json(
      {
        projects: projectsResult,
        total,
        totalPages: Math.ceil(total / PROJECTS_PER_PAGE),
        currentPage: page,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      coverImage,
      galleryImages,
      liveUrl,
      repoUrl,
      videoUrl,
      techStack,
      aiToolsUsed,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const [project] = await db
      .insert(showcaseProjects)
      .values({
        authorId: session.user.id,
        title,
        slug,
        description: description || null,
        coverImage: coverImage || null,
        galleryImages: galleryImages || [],
        liveUrl: liveUrl || null,
        repoUrl: repoUrl || null,
        videoUrl: videoUrl || null,
        techStack: techStack || [],
        aiToolsUsed: aiToolsUsed || [],
        status: "pending",
      })
      .returning();

    await awardXP(session.user.id, "project_submitted", project.id).catch(() => null);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create project";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
