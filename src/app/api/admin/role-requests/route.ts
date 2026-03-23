import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const requests = await db
      .select({
        id: roleRequests.id,
        requestedRole: roleRequests.requestedRole,
        reason: roleRequests.reason,
        status: roleRequests.status,
        reviewNote: roleRequests.reviewNote,
        createdAt: roleRequests.createdAt,
        updatedAt: roleRequests.updatedAt,
        userId: roleRequests.userId,
        userName: users.discordUsername,
        userDisplayName: users.displayName,
        userImage: users.image,
        userRole: users.role,
      })
      .from(roleRequests)
      .innerJoin(users, eq(roleRequests.userId, users.id))
      .orderBy(desc(roleRequests.createdAt));

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar pedidos" }, { status: 500 });
  }
}
