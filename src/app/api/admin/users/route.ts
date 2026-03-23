import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["admin", "moderator"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const q = searchParams.get("q") ?? "";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = q
    ? or(
        ilike(users.discordUsername, `%${q}%`),
        ilike(users.displayName, `%${q}%`),
        ilike(users.email, `%${q}%`),
      )
    : undefined;

  const [userList, totalResult] = await Promise.all([
    db
      .select({
        id: users.id,
        discordUsername: users.discordUsername,
        displayName: users.displayName,
        email: users.email,
        image: users.image,
        role: users.role,
        xpPoints: users.xpPoints,
        level: users.level,
        isBanned: users.isBanned,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(conditions)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(conditions),
  ]);

  return NextResponse.json({
    users: userList,
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || !["admin", "moderator"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await request.json();
  const { userId, isVerified, isBanned, role } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId é obrigatório." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof isVerified === "boolean") {
    updates.isVerified = isVerified;
  }
  if (typeof isBanned === "boolean") {
    updates.isBanned = isBanned;
  }
  if (role && ["admin", "moderator", "author", "seller", "member"].includes(role)) {
    // Only admins can change roles
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Apenas admins podem alterar roles." }, { status: 403 });
    }
    updates.role = role;
  }

  const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning({
    id: users.id,
    isVerified: users.isVerified,
    isBanned: users.isBanned,
    role: users.role,
  });

  if (!updated) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  return NextResponse.json(updated);
}
