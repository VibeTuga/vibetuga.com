import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { featureFlags } from "@/lib/db/schema";
import { getFeatureFlags, invalidateFlagCache } from "@/lib/feature-flags";

export async function GET() {
  const session = await auth();
  if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const flags = await getFeatureFlags();
  return NextResponse.json(flags);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { key, description, isEnabled, rolloutPercentage } = body;

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Chave é obrigatória" }, { status: 400 });
  }

  const sanitizedKey = key
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/(^_|_$)/g, "");

  if (!sanitizedKey) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  const [flag] = await db
    .insert(featureFlags)
    .values({
      key: sanitizedKey,
      description: description || null,
      isEnabled: isEnabled ?? false,
      rolloutPercentage:
        typeof rolloutPercentage === "number" ? Math.max(0, Math.min(100, rolloutPercentage)) : 100,
    })
    .returning();

  invalidateFlagCache();
  return NextResponse.json(flag, { status: 201 });
}
