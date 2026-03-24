import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productUpdates, storeProducts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const updates = await db
      .select({
        id: productUpdates.id,
        version: productUpdates.version,
        changelog: productUpdates.changelog,
        downloadUrl: productUpdates.downloadUrl,
        createdAt: productUpdates.createdAt,
      })
      .from(productUpdates)
      .where(eq(productUpdates.productId, id))
      .orderBy(desc(productUpdates.createdAt));

    return NextResponse.json(updates, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar atualizaes" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { version, changelog, downloadUrl } = body;

    if (!version || typeof version !== "string" || version.length > 50) {
      return NextResponse.json(
        { error: "Verso  obrigatria (mximo 50 caracteres)" },
        { status: 400 },
      );
    }

    if (!changelog || typeof changelog !== "string") {
      return NextResponse.json({ error: "Changelog  obrigatrio" }, { status: 400 });
    }

    if (changelog.length > 5000) {
      return NextResponse.json(
        { error: "Changelog demasiado longo (mximo 5000 caracteres)" },
        { status: 400 },
      );
    }

    // Verify product exists and user is the seller or admin
    const [product] = await db
      .select({ sellerId: storeProducts.sellerId })
      .from(storeProducts)
      .where(eq(storeProducts.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto no encontrado" }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";
    const isOwner = product.sellerId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Apenas o vendedor ou admin pode publicar atualizaes" },
        { status: 403 },
      );
    }

    const [update] = await db
      .insert(productUpdates)
      .values({
        productId: id,
        version: version.trim(),
        changelog: changelog.trim(),
        downloadUrl: downloadUrl?.trim() || null,
      })
      .returning();

    // Update the product's updatedAt timestamp
    await db.update(storeProducts).set({ updatedAt: new Date() }).where(eq(storeProducts.id, id));

    return NextResponse.json(update, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar atualizao" }, { status: 500 });
  }
}
