import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storePurchases, stripeEvents, subscriptions } from "@/lib/db/schema";
import { constructWebhookEvent } from "@/lib/stripe";
import { awardXP } from "@/lib/gamification";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function isEventProcessed(stripeEventId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(eq(stripeEvents.stripeEventId, stripeEventId))
    .limit(1);

  return !!existing;
}

async function recordEvent(
  stripeEventId: string,
  eventType: string,
  payload: string,
  error?: string,
) {
  await db
    .insert(stripeEvents)
    .values({
      stripeEventId,
      eventType,
      payload,
      error: error ?? null,
    })
    .onConflictDoNothing();
}

function mapSubscriptionStatus(status: string): "active" | "canceled" | "past_due" | "trialing" {
  switch (status) {
    case "active":
      return "active";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    case "trialing":
      return "trialing";
    default:
      return "active";
  }
}

function mapPlan(interval: string): "monthly" | "yearly" {
  return interval === "year" ? "yearly" : "monthly";
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode === "subscription") {
    // Subscription checkout — handled by customer.subscription.created
    return;
  }

  // One-time product purchase
  const productId = session.metadata?.productId;
  const buyerId = session.metadata?.buyerId;

  if (productId && buyerId) {
    await db.insert(storePurchases).values({
      buyerId,
      productId,
      pricePaidCents: session.amount_total ?? 0,
      stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    });

    await awardXP(buyerId, "product_sold", productId);
  }
}

// Helper to safely extract period dates from a Stripe Subscription object.
// Stripe SDK versions vary in how they expose period fields.
function getSubscriptionPeriod(sub: Stripe.Subscription) {
  const raw = sub as unknown as Record<string, unknown>;
  const startTs =
    typeof raw.current_period_start === "number"
      ? raw.current_period_start
      : Math.floor(Date.now() / 1000);
  const endTs =
    typeof raw.current_period_end === "number"
      ? raw.current_period_end
      : Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

  return {
    currentPeriodStart: new Date(startTs * 1000),
    currentPeriodEnd: new Date(endTs * 1000),
  };
}

async function handleSubscriptionCreated(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (!userId) return;

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const plan = mapPlan(sub.items.data[0]?.plan?.interval ?? "month");
  const status = mapSubscriptionStatus(sub.status);
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(sub);

  // Upsert: if a subscription for this stripe_subscription_id already exists, update it
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        plan,
        status,
        stripeCustomerId: customerId,
        currentPeriodStart,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId,
      plan,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: customerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    });
  }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const status = mapSubscriptionStatus(sub.status);
  const plan = mapPlan(sub.items.data[0]?.plan?.interval ?? "month");
  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(sub);

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (!existing) return;

  await db
    .update(subscriptions)
    .set({
      plan,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, sub.id))
    .limit(1);

  if (!existing) return;

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const raw = invoice as unknown as Record<string, unknown>;
  if (typeof raw.subscription === "string") return raw.subscription;
  if (raw.subscription && typeof (raw.subscription as Record<string, unknown>).id === "string") {
    return (raw.subscription as Record<string, unknown>).id as string;
  }
  return null;
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subId = getInvoiceSubscriptionId(invoice);
  if (!subId) return;

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subId))
    .limit(1);

  if (!existing) return;

  // Renew the subscription period
  await db
    .update(subscriptions)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subId = getInvoiceSubscriptionId(invoice);
  if (!subId) return;

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subId))
    .limit(1);

  if (!existing) return;

  await db
    .update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, existing.id));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura em falta" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  // Idempotency check — skip already-processed events
  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch {
    // If idempotency check fails, still attempt to process
    // (better to risk duplicate processing than to drop events)
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    // Record successful processing
    await recordEvent(event.id, event.type, body).catch(() => null);

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Record the failure for debugging
    await recordEvent(event.id, event.type, body, errorMessage).catch(() => null);

    return NextResponse.json({ error: "Erro ao processar evento" }, { status: 500 });
  }
}
