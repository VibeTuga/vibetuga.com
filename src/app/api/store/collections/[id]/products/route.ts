import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCollections, storeCollectionProducts, storeProducts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem gerir produtos das coleções." },
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

  const { id } = await context.params;

  try {
    const [collection] = await db
      .select({ id: storeCollections.id })
      .from(storeCollections)
      .where(eq(storeCollections.id, id))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
    }

    const [product] = await db
      .select({ id: storeProducts.id })
      .from(storeProducts)
      .where(eq(storeProducts.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    const existing = await db
      .select()
      .from(storeCollectionProducts)
      .where(
        and(
          eq(storeCollectionProducts.collectionId, id),
          eq(storeCollectionProducts.productId, productId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Produto já está nesta coleção." }, { status: 409 });
    }

    const [maxOrder] = await db
      .select({
        max: sql<number>`coalesce(max(${storeCollectionProducts.sortOrder}), -1)::int`,
      })
      .from(storeCollectionProducts)
      .where(eq(storeCollectionProducts.collectionId, id));

    await db.insert(storeCollectionProducts).values({
      collectionId: id,
      productId,
      sortOrder: (maxOrder?.max ?? -1) + 1,
    });

    return NextResponse.json({ message: "Produto adicionado à coleção." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar produto à coleção." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem gerir produtos das coleções." },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório." }, { status: 400 });
    }

    await db
      .delete(storeCollectionProducts)
      .where(
        and(
          eq(storeCollectionProducts.collectionId, id),
          eq(storeCollectionProducts.productId, productId),
        ),
      );

    return NextResponse.json({ message: "Produto removido da coleção." });
  } catch {
    return NextResponse.json({ error: "Erro ao remover produto da coleção." }, { status: 500 });
  }
}
