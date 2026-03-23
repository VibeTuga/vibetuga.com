import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogSeries, blogSeriesPosts, users } from "@/lib/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const series = await db
      .select({
        id: blogSeries.id,
        title: blogSeries.title,
        slug: blogSeries.slug,
        description: blogSeries.description,
        coverImage: blogSeries.coverImage,
        sortOrder: blogSeries.sortOrder,
        createdAt: blogSeries.createdAt,
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
      .orderBy(asc(blogSeries.sortOrder), desc(blogSeries.createdAt));

    return NextResponse.json(series);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar séries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const staffRoles = ["admin", "moderator", "author"];
  if (!staffRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, slug, description, coverImage, sortOrder, postIds } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Título e slug são obrigatórios" }, { status: 400 });
    }

    if (title.length > 255 || slug.length > 255) {
      return NextResponse.json({ error: "Título/slug demasiado longo" }, { status: 400 });
    }

    const [series] = await db
      .insert(blogSeries)
      .values({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        authorId: session.user.id,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    if (postIds && Array.isArray(postIds) && postIds.length > 0) {
      await db.insert(blogSeriesPosts).values(
        postIds.map((postId: string, idx: number) => ({
          seriesId: series.id,
          postId,
          order: idx + 1,
        })),
      );
    }

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "Já existe uma série com este slug" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar série" }, { status: 500 });
  }
}
