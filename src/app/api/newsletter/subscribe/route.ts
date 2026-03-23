import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source = "website" } = body as { email?: string; source?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing subscriber
    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalizedEmail))
      .limit(1);

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ error: "Email já subscrito" }, { status: 409 });
      }
      // Re-subscribe if previously unsubscribed/bounced
      await db
        .update(newsletterSubscribers)
        .set({ status: "active", unsubscribedAt: null })
        .where(eq(newsletterSubscribers.email, normalizedEmail));

      return NextResponse.json({ success: true, message: "Subscrito com sucesso!" });
    }

    // Check if logged-in user to link userId
    const session = await auth();
    const userId = session?.user?.id ?? null;

    await db.insert(newsletterSubscribers).values({
      email: normalizedEmail,
      userId: userId ?? undefined,
      status: "active",
      source: source.trim().slice(0, 100),
    });

    return NextResponse.json({ success: true, message: "Subscrito com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Erro interno. Tenta novamente." }, { status: 500 });
  }
}
