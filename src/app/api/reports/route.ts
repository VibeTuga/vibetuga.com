import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const ALLOWED_CONTENT_TYPES = ["post", "comment", "project", "product", "review"] as const;
const ALLOWED_REASONS = ["spam", "harassment", "inappropriate", "copyright", "other"] as const;

const reportLimiter = rateLimit({ interval: 60 * 60 * 1000, limit: 5 });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = reportLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas denúncias. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { contentType, contentId, reason, details } = body;

  if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
  }

  if (!contentId || typeof contentId !== "string") {
    return NextResponse.json({ error: "ID do conteúdo inválido." }, { status: 400 });
  }

  if (!reason || !ALLOWED_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Motivo inválido." }, { status: 400 });
  }

  if (details && (typeof details !== "string" || details.length > 1000)) {
    return NextResponse.json(
      { error: "Detalhes demasiado longos (máx. 1000 caracteres)." },
      { status: 400 },
    );
  }

  // Check for duplicate report
  const existing = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, session.user.id),
        eq(reports.contentType, contentType),
        eq(reports.contentId, contentId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Já submeteste uma denúncia para este conteúdo." },
      { status: 409 },
    );
  }

  const [report] = await db
    .insert(reports)
    .values({
      reporterId: session.user.id,
      contentType,
      contentId,
      reason,
      details: details?.trim() || null,
    })
    .returning({ id: reports.id });

  return NextResponse.json({ id: report.id }, { status: 201 });
}
