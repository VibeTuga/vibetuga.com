import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storePurchases, storeProducts, users } from "@/lib/db/schema";
import { constructWebhookEvent } from "@/lib/stripe";
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
        await db.insert(storePurchases).values({
          buyerId,
          productId,
          pricePaidCents: session.amount_total ?? 0,
          stripePaymentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
        });

        await awardXP(buyerId, "product_sold", productId);
      } catch {
        return NextResponse.json({ error: "Erro ao processar compra" }, { status: 500 });
      }

      // Send purchase receipt email (non-blocking — don't fail webhook on email error)
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

  return NextResponse.json({ received: true });
}
