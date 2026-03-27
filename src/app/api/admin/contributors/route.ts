import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userBadges, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, badgeId, action } = body as {
    userId: string;
    badgeId: string;
    action: "grant" | "revoke";
  };

  if (!userId || !badgeId || !["grant", "revoke"].includes(action)) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  if (action === "grant") {
    await db.insert(userBadges).values({ userId, badgeId }).onConflictDoNothing();
  } else {
    await db
      .delete(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
  }

  return NextResponse.json({ ok: true });
}
