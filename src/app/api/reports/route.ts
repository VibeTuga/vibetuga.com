import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { and, eq } from "drizzle-orm";

const VALID_CONTENT_TYPES = ["post", "comment", "project", "product", "review"] as const;
const VALID_REASONS = ["spam", "harassment", "inappropriate", "copyright", "other"] as const;

const limiter = rateLimit({ interval: 60 * 60 * 1000, limit: 5 });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contentType, contentId, reason, details } = body;

    if (
      !contentType ||
      !VALID_CONTENT_TYPES.includes(contentType as (typeof VALID_CONTENT_TYPES)[number])
    ) {
      return NextResponse.json({ error: "Tipo de conteúdo inválido." }, { status: 400 });
    }

    if (!reason || !VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
      return NextResponse.json({ error: "Razão inválida." }, { status: 400 });
    }

    if (!contentId || typeof contentId !== "string") {
      return NextResponse.json({ error: "ID de conteúdo em falta." }, { status: 400 });
    }

    // Check for duplicate pending report
    const existing = await db
      .select({ id: reports.id })
      .from(reports)
      .where(
        and(
          eq(reports.reporterId, session.user.id),
          eq(reports.contentType, contentType),
          eq(reports.contentId, contentId),
          eq(reports.status, "pending"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Já submeteste uma denúncia para este conteúdo." },
        { status: 409 },
      );
    }

    await db.insert(reports).values({
      reporterId: session.user.id,
      contentType,
      contentId,
      reason,
      details: details?.trim() || null,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao submeter denúncia." }, { status: 500 });
  }
}
