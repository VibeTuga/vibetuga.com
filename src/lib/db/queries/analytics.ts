import { db } from "@/lib/db";
import { contentAnalytics } from "@/lib/db/schema";
import { eq, and, sql, gte, desc } from "drizzle-orm";

/**
 * Categorizes a referral URL into a known source bucket.
 */
export function categorizeReferralSource(referer: string | null, appDomain?: string): string {
  if (!referer) return "direct";

  try {
    const url = new URL(referer);
    const hostname = url.hostname.toLowerCase();

    if (appDomain && hostname.includes(appDomain)) return "internal";
    if (hostname.includes("google") || hostname.includes("bing") || hostname.includes("duckduckgo"))
      return "search";
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("facebook")) return "facebook";
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("discord")) return "discord";

    return hostname;
  } catch {
    return "direct";
  }
}

/**
 * Upserts a content view into contentAnalytics, incrementing views by 1
 * for the current date + referralSource combination.
 */
export async function recordContentView(
  contentType: string,
  contentId: string,
  referralSource: string | null,
) {
  const source = referralSource ?? "direct";
  const today = new Date().toISOString().split("T")[0];

  await db
    .insert(contentAnalytics)
    .values({
      contentType,
      contentId,
      date: today,
      views: 1,
      uniqueViews: 0,
      referralSource: source,
    })
    .onConflictDoUpdate({
      target: [
        contentAnalytics.contentType,
        contentAnalytics.contentId,
        contentAnalytics.date,
        contentAnalytics.referralSource,
      ],
      set: {
        views: sql`${contentAnalytics.views} + 1`,
      },
    });
}

/**
 * Returns daily view aggregates for the last N days, grouped by date,
 * with total views, unique views, and per-referralSource breakdown.
 */
export async function getContentAnalytics(
  contentType: string,
  contentId: string,
  days: number = 30,
) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const sinceDateStr = sinceDate.toISOString().split("T")[0];

  const rows = await db
    .select({
      date: contentAnalytics.date,
      referralSource: contentAnalytics.referralSource,
      views: contentAnalytics.views,
      uniqueViews: contentAnalytics.uniqueViews,
    })
    .from(contentAnalytics)
    .where(
      and(
        eq(contentAnalytics.contentType, contentType),
        eq(contentAnalytics.contentId, contentId),
        gte(contentAnalytics.date, sinceDateStr),
      ),
    )
    .orderBy(contentAnalytics.date);

  // Group by date
  const dailyMap = new Map<
    string,
    { date: string; views: number; uniqueViews: number; sources: Record<string, number> }
  >();

  for (const row of rows) {
    const existing = dailyMap.get(row.date);
    const source = row.referralSource ?? "direct";

    if (existing) {
      existing.views += row.views;
      existing.uniqueViews += row.uniqueViews;
      existing.sources[source] = (existing.sources[source] ?? 0) + row.views;
    } else {
      dailyMap.set(row.date, {
        date: row.date,
        views: row.views,
        uniqueViews: row.uniqueViews,
        sources: { [source]: row.views },
      });
    }
  }

  return Array.from(dailyMap.values());
}

/**
 * Returns total views, total unique views, views last 7 days, views last 30 days,
 * and top 5 referral sources with counts.
 */
export async function getContentAnalyticsSummary(contentType: string, contentId: string) {
  const now = new Date();
  const date7 = new Date(now);
  date7.setDate(date7.getDate() - 7);
  const date30 = new Date(now);
  date30.setDate(date30.getDate() - 30);

  const date7Str = date7.toISOString().split("T")[0];
  const date30Str = date30.toISOString().split("T")[0];

  // Total views
  const [totals] = await db
    .select({
      totalViews: sql<number>`coalesce(sum(${contentAnalytics.views}), 0)::int`,
      totalUniqueViews: sql<number>`coalesce(sum(${contentAnalytics.uniqueViews}), 0)::int`,
    })
    .from(contentAnalytics)
    .where(
      and(eq(contentAnalytics.contentType, contentType), eq(contentAnalytics.contentId, contentId)),
    );

  // Views last 7 days
  const [last7] = await db
    .select({
      views: sql<number>`coalesce(sum(${contentAnalytics.views}), 0)::int`,
    })
    .from(contentAnalytics)
    .where(
      and(
        eq(contentAnalytics.contentType, contentType),
        eq(contentAnalytics.contentId, contentId),
        gte(contentAnalytics.date, date7Str),
      ),
    );

  // Views last 30 days
  const [last30] = await db
    .select({
      views: sql<number>`coalesce(sum(${contentAnalytics.views}), 0)::int`,
    })
    .from(contentAnalytics)
    .where(
      and(
        eq(contentAnalytics.contentType, contentType),
        eq(contentAnalytics.contentId, contentId),
        gte(contentAnalytics.date, date30Str),
      ),
    );

  // Top 5 referral sources
  const topSources = await db
    .select({
      source: contentAnalytics.referralSource,
      count: sql<number>`coalesce(sum(${contentAnalytics.views}), 0)::int`,
    })
    .from(contentAnalytics)
    .where(
      and(eq(contentAnalytics.contentType, contentType), eq(contentAnalytics.contentId, contentId)),
    )
    .groupBy(contentAnalytics.referralSource)
    .orderBy(desc(sql`sum(${contentAnalytics.views})`))
    .limit(5);

  return {
    totalViews: totals?.totalViews ?? 0,
    totalUniqueViews: totals?.totalUniqueViews ?? 0,
    viewsLast7Days: last7?.views ?? 0,
    viewsLast30Days: last30?.views ?? 0,
    topReferralSources: topSources.map((s) => ({
      source: s.source ?? "direct",
      count: s.count,
    })),
  };
}
