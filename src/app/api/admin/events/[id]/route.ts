import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateEvent, deleteEvent, getEventById } from "@/lib/db/queries/events";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await getEventById(id);
    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = String(body.title).slice(0, 200);
    if (body.description !== undefined) updates.description = body.description;
    if (body.eventType !== undefined) {
      const validTypes = ["stream", "workshop", "challenge", "meetup", "other"];
      if (!validTypes.includes(body.eventType)) {
        return NextResponse.json({ error: "Tipo de evento inválido." }, { status: 400 });
      }
      updates.eventType = body.eventType;
    }
    if (body.startAt !== undefined) updates.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updates.endAt = body.endAt ? new Date(body.endAt) : null;
    if (body.link !== undefined) updates.link = body.link ? String(body.link).slice(0, 512) : null;
    if (body.coverImage !== undefined)
      updates.coverImage = body.coverImage ? String(body.coverImage).slice(0, 512) : null;

    const event = await updateEvent(id, updates);
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar evento." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  if (!["admin", "moderator"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar evento." }, { status: 500 });
  }
}
