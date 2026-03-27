import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { xpEvents } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const activities = await db
      .select({
        date: sql<string>`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, session.user.id), gte(xpEvents.createdAt, oneYearAgo)))
      .groupBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`);

    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar calendário" }, { status: 500 });
  }
}
