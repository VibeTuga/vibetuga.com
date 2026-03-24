import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSeries, blogSeriesPosts, blogPosts, users, blogCategories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const seriesId = parseInt(id, 10);
    if (isNaN(seriesId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

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
        updatedAt: blogSeries.updatedAt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        authorImage: users.image,
      })
      .from(blogSeries)
      .leftJoin(users, eq(blogSeries.authorId, users.id))
      .where(eq(blogSeries.id, seriesId))
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
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        status: blogPosts.status,
        order: blogSeriesPosts.order,
        seriesPostId: blogSeriesPosts.id,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
      })
      .from(blogSeriesPosts)
      .innerJoin(blogPosts, eq(blogSeriesPosts.postId, blogPosts.id))
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogSeriesPosts.seriesId, seriesId))
      .orderBy(asc(blogSeriesPosts.order));

    return NextResponse.json({ ...series, posts });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar série" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const seriesId = parseInt(id, 10);
    if (isNaN(seriesId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [series] = await db
      .select({ id: blogSeries.id, authorId: blogSeries.authorId })
      .from(blogSeries)
      .where(eq(blogSeries.id, seriesId))
      .limit(1);

    if (!series) {
      return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
    }

    const isAdmin = ["admin", "moderator"].includes(session.user.role);
    if (series.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, description, coverImage, postOrders } = body;

    // Update series metadata
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length > 200) {
        return NextResponse.json(
          { error: "Título deve ter no máximo 200 caracteres" },
          { status: 400 },
        );
      }
      updates.title = title.trim();
    }
    if (slug !== undefined) {
      if (typeof slug !== "string" || slug.trim().length > 200) {
        return NextResponse.json(
          { error: "Slug deve ter no máximo 200 caracteres" },
          { status: 400 },
        );
      }
      // Check slug uniqueness (excluding current)
      const [existing] = await db
        .select({ id: blogSeries.id })
        .from(blogSeries)
        .where(eq(blogSeries.slug, slug.trim()))
        .limit(1);
      if (existing && existing.id !== seriesId) {
        return NextResponse.json({ error: "Já existe uma série com este slug" }, { status: 409 });
      }
      updates.slug = slug.trim();
    }
    if (description !== undefined) updates.description = description?.trim() || null;
    if (coverImage !== undefined) updates.coverImage = coverImage?.trim() || null;

    await db.update(blogSeries).set(updates).where(eq(blogSeries.id, seriesId));

    // Reorder posts if provided
    if (Array.isArray(postOrders)) {
      for (const item of postOrders) {
        if (item.id && typeof item.order === "number") {
          await db
            .update(blogSeriesPosts)
            .set({ order: item.order })
            .where(eq(blogSeriesPosts.id, item.id));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar série" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const seriesId = parseInt(id, 10);
    if (isNaN(seriesId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [series] = await db
      .select({ id: blogSeries.id, authorId: blogSeries.authorId })
      .from(blogSeries)
      .where(eq(blogSeries.id, seriesId))
      .limit(1);

    if (!series) {
      return NextResponse.json({ error: "Série não encontrada" }, { status: 404 });
    }

    const isAdmin = ["admin", "moderator"].includes(session.user.role);
    if (series.authorId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await db.delete(blogSeries).where(eq(blogSeries.id, seriesId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar série" }, { status: 500 });
  }
}
