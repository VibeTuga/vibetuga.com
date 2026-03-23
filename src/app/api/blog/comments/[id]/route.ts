import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blogComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { content, isApproved } = body;

  const existing = await db
    .select({ id: blogComments.id })
    .from(blogComments)
    .where(eq(blogComments.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 5000) {
      return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
    }
    updates.content = trimmed;
  }

  if (typeof isApproved === "boolean") {
    updates.isApproved = isApproved;
  }

  await db.update(blogComments).set(updates).where(eq(blogComments.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  const existing = await db
    .select({ id: blogComments.id })
    .from(blogComments)
    .where(eq(blogComments.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
  }

  await db.delete(blogComments).where(eq(blogComments.id, id));

  return NextResponse.json({ success: true });
}
