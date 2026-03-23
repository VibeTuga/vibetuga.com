import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "moderator") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, resolvedNote } = body;

  if (!status || !["resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const existing = await db
    .select({ id: reports.id })
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Denúncia não encontrada." }, { status: 404 });
  }

  await db
    .update(reports)
    .set({
      status,
      resolvedBy: session.user.id,
      resolvedNote: resolvedNote?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, id));

  return NextResponse.json({ success: true });
}
