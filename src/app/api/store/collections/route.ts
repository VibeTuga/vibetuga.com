import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCollections, storeCollectionProducts } from "@/lib/db/schema";
import { eq, desc, sql, asc } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

export async function GET() {
  try {
    const collections = await db
      .select({
        id: storeCollections.id,
        name: storeCollections.name,
        slug: storeCollections.slug,
        description: storeCollections.description,
        coverImage: storeCollections.coverImage,
        isFeatured: storeCollections.isFeatured,
        sortOrder: storeCollections.sortOrder,
        createdAt: storeCollections.createdAt,
        productCount: sql<number>`count(${storeCollectionProducts.productId})::int`.as(
          "product_count",
        ),
      })
      .from(storeCollections)
      .leftJoin(
        storeCollectionProducts,
        eq(storeCollections.id, storeCollectionProducts.collectionId),
      )
      .groupBy(storeCollections.id)
      .orderBy(asc(storeCollections.sortOrder), desc(storeCollections.createdAt));

    return NextResponse.json({ collections });
  } catch {
    return NextResponse.json({ error: "Erro ao listar coleções." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem criar coleções." },
      { status: 403 },
    );
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { name, slug, description, coverImage, isFeatured, sortOrder } = body;

    if (!name || typeof name !== "string" || name.length > 200) {
      return NextResponse.json(
        { error: "Nome é obrigatório (máx. 200 caracteres)." },
        { status: 400 },
      );
    }

    if (!slug || typeof slug !== "string" || slug.length > 200) {
      return NextResponse.json(
        { error: "Slug é obrigatório (máx. 200 caracteres)." },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: storeCollections.id })
      .from(storeCollections)
      .where(eq(storeCollections.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Já existe uma coleção com este slug." }, { status: 409 });
    }

    const [collection] = await db
      .insert(storeCollections)
      .values({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        coverImage: coverImage || null,
        isFeatured: isFeatured ?? false,
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json({ collection }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar coleção." }, { status: 500 });
  }
}
