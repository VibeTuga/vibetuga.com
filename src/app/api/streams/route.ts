import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getUpcomingStreams, getPastStreams, createStream } from "@/lib/db/queries/streams";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const [upcoming, past] = await Promise.all([getUpcomingStreams(50), getPastStreams(5)]);

  return NextResponse.json({ upcoming, past });
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { platform, title, description, scheduledAt, duration, vodUrl, thumbnailUrl, isLive } =
    body;

  if (!platform || !["twitch", "youtube"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (!title || typeof title !== "string" || title.length > 300) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }

  const stream = await createStream({
    platform,
    title: title.trim(),
    description: description?.trim() || undefined,
    scheduledAt: new Date(scheduledAt),
    duration: duration ? Number(duration) : undefined,
    vodUrl: vodUrl?.trim() || undefined,
    thumbnailUrl: thumbnailUrl?.trim() || undefined,
    isLive: isLive ?? false,
    createdBy: session.user.id,
  });

  return NextResponse.json(stream, { status: 201 });
}
