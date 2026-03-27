import { cache } from "react";
import { db } from "@/lib/db";
import { users, xpEvents } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface StreakActivity {
  date: string;
  count: number;
}

export interface StreakData {
  activities: StreakActivity[];
  currentStreak: number;
  longestStreak: number;
  streakFreezeUsedAt: string | null;
}

export const getUserStreakData = cache(async (userId: string): Promise<StreakData> => {
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const [activitiesResult, userResult] = await Promise.all([
    db
      .select({
        date: sql<string>`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, userId), gte(xpEvents.createdAt, oneYearAgo)))
      .groupBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${xpEvents.createdAt}, 'YYYY-MM-DD')`),

    db
      .select({
        streakDays: users.streakDays,
        longestStreak: users.longestStreak,
        streakFreezeUsedAt: users.streakFreezeUsedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  ]);

  const user = userResult[0];

  return {
    activities: activitiesResult,
    currentStreak: user?.streakDays ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    streakFreezeUsedAt: user?.streakFreezeUsedAt?.toISOString() ?? null,
  };
});
