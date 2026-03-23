import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleRequests, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logAdminAction, getClientIp } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reviewNote } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida. Usa 'approve' ou 'reject'." },
        { status: 400 },
      );
    }

    const [existing] = await db.select().from(roleRequests).where(eq(roleRequests.id, id)).limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Este pedido já foi processado." }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update the role request
    const [updated] = await db
      .update(roleRequests)
      .set({
        status: newStatus,
        reviewedBy: session.user.id,
        reviewNote: reviewNote ? String(reviewNote).trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(roleRequests.id, id))
      .returning();

    // If approved, update the user's role
    if (action === "approve") {
      await db
        .update(users)
        .set({
          role: existing.requestedRole,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.userId));
    }

    const ip = getClientIp(request);
    logAdminAction({
      actorId: session.user.id,
      action: action === "approve" ? "role_request_approved" : "role_request_rejected",
      targetType: "role_request",
      targetId: id,
      details: {
        userId: existing.userId,
        requestedRole: existing.requestedRole,
        reviewNote: reviewNote || null,
      },
      ipAddress: ip,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao processar pedido" }, { status: 500 });
  }
}
