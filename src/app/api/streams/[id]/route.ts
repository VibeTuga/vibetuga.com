import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getStreamById, updateStream, deleteStream } from "@/lib/db/queries/streams";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const privilegedRoles = ["admin", "moderator"];
  if (!privilegedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getStreamById(id);
  if (!existing) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.platform !== undefined) {
    if (!["twitch", "youtube"].includes(body.platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }
    updates.platform = body.platform;
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.length > 300) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    updates.title = body.title.trim();
  }
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.scheduledAt !== undefined) updates.scheduledAt = new Date(body.scheduledAt);
  if (body.duration !== undefined) updates.duration = body.duration ? Number(body.duration) : null;
  if (body.vodUrl !== undefined) updates.vodUrl = body.vodUrl?.trim() || null;
  if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl?.trim() || null;
  if (body.isLive !== undefined) updates.isLive = Boolean(body.isLive);

  const stream = await updateStream(id, updates);
  return NextResponse.json(stream);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const privilegedRoles = ["admin", "moderator"];
  if (!privilegedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteStream(id);
  if (!deleted) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
