import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  storeCollections,
  storeCollectionProducts,
  storeProducts,
  users,
  storeReviews,
} from "@/lib/db/schema";
import { eq, sql, asc } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const [collection] = await db
      .select()
      .from(storeCollections)
      .where(eq(storeCollections.id, id))
      .limit(1);

    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
    }

    const products = await db
      .select({
        id: storeProducts.id,
        title: storeProducts.title,
        slug: storeProducts.slug,
        description: storeProducts.description,
        priceCents: storeProducts.priceCents,
        productType: storeProducts.productType,
        coverImage: storeProducts.coverImage,
        tags: storeProducts.tags,
        sortOrder: storeCollectionProducts.sortOrder,
        sellerName: users.discordUsername,
        sellerDisplayName: users.displayName,
        sellerImage: users.image,
        avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
          "avg_rating",
        ),
        reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
      })
      .from(storeCollectionProducts)
      .innerJoin(storeProducts, eq(storeCollectionProducts.productId, storeProducts.id))
      .leftJoin(users, eq(storeProducts.sellerId, users.id))
      .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
      .where(eq(storeCollectionProducts.collectionId, id))
      .groupBy(storeProducts.id, storeCollectionProducts.sortOrder, users.id)
      .orderBy(asc(storeCollectionProducts.sortOrder));

    return NextResponse.json({ collection, products });
  } catch {
    return NextResponse.json({ error: "Erro ao obter coleção." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem editar coleções." },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  try {
    const [existing] = await db
      .select({ id: storeCollections.id })
      .from(storeCollections)
      .where(eq(storeCollections.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.length > 200) {
        return NextResponse.json(
          { error: "Nome deve ter no máximo 200 caracteres." },
          { status: 400 },
        );
      }
      updates.name = body.name.trim();
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || body.slug.length > 200) {
        return NextResponse.json(
          { error: "Slug deve ter no máximo 200 caracteres." },
          { status: 400 },
        );
      }
      const slugConflict = await db
        .select({ id: storeCollections.id })
        .from(storeCollections)
        .where(eq(storeCollections.slug, body.slug))
        .limit(1);
      if (slugConflict.length > 0 && slugConflict[0].id !== id) {
        return NextResponse.json(
          { error: "Já existe uma coleção com este slug." },
          { status: 409 },
        );
      }
      updates.slug = body.slug.trim();
    }

    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage || null;
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const [updated] = await db
      .update(storeCollections)
      .set(updates)
      .where(eq(storeCollections.id, id))
      .returning();

    return NextResponse.json({ collection: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar coleção." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores podem eliminar coleções." },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  try {
    const [existing] = await db
      .select({ id: storeCollections.id })
      .from(storeCollections)
      .where(eq(storeCollections.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
    }

    await db.delete(storeCollections).where(eq(storeCollections.id, id));

    return NextResponse.json({ message: "Coleção eliminada com sucesso." });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar coleção." }, { status: 500 });
  }
}
