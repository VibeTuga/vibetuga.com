import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions: ReturnType<typeof eq>[] = [];
    if (status && ["pending", "resolved", "dismissed"].includes(status)) {
      conditions.push(eq(reports.status, status as "pending" | "resolved" | "dismissed"));
    }

    const rows = await db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        contentType: reports.contentType,
        contentId: reports.contentId,
        reason: reports.reason,
        details: reports.details,
        status: reports.status,
        resolvedBy: reports.resolvedBy,
        resolvedNote: reports.resolvedNote,
        createdAt: reports.createdAt,
        reporterUsername: users.discordUsername,
        reporterDisplayName: users.displayName,
        reporterImage: users.image,
      })
      .from(reports)
      .innerJoin(users, eq(reports.reporterId, users.id))
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(
        sql`CASE WHEN ${reports.status} = 'pending' THEN 0 ELSE 1 END`,
        desc(reports.createdAt),
      );

    return NextResponse.json({ reports: rows });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar denúncias." }, { status: 500 });
  }
}
