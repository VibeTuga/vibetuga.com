import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  storePurchases,
  storeProducts,
  users,
  subscriptions,
  storeRefunds,
  stripeWebhookEvents,
} from "@/lib/db/schema";
import { constructWebhookEvent, stripe, getPlatformFeePercent } from "@/lib/stripe";
import { awardXP } from "@/lib/gamification";
import { sendPurchaseReceiptEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const runtime = "nodejs";

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

  // ─── Idempotency check ─────────────────────────────────────
  try {
    const [existing] = await db
      .select({ id: stripeWebhookEvents.id })
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.stripeEventId, event.id))
      .limit(1);

    if (existing) {
      return NextResponse.json({ received: true, deduplicated: true });
    }
  } catch (err) {
    logger.error({ err, eventId: event.id }, "Failed to check webhook idempotency");
    // Continue processing — better to risk a duplicate than to drop an event
  }

  // ─── Process event ─────────────────────────────────────────

  logger.info({ eventType: event.type, eventId: event.id }, "Stripe webhook event received");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutSessionCompleted(event);
        break;
      }

      case "account.updated": {
        await handleAccountUpdated(event);
        break;
      }

      case "customer.subscription.created": {
        await handleSubscriptionCreated(event);
        break;
      }

      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event);
        break;
      }

      case "charge.refunded": {
        await handleChargeRefunded(event);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    logger.error(
      { err, eventType: event.type, eventId: event.id },
      "Failed to process webhook event",
    );
    return NextResponse.json({ error: "Erro ao processar evento" }, { status: 500 });
  }

  // ─── Record processed event for idempotency ────────────────
  try {
    await db.insert(stripeWebhookEvents).values({
      stripeEventId: event.id,
      eventType: event.type,
      status: "processed",
    });
  } catch (err) {
    logger.error({ err, eventId: event.id }, "Failed to record webhook event");
    // Non-fatal — event was already processed successfully
  }

  logger.info({ eventType: event.type, eventId: event.id }, "Stripe webhook event processed");

  return NextResponse.json({ received: true });
}

// ─── Event Handlers ──────────────────────────────────────────

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const productId = session.metadata?.productId;
  const buyerId = session.metadata?.buyerId;

  if (!productId || !buyerId) return;

  const [insertedPurchase] = await db
    .insert(storePurchases)
    .values({
      buyerId,
      productId,
      pricePaidCents: session.amount_total ?? 0,
      stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .returning({ id: storePurchases.id });

  await awardXP(buyerId, "product_sold", productId);

  // Transfer funds to seller's Connect account if onboarded
  try {
    const [product] = await db
      .select({
        sellerId: storeProducts.sellerId,
        priceCents: storeProducts.priceCents,
      })
      .from(storeProducts)
      .where(eq(storeProducts.id, productId))
      .limit(1);

    if (product) {
      const [seller] = await db
        .select({
          stripeConnectAccountId: users.stripeConnectAccountId,
          stripeConnectOnboarded: users.stripeConnectOnboarded,
        })
        .from(users)
        .where(eq(users.id, product.sellerId))
        .limit(1);

      if (seller?.stripeConnectAccountId && seller.stripeConnectOnboarded) {
        const paymentIntent =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        if (paymentIntent) {
          const feePercent = getPlatformFeePercent();
          const amountPaid = session.amount_total ?? product.priceCents;
          const transferAmount = Math.round(amountPaid * ((100 - feePercent) / 100));

          if (transferAmount > 0) {
            const transfer = await stripe.transfers.create({
              amount: transferAmount,
              currency: "eur",
              destination: seller.stripeConnectAccountId,
              source_transaction: paymentIntent,
              metadata: {
                productId,
                buyerId,
                purchaseId: insertedPurchase?.id ?? "",
              },
            });

            if (insertedPurchase?.id) {
              await db
                .update(storePurchases)
                .set({ stripeTransferId: transfer.id })
                .where(eq(storePurchases.id, insertedPurchase.id));
            }
          }
        }
      }
    }
  } catch (transferErr) {
    logger.error({ err: transferErr, productId, buyerId }, "Failed to create Connect transfer");
    // Transfer failure should not fail the webhook
  }

  // Send purchase receipt email (non-blocking)
  try {
    const [buyer] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, buyerId))
      .limit(1);

    if (buyer?.email) {
      const [product] = await db
        .select({
          title: storeProducts.title,
          productType: storeProducts.productType,
          downloadKey: storeProducts.downloadKey,
          sellerName: users.discordUsername,
          sellerDisplayName: users.displayName,
        })
        .from(storeProducts)
        .leftJoin(users, eq(storeProducts.sellerId, users.id))
        .where(eq(storeProducts.id, productId))
        .limit(1);

      if (product) {
        await sendPurchaseReceiptEmail(buyer.email, {
          productTitle: product.title,
          productType: product.productType,
          sellerName: product.sellerDisplayName ?? product.sellerName ?? "VibeTuga",
          priceCents: session.amount_total ?? 0,
          purchaseDate: new Date(),
          downloadKey: product.downloadKey,
        });
      }
    }
  } catch (emailErr) {
    logger.error({ err: emailErr, buyerId, productId }, "Failed to send purchase receipt email");
  }
}

async function handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;

  if (account.charges_enabled) {
    await db
      .update(users)
      .set({
        stripeConnectOnboarded: true,
        updatedAt: new Date(),
      })
      .where(eq(users.stripeConnectAccountId, account.id));
  }
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const userId = sub.metadata?.userId;

  if (!userId) return;

  const firstItem = sub.items.data[0];
  const plan = firstItem?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
  const periodStart = firstItem?.current_period_start ?? Math.floor(Date.now() / 1000);
  const periodEnd = firstItem?.current_period_end ?? Math.floor(Date.now() / 1000);

  await db.insert(subscriptions).values({
    userId,
    plan,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : (sub.customer?.id ?? null),
    status: "active",
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;

  if (!sub.id) return;

  const statusMap: Record<string, "active" | "canceled" | "past_due"> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete_expired: "canceled",
  };

  const mappedStatus = statusMap[sub.status] ?? "active";
  const firstItem = sub.items.data[0];
  const periodStart = firstItem?.current_period_start ?? Math.floor(Date.now() / 1000);
  const periodEnd = firstItem?.current_period_end ?? Math.floor(Date.now() / 1000);

  await db
    .update(subscriptions)
    .set({
      status: mappedStatus,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id));
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;

  if (!sub.id) return;

  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, sub.id));
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const refund = charge.refunds?.data?.[0];

  if (!refund?.id) return;

  // Find and update any store_refund matching this Stripe refund
  await db
    .update(storeRefunds)
    .set({
      status: "refunded",
      stripeRefundId: refund.id,
      resolvedAt: new Date(),
    })
    .where(eq(storeRefunds.stripeRefundId, refund.id));

  // Also try matching by payment intent on the purchase
  if (typeof charge.payment_intent === "string") {
    const [purchase] = await db
      .select({ id: storePurchases.id })
      .from(storePurchases)
      .where(eq(storePurchases.stripePaymentId, charge.payment_intent))
      .limit(1);

    if (purchase) {
      // Update any pending refund for this purchase
      await db
        .update(storeRefunds)
        .set({
          status: "refunded",
          stripeRefundId: refund.id,
          resolvedAt: new Date(),
        })
        .where(eq(storeRefunds.purchaseId, purchase.id));
    }
  }
}
