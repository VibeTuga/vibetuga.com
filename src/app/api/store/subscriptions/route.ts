import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 5 });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "Plano inválido. Escolhe 'monthly' ou 'yearly'." },
        { status: 400 },
      );
    }

    const existing = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Já tens uma subscrição ativa." }, { status: 409 });
    }

    const priceId =
      plan === "monthly" ? process.env.STRIPE_MONTHLY_PRICE_ID : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Plano de preço não configurado." }, { status: 500 });
    }

    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const origin = new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user?.email ?? undefined,
      metadata: {
        userId: session.user.id,
        plan,
      },
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/store?subscription=canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json({ error: "Erro ao criar sessão de subscrição." }, { status: 500 });
  }
}

export async function DELETE(_request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
      .limit(1);

    if (!sub) {
      return NextResponse.json({ error: "Nenhuma subscrição ativa encontrada." }, { status: 404 });
    }

    if (!sub.stripeSubscriptionId) {
      return NextResponse.json({ error: "Subscrição sem ID do Stripe." }, { status: 400 });
    }

    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);

    await db
      .update(subscriptions)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ message: "Subscrição cancelada com sucesso." });
  } catch {
    return NextResponse.json({ error: "Erro ao cancelar subscrição." }, { status: 500 });
  }
}
