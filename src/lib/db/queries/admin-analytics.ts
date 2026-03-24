import { cache } from "react";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  storeProducts,
  storePurchases,
  xpEvents,
  contentAnalytics,
} from "@/lib/db/schema";
import { count, sql, gte, and, eq, desc } from "drizzle-orm";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getAdminAnalytics = cache(async () => {
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const sevenDaysAgo = daysAgo(7);

  const [
    totalUsersResult,
    newUsersWeekResult,
    newUsersMonthResult,
    prevWeekUsersResult,
    totalPostsResult,
    postsWeekResult,
    prevWeekPostsResult,
    totalProductsResult,
    revenueMonthResult,
    activeUsersResult,
    prevWeekActiveResult,
    topReferralResult,
  ] = await Promise.all([
    // Total users
    db.select({ value: count() }).from(users),

    // New users this week
    db.select({ value: count() }).from(users).where(gte(users.createdAt, weekStart)),

    // New users this month
    db.select({ value: count() }).from(users).where(gte(users.createdAt, monthStart)),

    // New users previous week (for WoW change)
    db
      .select({ value: count() })
      .from(users)
      .where(and(gte(users.createdAt, prevWeekStart), sql`${users.createdAt} < ${weekStart}`)),

    // Total posts
    db.select({ value: count() }).from(blogPosts),

    // Posts this week
    db
      .select({ value: count() })
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), gte(blogPosts.createdAt, weekStart))),

    // Posts previous week
    db
      .select({ value: count() })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.status, "published"),
          gte(blogPosts.createdAt, prevWeekStart),
          sql`${blogPosts.createdAt} < ${weekStart}`,
        ),
      ),

    // Total products
    db.select({ value: count() }).from(storeProducts).where(eq(storeProducts.status, "approved")),

    // Revenue this month
    db
      .select({
        value: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
      })
      .from(storePurchases)
      .where(gte(storePurchases.createdAt, monthStart)),

    // Active users (with xp_events in last 7 days)
    db
      .select({
        value: sql<number>`count(distinct ${xpEvents.userId})::int`,
      })
      .from(xpEvents)
      .where(gte(xpEvents.createdAt, sevenDaysAgo)),

    // Previous week active users
    db
      .select({
        value: sql<number>`count(distinct ${xpEvents.userId})::int`,
      })
      .from(xpEvents)
      .where(
        and(gte(xpEvents.createdAt, daysAgo(14)), sql`${xpEvents.createdAt} < ${sevenDaysAgo}`),
      ),

    // Top referral sources
    db
      .select({
        source: contentAnalytics.referralSource,
        totalViews: sql<number>`coalesce(sum(${contentAnalytics.views}), 0)::int`,
      })
      .from(contentAnalytics)
      .groupBy(contentAnalytics.referralSource)
      .orderBy(desc(sql`sum(${contentAnalytics.views})`))
      .limit(5),
  ]);

  const totalUsers = totalUsersResult[0]?.value ?? 0;
  const newUsersWeek = newUsersWeekResult[0]?.value ?? 0;
  const newUsersMonth = newUsersMonthResult[0]?.value ?? 0;
  const prevWeekUsers = prevWeekUsersResult[0]?.value ?? 0;
  const totalPosts = totalPostsResult[0]?.value ?? 0;
  const postsWeek = postsWeekResult[0]?.value ?? 0;
  const prevWeekPosts = prevWeekPostsResult[0]?.value ?? 0;
  const totalProducts = totalProductsResult[0]?.value ?? 0;
  const revenueMonth = revenueMonthResult[0]?.value ?? 0;
  const activeUsers = activeUsersResult[0]?.value ?? 0;
  const prevWeekActive = prevWeekActiveResult[0]?.value ?? 0;

  function wowChange(current: number, previous: number): string | null {
    if (previous === 0) return current > 0 ? "+100%" : null;
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  }

  return {
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    usersWowChange: wowChange(newUsersWeek, prevWeekUsers),
    totalPosts,
    postsWeek,
    postsWowChange: wowChange(postsWeek, prevWeekPosts),
    totalProducts,
    revenueMonthCents: revenueMonth,
    activeUsers,
    activeUsersWowChange: wowChange(activeUsers, prevWeekActive),
    topReferralSources: topReferralResult.map((r) => ({
      source: r.source ?? "direct",
      views: r.totalViews,
    })),
  };
});
