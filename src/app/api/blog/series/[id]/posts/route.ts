import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSeries, blogSeriesPosts, blogPosts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id: seriesId } = await context.params;

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
    const { postId, order } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório" }, { status: 400 });
    }

    // Verify the post exists
    const [post] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    // Check if post is already in the series
    const [existing] = await db
      .select({ id: blogSeriesPosts.id })
      .from(blogSeriesPosts)
      .where(and(eq(blogSeriesPosts.seriesId, seriesId), eq(blogSeriesPosts.postId, postId)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Este post já faz parte da série" }, { status: 409 });
    }

    // Auto-assign order if not provided
    let finalOrder = order;
    if (typeof finalOrder !== "number") {
      const [maxOrder] = await db
        .select({
          max: sql<number>`coalesce(max(${blogSeriesPosts.order}), 0)`,
        })
        .from(blogSeriesPosts)
        .where(eq(blogSeriesPosts.seriesId, seriesId));
      finalOrder = (maxOrder?.max ?? 0) + 1;
    }

    const [entry] = await db
      .insert(blogSeriesPosts)
      .values({
        seriesId,
        postId,
        order: finalOrder,
      })
      .returning();

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar post à série" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { id: seriesId } = await context.params;

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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório" }, { status: 400 });
    }

    await db
      .delete(blogSeriesPosts)
      .where(and(eq(blogSeriesPosts.seriesId, seriesId), eq(blogSeriesPosts.postId, postId)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover post da série" }, { status: 500 });
  }
}
