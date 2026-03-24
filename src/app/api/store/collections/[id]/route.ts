import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCollections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
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
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = String(body.name).trim().slice(0, 200);
  if (body.slug !== undefined) updates.slug = String(body.slug).trim().toLowerCase().slice(0, 200);
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.coverImage !== undefined) updates.coverImage = body.coverImage || null;
  if (body.isFeatured !== undefined) updates.isFeatured = !!body.isFeatured;
  if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

  updates.updatedAt = new Date();

  const [updated] = await db
    .update(storeCollections)
    .set(updates)
    .where(eq(storeCollections.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = session.user as { id: string; role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(storeCollections)
    .where(eq(storeCollections.id, id))
    .returning({ id: storeCollections.id });

  if (!deleted) {
    return NextResponse.json({ error: "Coleção não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
