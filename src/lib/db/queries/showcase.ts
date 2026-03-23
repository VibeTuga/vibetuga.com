import { cache } from "react";
import { db } from "@/lib/db";
import { showcaseProjects, users } from "@/lib/db/schema";
import { eq, desc, and, or, count, sql } from "drizzle-orm";

const PROJECTS_PER_PAGE = 12;

type ShowcaseFilters = {
  techStack?: string;
  page?: number;
};

export const getApprovedProjects = cache(async (filters: ShowcaseFilters) => {
  const { techStack, page = 1 } = filters;

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

  return {
    projects: projectsResult,
    total,
    totalPages: Math.ceil(total / PROJECTS_PER_PAGE),
    currentPage: page,
  };
});

export const getProjectBySlug = cache(async (slug: string) => {
  const [project] = await db
    .select({
      id: showcaseProjects.id,
      title: showcaseProjects.title,
      slug: showcaseProjects.slug,
      description: showcaseProjects.description,
      coverImage: showcaseProjects.coverImage,
      galleryImages: showcaseProjects.galleryImages,
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
    .where(
      and(
        eq(showcaseProjects.slug, slug),
        or(eq(showcaseProjects.status, "approved"), eq(showcaseProjects.status, "featured")),
      ),
    )
    .limit(1);

  return project ?? null;
});

export const getPendingProjects = cache(async () => {
  return db
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
      createdAt: showcaseProjects.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
    })
    .from(showcaseProjects)
    .leftJoin(users, eq(showcaseProjects.authorId, users.id))
    .where(eq(showcaseProjects.status, "pending"))
    .orderBy(desc(showcaseProjects.createdAt));
});

export const getFeaturedProjects = cache(async () => {
  return db
    .select({
      id: showcaseProjects.id,
      title: showcaseProjects.title,
      slug: showcaseProjects.slug,
      description: showcaseProjects.description,
      coverImage: showcaseProjects.coverImage,
      liveUrl: showcaseProjects.liveUrl,
      techStack: showcaseProjects.techStack,
      aiToolsUsed: showcaseProjects.aiToolsUsed,
      votesCount: showcaseProjects.votesCount,
      createdAt: showcaseProjects.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
    })
    .from(showcaseProjects)
    .leftJoin(users, eq(showcaseProjects.authorId, users.id))
    .where(eq(showcaseProjects.status, "featured"))
    .orderBy(desc(showcaseProjects.createdAt));
});

export type ShowcaseProject = Awaited<ReturnType<typeof getApprovedProjects>>["projects"][number];
export type ShowcaseProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;
export type PendingProject = Awaited<ReturnType<typeof getPendingProjects>>[number];
