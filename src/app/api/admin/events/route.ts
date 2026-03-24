import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createEvent } from "@/lib/db/queries/events";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, eventType, startAt, endAt, link, coverImage } = body;

    if (!title || !eventType || !startAt) {
      return NextResponse.json(
        { error: "Título, tipo e data de início são obrigatórios." },
        { status: 400 },
      );
    }

    const validTypes = ["stream", "workshop", "challenge", "meetup", "other"];
    if (!validTypes.includes(eventType)) {
      return NextResponse.json({ error: "Tipo de evento inválido." }, { status: 400 });
    }

    const event = await createEvent({
      title: String(title).slice(0, 200),
      description: description ? String(description) : undefined,
      eventType,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : undefined,
      link: link ? String(link).slice(0, 512) : undefined,
      coverImage: coverImage ? String(coverImage).slice(0, 512) : undefined,
      createdBy: session.user.id!,
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar evento." }, { status: 500 });
  }
}
