import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { directMessages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/messages/unread — total unread message count
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(directMessages)
    .where(and(eq(directMessages.recipientId, session.user.id), eq(directMessages.isRead, false)));

  return NextResponse.json({ count: result?.count ?? 0 });
}
