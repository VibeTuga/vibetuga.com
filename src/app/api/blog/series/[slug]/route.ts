import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSeries, blogSeriesPosts, blogPosts, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;

  try {
    const [series] = await db
      .select({
        id: blogSeries.id,
        title: blogSeries.title,
        slug: blogSeries.slug,
        description: blogSeries.description,
        coverImage: blogSeries.coverImage,
        authorId: blogSeries.authorId,
        sortOrder: blogSeries.sortOrder,
        createdAt: blogSeries.createdAt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
      })
      .from(blogSeries)
      .leftJoin(users, eq(blogSeries.authorId, users.id))
      .where(eq(blogSeries.slug, slug))
      .limit(1);

    if (!series) {
      return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
        publishedAt: blogPosts.publishedAt,
        status: blogPosts.status,
        order: blogSeriesPosts.order,
      })
      .from(blogSeriesPosts)
      .innerJoin(blogPosts, eq(blogSeriesPosts.postId, blogPosts.id))
      .where(eq(blogSeriesPosts.seriesId, series.id))
      .orderBy(asc(blogSeriesPosts.order));

    return NextResponse.json({ ...series, posts });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar série" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const staffRoles = ["admin", "moderator", "author"];
  if (!staffRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const [existing] = await db
      .select({ id: blogSeries.id })
      .from(blogSeries)
      .where(eq(blogSeries.slug, slug))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { title, newSlug, description, coverImage, sortOrder, postIds } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title.trim();
    if (newSlug !== undefined) updates.slug = newSlug.trim().toLowerCase();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (coverImage !== undefined) updates.coverImage = coverImage || null;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [updated] = await db
      .update(blogSeries)
      .set(updates)
      .where(eq(blogSeries.id, existing.id))
      .returning();

    if (postIds && Array.isArray(postIds)) {
      await db.delete(blogSeriesPosts).where(eq(blogSeriesPosts.seriesId, existing.id));

      if (postIds.length > 0) {
        await db.insert(blogSeriesPosts).values(
          postIds.map((postId: string, idx: number) => ({
            seriesId: existing.id,
            postId,
            order: idx + 1,
          })),
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Já existe uma série com este slug" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao atualizar série" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Apenas admins podem eliminar séries" }, { status: 403 });
  }

  try {
    const [existing] = await db
      .select({ id: blogSeries.id })
      .from(blogSeries)
      .where(eq(blogSeries.slug, slug))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
    }

    await db.delete(blogSeries).where(eq(blogSeries.id, existing.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar série" }, { status: 500 });
  }
}
