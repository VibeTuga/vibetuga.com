import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
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
    const { status, resolvedNote } = body;

    if (!status || !["resolved", "dismissed"].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Usa 'resolved' ou 'dismissed'." },
        { status: 400 },
      );
    }

    const [existing] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Denúncia não encontrada." }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Esta denúncia já foi processada." }, { status: 400 });
    }

    const [updated] = await db
      .update(reports)
      .set({
        status,
        resolvedBy: session.user.id,
        resolvedNote: resolvedNote ? String(resolvedNote).trim() : null,
      })
      .where(eq(reports.id, id))
      .returning();

    logAdminAction({
      actorId: session.user.id,
      action: status === "resolved" ? "report_resolved" : "report_dismissed",
      targetType: "report",
      targetId: id,
      details: resolvedNote ? { resolvedNote: String(resolvedNote).trim() } : null,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao processar denúncia." }, { status: 500 });
  }
}
