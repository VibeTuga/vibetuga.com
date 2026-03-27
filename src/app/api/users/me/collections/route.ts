import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collections } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  try {
    const [userCollections, countResult] = await Promise.all([
      db
        .select({
          id: collections.id,
          name: collections.name,
          description: collections.description,
          isPublic: collections.isPublic,
          createdAt: collections.createdAt,
          updatedAt: collections.updatedAt,
          itemCount: sql<number>`(
            SELECT COUNT(*) FROM collection_item
            WHERE collection_item.collection_id = ${collections.id}
          )`.mapWith(Number),
        })
        .from(collections)
        .where(eq(collections.userId, session.user.id))
        .orderBy(desc(collections.updatedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
        .from(collections)
        .where(eq(collections.userId, session.user.id)),
    ]);

    const total = countResult[0]?.count ?? 0;

    return NextResponse.json({
      collections: userCollections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar coleções" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, isPublic } = body as {
      name?: string;
      description?: string;
      isPublic?: boolean;
    };

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Nome muito longo (máx. 100 caracteres)" },
        { status: 400 },
      );
    }

    const [created] = await db
      .insert(collections)
      .values({
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic ?? false,
      })
      .returning({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isPublic: collections.isPublic,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
      });

    return NextResponse.json({ collection: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar coleção" }, { status: 500 });
  }
}
