import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  collections,
  collectionItems,
  blogPosts,
  showcaseProjects,
  storeProducts,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const collectionId = Number(id);
  if (isNaN(collectionId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const [collection] = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isPublic: collections.isPublic,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
      })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)));

    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    // Fetch items with their details
    const items = await db
      .select({
        id: collectionItems.id,
        itemType: collectionItems.itemType,
        itemId: collectionItems.itemId,
        addedAt: collectionItems.addedAt,
      })
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId));

    // Resolve item details by type
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (item.itemType === "blog_post") {
          const [post] = await db
            .select({
              id: blogPosts.id,
              title: blogPosts.title,
              slug: blogPosts.slug,
              excerpt: blogPosts.excerpt,
              coverImage: blogPosts.coverImage,
              authorName: users.displayName,
            })
            .from(blogPosts)
            .leftJoin(users, eq(blogPosts.authorId, users.id))
            .where(eq(blogPosts.id, item.itemId));
          return { ...item, details: post ?? null };
        }

        if (item.itemType === "showcase_project") {
          const [project] = await db
            .select({
              id: showcaseProjects.id,
              title: showcaseProjects.title,
              slug: showcaseProjects.slug,
              description: showcaseProjects.description,
              coverImage: showcaseProjects.coverImage,
              authorName: users.displayName,
            })
            .from(showcaseProjects)
            .leftJoin(users, eq(showcaseProjects.authorId, users.id))
            .where(eq(showcaseProjects.id, item.itemId));
          return { ...item, details: project ?? null };
        }

        if (item.itemType === "store_product") {
          const [product] = await db
            .select({
              id: storeProducts.id,
              title: storeProducts.title,
              slug: storeProducts.slug,
              description: storeProducts.description,
              coverImage: storeProducts.coverImage,
              priceCents: storeProducts.priceCents,
              sellerName: users.displayName,
            })
            .from(storeProducts)
            .leftJoin(users, eq(storeProducts.sellerId, users.id))
            .where(eq(storeProducts.id, item.itemId));
          return { ...item, details: product ?? null };
        }

        return { ...item, details: null };
      }),
    );

    return NextResponse.json({
      collection,
      items: enrichedItems,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar coleção" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const collectionId = Number(id);
  if (isNaN(collectionId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, isPublic } = body as {
      name?: string;
      description?: string;
      isPublic?: boolean;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (name !== undefined) {
      if (name.trim().length === 0) {
        return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Nome muito longo (máx. 100 caracteres)" },
          { status: 400 },
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (isPublic !== undefined) {
      updates.isPublic = isPublic;
    }

    const [updated] = await db
      .update(collections)
      .set(updates)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
      .returning({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        isPublic: collections.isPublic,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
      });

    if (!updated) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ collection: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar coleção" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const collectionId = Number(id);
  if (isNaN(collectionId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))
      .returning({ id: collections.id });

    if (!deleted) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar coleção" }, { status: 500 });
  }
}
