import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterCampaigns } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

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
