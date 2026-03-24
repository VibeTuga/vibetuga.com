import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
    .returning({ id: apiKeys.id });

  if (!deleted) {
    return NextResponse.json({ error: "Chave API não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
