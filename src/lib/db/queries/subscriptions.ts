import { cache } from "react";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";

export const isPremium = cache(async (userId: string): Promise<boolean> => {
  const [sub] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        or(eq(subscriptions.status, "active"), eq(subscriptions.status, "trialing")),
      ),
    )
    .limit(1);

  return !!sub;
});

export const getUserSubscription = cache(async (userId: string) => {
  const [sub] = await db
    .select({
      id: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      canceledAt: subscriptions.canceledAt,
      createdAt: subscriptions.createdAt,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trialing"),
          eq(subscriptions.status, "past_due"),
        ),
      ),
    )
    .limit(1);

  return sub ?? null;
});

export type UserSubscription = NonNullable<Awaited<ReturnType<typeof getUserSubscription>>>;
