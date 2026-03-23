import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeProducts, users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [product] = await db
      .select({
        id: storeProducts.id,
        sellerId: storeProducts.sellerId,
        title: storeProducts.title,
        slug: storeProducts.slug,
        description: storeProducts.description,
        priceCents: storeProducts.priceCents,
        productType: storeProducts.productType,
        status: storeProducts.status,
        coverImage: storeProducts.coverImage,
        tags: storeProducts.tags,
        downloadKey: storeProducts.downloadKey,
        stripePriceId: storeProducts.stripePriceId,
        createdAt: storeProducts.createdAt,
        updatedAt: storeProducts.updatedAt,
        sellerName: users.discordUsername,
        sellerDisplayName: users.displayName,
        sellerImage: users.image,
      })
      .from(storeProducts)
      .leftJoin(users, eq(storeProducts.sellerId, users.id))
      .where(or(eq(storeProducts.id, id), eq(storeProducts.slug, id)))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const [existing] = await db
      .select({ status: storeProducts.status, sellerId: storeProducts.sellerId })
      .from(storeProducts)
      .where(eq(storeProducts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";
    const isOwner = existing.sellerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Sellers can only edit their own drafts
    if (!isAdmin && existing.status !== "draft") {
      return NextResponse.json(
        { error: "Apenas produtos em rascunho podem ser editados" },
        { status: 403 },
      );
    }

    const {
      title,
      slug,
      description,
      priceCents,
      productType,
      coverImage,
      tags,
      downloadKey,
      status,
    } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    // Fields sellers and admins can edit
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description || null;
    if (priceCents !== undefined) updates.priceCents = priceCents;
    if (productType !== undefined) updates.productType = productType;
    if (coverImage !== undefined) updates.coverImage = coverImage || null;
    if (tags !== undefined) updates.tags = tags;
    if (downloadKey !== undefined) updates.downloadKey = downloadKey || null;

    // Only admins can change status
    if (status !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Apenas administradores podem alterar o estado do produto" },
          { status: 403 },
        );
      }
      updates.status = status;
    }

    const [product] = await db
      .update(storeProducts)
      .set(updates)
      .where(eq(storeProducts.id, id))
      .returning();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [existing] = await db
      .select({ sellerId: storeProducts.sellerId })
      .from(storeProducts)
      .where(eq(storeProducts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";
    const isOwner = existing.sellerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [deleted] = await db
      .delete(storeProducts)
      .where(eq(storeProducts.id, id))
      .returning({ id: storeProducts.id });

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
