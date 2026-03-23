import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { logAdminAction, getClientIp } from "@/lib/audit";

const VALID_ROLES = ["admin", "moderator", "author", "seller", "member"];

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
    const { isVerified, isBanned, role } = body;

    const [existing] = await db
      .select({
        role: users.role,
        isBanned: users.isBanned,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const ip = getClientIp(request);

    if (typeof isVerified === "boolean" && isVerified !== existing.isVerified) {
      updates.isVerified = isVerified;
      logAdminAction({
        actorId: session.user.id,
        action: isVerified ? "user_verified" : "user_unverified",
        targetType: "user",
        targetId: id,
        details: { before: existing.isVerified, after: isVerified },
        ipAddress: ip,
      });
    }

    if (typeof isBanned === "boolean" && isBanned !== existing.isBanned) {
      updates.isBanned = isBanned;
      logAdminAction({
        actorId: session.user.id,
        action: isBanned ? "user_banned" : "user_unbanned",
        targetType: "user",
        targetId: id,
        details: { before: existing.isBanned, after: isBanned },
        ipAddress: ip,
      });
    }

    if (typeof role === "string" && VALID_ROLES.includes(role) && role !== existing.role) {
      updates.role = role as (typeof users.role.enumValues)[number];
      logAdminAction({
        actorId: session.user.id,
        action: "role_changed",
        targetType: "user",
        targetId: id,
        details: { before: existing.role, after: role },
        ipAddress: ip,
      });
    }

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning({
      id: users.id,
      role: users.role,
      isBanned: users.isBanned,
      isVerified: users.isVerified,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar utilizador" }, { status: 500 });
  }
}
