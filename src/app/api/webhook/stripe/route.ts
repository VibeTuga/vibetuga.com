import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storePurchases, storeProducts, users } from "@/lib/db/schema";
import { constructWebhookEvent, stripe, getPlatformFeePercent } from "@/lib/stripe";
import { awardXP } from "@/lib/gamification";
import { sendPurchaseReceiptEmail } from "@/lib/email";
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const productId = session.metadata?.productId;
    const buyerId = session.metadata?.buyerId;

    if (productId && buyerId) {
      try {
        const [insertedPurchase] = await db
          .insert(storePurchases)
          .values({
            buyerId,
            productId,
            pricePaidCents: session.amount_total ?? 0,
            stripePaymentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
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

                  // Record transfer ID on the purchase
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
          console.error("Failed to create Connect transfer:", transferErr);
          // Transfer failure should not fail the webhook
        }
      } catch {
        return NextResponse.json({ error: "Erro ao processar compra" }, { status: 500 });
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
        console.error("Failed to send purchase receipt email:", emailErr);
      }
    }
  }

  // Handle Stripe Connect account updates
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    if (account.charges_enabled) {
      try {
        await db
          .update(users)
          .set({
            stripeConnectOnboarded: true,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeConnectAccountId, account.id));
      } catch (err) {
        console.error("Failed to update Connect onboarding status:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
