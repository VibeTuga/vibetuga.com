import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { showcaseProjects, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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
        updatedAt: showcaseProjects.updatedAt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
      })
      .from(showcaseProjects)
      .leftJoin(users, eq(showcaseProjects.authorId, users.id))
      .where(eq(showcaseProjects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
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
      status,
    } = body;

    const [existing] = await db
      .select({ status: showcaseProjects.status, authorId: showcaseProjects.authorId })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description || null;
    if (coverImage !== undefined) updates.coverImage = coverImage || null;
    if (galleryImages !== undefined) updates.galleryImages = galleryImages;
    if (liveUrl !== undefined) updates.liveUrl = liveUrl || null;
    if (repoUrl !== undefined) updates.repoUrl = repoUrl || null;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl || null;
    if (techStack !== undefined) updates.techStack = techStack;
    if (aiToolsUsed !== undefined) updates.aiToolsUsed = aiToolsUsed;
    if (status !== undefined) updates.status = status;

    const [project] = await db
      .update(showcaseProjects)
      .set(updates)
      .where(eq(showcaseProjects.id, id))
      .returning();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (status === "featured" && existing.status !== "featured") {
      await awardXP(existing.authorId, "project_featured", id).catch(() => null);
    }

    return NextResponse.json(project);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(showcaseProjects)
      .where(eq(showcaseProjects.id, id))
      .returning({ id: showcaseProjects.id });

    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
