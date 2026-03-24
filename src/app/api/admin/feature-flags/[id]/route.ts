import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { invalidateFlagCache } from "@/lib/feature-flags";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof body.isEnabled === "boolean") {
    updates.isEnabled = body.isEnabled;
  }

  if (typeof body.rolloutPercentage === "number") {
    updates.rolloutPercentage = Math.max(0, Math.min(100, body.rolloutPercentage));
  }

  if (typeof body.description === "string") {
    updates.description = body.description || null;
  }

  if (typeof body.key === "string") {
    updates.key = body.key
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/(^_|_$)/g, "");
  }

  const [flag] = await db
    .update(featureFlags)
    .set(updates)
    .where(eq(featureFlags.id, id))
    .returning();

  if (!flag) {
    return NextResponse.json({ error: "Flag não encontrada" }, { status: 404 });
  }

  invalidateFlagCache();
  return NextResponse.json(flag);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const [deleted] = await db.delete(featureFlags).where(eq(featureFlags.id, id)).returning();

  if (!deleted) {
    return NextResponse.json({ error: "Flag não encontrada" }, { status: 404 });
  }

  invalidateFlagCache();
  return NextResponse.json({ success: true });
}
