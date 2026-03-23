import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logAdminAction, getClientIp } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { isApproved, content } = body;

    const [existing] = await db.select().from(blogComments).where(eq(blogComments.id, id)).limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    const updates: Partial<{ isApproved: boolean; content: string }> = {};
    if (typeof isApproved === "boolean") updates.isApproved = isApproved;
    if (typeof content === "string" && content.trim()) updates.content = content.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const [updated] = await db
      .update(blogComments)
      .set(updates)
      .where(eq(blogComments.id, id))
      .returning();

    logAdminAction({
      actorId: session.user.id,
      action: "comment_edited",
      targetType: "comment",
      targetId: id,
      details: updates,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao editar comentário." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { id } = await params;

    const [existing] = await db.select().from(blogComments).where(eq(blogComments.id, id)).limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Comentário não encontrado." }, { status: 404 });
    }

    await db.delete(blogComments).where(eq(blogComments.id, id));

    logAdminAction({
      actorId: session.user.id,
      action: "comment_deleted",
      targetType: "comment",
      targetId: id,
      details: { postId: existing.postId },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar comentário." }, { status: 500 });
  }
}
