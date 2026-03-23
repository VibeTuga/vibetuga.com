import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSeries, users } from "@/lib/db/schema";
import { eq, desc, asc, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

const SERIES_PER_PAGE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const offset = (page - 1) * SERIES_PER_PAGE;

    const [seriesResult, totalResult] = await Promise.all([
      db
        .select({
          id: blogSeries.id,
          title: blogSeries.title,
          slug: blogSeries.slug,
          description: blogSeries.description,
          coverImage: blogSeries.coverImage,
          sortOrder: blogSeries.sortOrder,
          createdAt: blogSeries.createdAt,
          authorId: blogSeries.authorId,
          authorName: users.discordUsername,
          authorDisplayName: users.displayName,
          authorImage: users.image,
          postCount:
            sql<number>`(SELECT count(*)::int FROM blog_series_post WHERE blog_series_post.series_id = blog_series.id)`.as(
              "post_count",
            ),
        })
        .from(blogSeries)
        .leftJoin(users, eq(blogSeries.authorId, users.id))
        .orderBy(asc(blogSeries.sortOrder), desc(blogSeries.createdAt))
        .limit(SERIES_PER_PAGE)
        .offset(offset),
      db.select({ count: count() }).from(blogSeries),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      series: seriesResult,
      total,
      totalPages: Math.ceil(total / SERIES_PER_PAGE),
      currentPage: page,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar séries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const privilegedRoles = ["admin", "moderator", "author"];
  if (!privilegedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Apenas autores podem criar séries" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, slug, description, coverImage } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Título e slug são obrigatórios" }, { status: 400 });
    }

    if (typeof title !== "string" || title.trim().length > 200) {
      return NextResponse.json(
        { error: "Título deve ter no máximo 200 caracteres" },
        { status: 400 },
      );
    }

    if (typeof slug !== "string" || slug.trim().length > 200) {
      return NextResponse.json(
        { error: "Slug deve ter no máximo 200 caracteres" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: blogSeries.id })
      .from(blogSeries)
      .where(eq(blogSeries.slug, slug.trim()))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Já existe uma série com este slug" }, { status: 409 });
    }

    const [series] = await db
      .insert(blogSeries)
      .values({
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        coverImage: coverImage?.trim() || null,
        authorId: session.user.id,
      })
      .returning();

    return NextResponse.json(series, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar série" }, { status: 500 });
  }
}
