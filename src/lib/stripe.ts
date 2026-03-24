import Stripe from "stripe";
import { db } from "@/lib/db";
import { storeProducts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

export function constructWebhookEvent(body: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

// ─── Stripe Connect Helpers ──────────────────────────────────

export async function createConnectAccount(userId: string, email: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: { vibetuga_user_id: userId },
  });
  return account.id;
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
}

export async function getAccountBalance(accountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });
  return balance;
}

export async function createLoginLink(accountId: string) {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

export function getPlatformFeePercent() {
  const fee = parseInt(process.env.STRIPE_CONNECT_PLATFORM_FEE_PERCENT ?? "15", 10);
  return Number.isNaN(fee) ? 15 : fee;
}
