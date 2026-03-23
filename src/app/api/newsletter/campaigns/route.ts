import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterCampaigns } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { sendCampaign } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "moderator"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { subject, content, scheduledAt } = body as {
      subject?: string;
      content?: string;
      scheduledAt?: string;
    };

    if (!subject?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Assunto e conteúdo são obrigatórios" }, { status: 400 });
    }

    const [campaign] = await db
      .insert(newsletterCampaigns)
      .values({
        subject: subject.trim().slice(0, 255),
        content: content.trim(),
        status: "draft",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      })
      .returning();

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error("Campaign create error:", error);
    return NextResponse.json({ error: "Erro ao criar campanha" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["admin", "moderator"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body as { id?: string; action?: string };

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID da campanha obrigatório" }, { status: 400 });
    }

    if (action !== "send") {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const result = await sendCampaign(id);

    return NextResponse.json({ success: true, sent: result.sent });
  } catch (error) {
    console.error("Campaign send error:", error);
    const message = error instanceof Error ? error.message : "Erro ao enviar campanha";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
