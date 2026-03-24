import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { createSubscriptionCheckout, cancelStripeSubscription } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";
import { eq, and } from "drizzle-orm";

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

    // Check if user already has an active subscription
    const [existing] = await db
      .select({ id: subscriptions.id, status: subscriptions.status })
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Já tens uma subscrição ativa." }, { status: 409 });
    }

    const origin = new URL(request.url).origin;
    const checkoutSession = await createSubscriptionCheckout(
      session.user.id,
      plan as "monthly" | "yearly",
      session.user.email ?? undefined,
      `${origin}/store?subscription=success`,
      `${origin}/store?subscription=canceled`,
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar sessão";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    // Find the user's active subscription
    const [sub] = await db
      .select({
        id: subscriptions.id,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
      .limit(1);

    if (!sub) {
      return NextResponse.json({ error: "Nenhuma subscrição ativa encontrada." }, { status: 404 });
    }

    if (!sub.stripeSubscriptionId) {
      return NextResponse.json({ error: "Subscrição sem ID Stripe associado." }, { status: 400 });
    }

    // Cancel at period end via Stripe
    await cancelStripeSubscription(sub.stripeSubscriptionId);

    // Update our DB to reflect cancellation pending
    await db
      .update(subscriptions)
      .set({
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ canceled: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao cancelar subscrição";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
