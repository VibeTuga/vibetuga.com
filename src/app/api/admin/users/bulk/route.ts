import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { logAdminAction, getClientIp } from "@/lib/audit";

const VALID_ROLES = ["admin", "moderator", "author", "seller", "member"];

/**
 * PATCH — Bulk role change
 * Body: { userIds: string[], newRole: string }
 */
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Apenas admins podem realizar ações em massa." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { userIds, newRole } = body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: "userIds é obrigatório." }, { status: 400 });
  }

  if (!newRole || !VALID_ROLES.includes(newRole)) {
    return NextResponse.json({ error: "Role inválido." }, { status: 400 });
  }

  if (userIds.length > 100) {
    return NextResponse.json(
      { error: "Máximo de 100 utilizadores por operação." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);

  // Update each user and log each change
  let updatedCount = 0;
  for (const userId of userIds) {
    if (typeof userId !== "string") continue;

    const [current] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!current || current.role === newRole) continue;

    await db
      .update(users)
      .set({ role: newRole as (typeof users.role.enumValues)[number], updatedAt: new Date() })
      .where(eq(users.id, userId));

    logAdminAction({
      actorId: session.user.id,
      action: "bulk_role_change",
      targetType: "user",
      targetId: userId,
      details: { before: current.role, after: newRole, bulkOperation: true },
      ipAddress: ip,
    });

    updatedCount++;
  }

  return NextResponse.json({ success: true, updatedCount });
}

/**
 * GET — Export users as CSV
 * Query: ?format=csv
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["admin", "moderator"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format !== "csv") {
    return NextResponse.json({ error: "Formato não suportado. Usa ?format=csv" }, { status: 400 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      isBanned: users.isBanned,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const headers = [
    "id",
    "discordUsername",
    "displayName",
    "email",
    "role",
    "xpPoints",
    "level",
    "isBanned",
    "isVerified",
    "createdAt",
  ];

  const escape = (val: unknown): string => {
    const s = String(val ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csvRows = [
    headers.join(","),
    ...allUsers.map((u) => headers.map((h) => escape(u[h as keyof typeof u])).join(",")),
  ];

  const csvContent = csvRows.join("\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vibetuga-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
