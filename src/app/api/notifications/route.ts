import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  try {
    const [items, [unreadResult]] = await Promise.all([
      db
        .select({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
          body: notifications.body,
          link: notifications.link,
          isRead: notifications.isRead,
          actorId: notifications.actorId,
          referenceId: notifications.referenceId,
          createdAt: notifications.createdAt,
          actorDisplayName: users.displayName,
          actorImage: users.image,
        })
        .from(notifications)
        .leftJoin(users, eq(notifications.actorId, users.id))
        .where(eq(notifications.userId, session.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(notifications)
        .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false))),
    ]);

    return NextResponse.json({
      notifications: items,
      unreadCount: unreadResult.count,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar notificações." }, { status: 500 });
  }
}
