import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCollectionProducts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCollectionProductIds } from "@/lib/db/queries/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const productIds = await getCollectionProductIds(id);
  return NextResponse.json(productIds);
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = session.user as { id: string; role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { productId, sortOrder } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
  }

  await db
    .insert(storeCollectionProducts)
    .values({
      collectionId: id,
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

  const user = session.user as { id: string; role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
  }

  await db
    .delete(storeCollectionProducts)
    .where(
      and(
        eq(storeCollectionProducts.collectionId, id),
        eq(storeCollectionProducts.productId, productId),
      ),
    );

  return NextResponse.json({ success: true });
}
