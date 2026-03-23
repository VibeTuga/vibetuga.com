import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, all } = body as { ids?: string[]; all?: boolean };

    if (all) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

      return NextResponse.json({ success: true });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, session.user.id), inArray(notifications.id, ids)));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Fornece { ids: string[] } ou { all: true }." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json({ error: "Erro ao marcar notificações como lidas." }, { status: 500 });
  }
}
