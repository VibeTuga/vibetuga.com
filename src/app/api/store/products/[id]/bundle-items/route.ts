import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeBundleItems, storeProducts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getBundleItems } from "@/lib/db/queries/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const items = await getBundleItems(id);
  return NextResponse.json(items);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: bundleId } = await params;
  const body = await req.json();
  const { productId, sortOrder } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
  }

  // Verify user owns the bundle product or is admin
  const user = session.user as { id: string; role?: string };
  const [bundle] = await db
    .select({ sellerId: storeProducts.sellerId, isBundle: storeProducts.isBundle })
    .from(storeProducts)
    .where(eq(storeProducts.id, bundleId))
    .limit(1);

  if (!bundle) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  }

  if (bundle.sellerId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // Mark as bundle if not already
  if (!bundle.isBundle) {
    await db.update(storeProducts).set({ isBundle: true }).where(eq(storeProducts.id, bundleId));
  }

  await db
    .insert(storeBundleItems)
    .values({
      bundleId,
      productId,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    })
    .onConflictDoNothing();

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: bundleId } = await params;
  const body = await req.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
  }

  const user = session.user as { id: string; role?: string };
  const [bundle] = await db
    .select({ sellerId: storeProducts.sellerId })
    .from(storeProducts)
    .where(eq(storeProducts.id, bundleId))
    .limit(1);

  if (!bundle || (bundle.sellerId !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  await db
    .delete(storeBundleItems)
    .where(and(eq(storeBundleItems.bundleId, bundleId), eq(storeBundleItems.productId, productId)));

  return NextResponse.json({ success: true });
}
