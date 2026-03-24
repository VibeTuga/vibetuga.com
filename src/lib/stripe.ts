import Stripe from "stripe";
import { db } from "@/lib/db";
import { storeProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SUBSCRIPTION_PRICES } from "@/lib/subscription-plans";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("STRIPE_SECRET_KEY is required in production");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  typescript: true,
});

export async function createCheckoutSession(
  productId: string,
  buyerId: string,
  successUrl: string,
  cancelUrl: string,
) {
  const [product] = await db
    .select()
    .from(storeProducts)
    .where(eq(storeProducts.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "approved") {
    throw new Error("Product is not available for purchase");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.title,
            description: product.description ?? undefined,
            images: product.coverImage ? [product.coverImage] : undefined,
          },
          unit_amount: product.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      productId: product.id,
      buyerId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createSubscriptionCheckout(
  userId: string,
  plan: "monthly" | "yearly",
  customerEmail: string | undefined,
  successUrl: string,
  cancelUrl: string,
) {
  const priceConfig = SUBSCRIPTION_PRICES[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: priceConfig.name,
            description:
              plan === "yearly"
                ? "Acesso premium anual à VibeTuga — poupa 33%!"
                : "Acesso premium mensal à VibeTuga",
          },
          unit_amount: priceConfig.amount,
          recurring: {
            interval: priceConfig.interval,
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
    customer_email: customerEmail,
    metadata: {
      userId,
      plan,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function cancelStripeSubscription(stripeSubscriptionId: string) {
  return stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
}

export function constructWebhookEvent(body: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
