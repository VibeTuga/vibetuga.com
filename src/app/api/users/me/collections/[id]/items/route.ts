import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collections, collectionItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

const VALID_ITEM_TYPES = ["blog_post", "showcase_project", "store_product"] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    // Verify collection ownership
    const [collection] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)));

    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { itemType, itemId } = body as {
      itemType?: string;
      itemId?: string | number;
    };

    if (!itemType || !VALID_ITEM_TYPES.includes(itemType as (typeof VALID_ITEM_TYPES)[number])) {
      return NextResponse.json(
        {
          error:
            "Tipo de item inválido. Valores aceites: blog_post, showcase_project, store_product",
        },
        { status: 400 },
      );
    }

    if (!itemId) {
      return NextResponse.json({ error: "ID do item é obrigatório" }, { status: 400 });
    }

    const [created] = await db
      .insert(collectionItems)
      .values({
        collectionId,
        itemType,
        itemId: String(itemId),
      })
      .onConflictDoNothing()
      .returning({
        id: collectionItems.id,
        collectionId: collectionItems.collectionId,
        itemType: collectionItems.itemType,
        itemId: collectionItems.itemId,
        addedAt: collectionItems.addedAt,
      });

    if (!created) {
      return NextResponse.json({ error: "Este item já está na coleção" }, { status: 409 });
    }

    // Update collection's updatedAt
    await db
      .update(collections)
      .set({ updatedAt: new Date() })
      .where(eq(collections.id, collectionId));

    return NextResponse.json({ item: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar item à coleção" }, { status: 500 });
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
    // Verify collection ownership
    const [collection] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)));

    if (!collection) {
      return NextResponse.json({ error: "Coleção não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { itemId } = body as { itemId?: number };

    if (!itemId) {
      return NextResponse.json({ error: "ID do item é obrigatório" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(collectionItems)
      .where(and(eq(collectionItems.id, itemId), eq(collectionItems.collectionId, collectionId)))
      .returning({ id: collectionItems.id });

    if (!deleted) {
      return NextResponse.json({ error: "Item não encontrado na coleção" }, { status: 404 });
    }

    // Update collection's updatedAt
    await db
      .update(collections)
      .set({ updatedAt: new Date() })
      .where(eq(collections.id, collectionId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover item da coleção" }, { status: 500 });
  }
}
