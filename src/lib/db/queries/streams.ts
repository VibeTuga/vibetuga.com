import { cache } from "react";
import { db } from "@/lib/db";
import { streamSchedule, users } from "@/lib/db/schema";
import { eq, desc, gte, lte, asc, or } from "drizzle-orm";

const streamFields = {
  id: streamSchedule.id,
  platform: streamSchedule.platform,
  title: streamSchedule.title,
  description: streamSchedule.description,
  scheduledAt: streamSchedule.scheduledAt,
  duration: streamSchedule.duration,
  vodUrl: streamSchedule.vodUrl,
  thumbnailUrl: streamSchedule.thumbnailUrl,
  isLive: streamSchedule.isLive,
  createdBy: streamSchedule.createdBy,
  createdAt: streamSchedule.createdAt,
  updatedAt: streamSchedule.updatedAt,
  creatorName: users.discordUsername,
  creatorDisplayName: users.displayName,
} as const;

export const getLiveStream = cache(async () => {
  const [stream] = await db
    .select({
      id: streamSchedule.id,
      platform: streamSchedule.platform,
      title: streamSchedule.title,
    })
    .from(streamSchedule)
    .where(eq(streamSchedule.isLive, true))
    .limit(1);

  return stream ?? null;
});

export const getUpcomingStreams = cache(async (limit: number = 20) => {
  const now = new Date();

  return db
    .select(streamFields)
    .from(streamSchedule)
    .leftJoin(users, eq(streamSchedule.createdBy, users.id))
    .where(gte(streamSchedule.scheduledAt, now))
    .orderBy(asc(streamSchedule.scheduledAt))
    .limit(limit);
});

export const getPastStreams = cache(async (limit: number = 5) => {
  const now = new Date();

  return db
    .select(streamFields)
    .from(streamSchedule)
    .leftJoin(users, eq(streamSchedule.createdBy, users.id))
    .where(lte(streamSchedule.scheduledAt, now))
    .orderBy(desc(streamSchedule.scheduledAt))
    .limit(limit);
});

export const getLiveAndUpcomingStreams = cache(async () => {
  const now = new Date();

  return db
    .select(streamFields)
    .from(streamSchedule)
    .leftJoin(users, eq(streamSchedule.createdBy, users.id))
    .where(or(eq(streamSchedule.isLive, true), gte(streamSchedule.scheduledAt, now)))
    .orderBy(desc(streamSchedule.isLive), asc(streamSchedule.scheduledAt));
});

export const getAllStreams = cache(async () => {
  return db
    .select(streamFields)
    .from(streamSchedule)
    .leftJoin(users, eq(streamSchedule.createdBy, users.id))
    .orderBy(desc(streamSchedule.scheduledAt));
});

export const getStreamById = cache(async (id: string) => {
  const [stream] = await db
    .select(streamFields)
    .from(streamSchedule)
    .leftJoin(users, eq(streamSchedule.createdBy, users.id))
    .where(eq(streamSchedule.id, id))
    .limit(1);

  return stream ?? null;
});

export async function createStream(data: {
  platform: "twitch" | "youtube";
  title: string;
  description?: string;
  scheduledAt: Date;
  duration?: number;
  vodUrl?: string;
  thumbnailUrl?: string;
  isLive?: boolean;
  createdBy: string;
}) {
  const [stream] = await db.insert(streamSchedule).values(data).returning();
  return stream;
}

export async function updateStream(
  id: string,
  data: Partial<{
    platform: "twitch" | "youtube";
    title: string;
    description: string | null;
    scheduledAt: Date;
    duration: number | null;
    vodUrl: string | null;
    thumbnailUrl: string | null;
    isLive: boolean;
  }>,
) {
  const [stream] = await db
    .update(streamSchedule)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(streamSchedule.id, id))
    .returning();
  return stream ?? null;
}

export async function deleteStream(id: string) {
  const [stream] = await db
    .delete(streamSchedule)
    .where(eq(streamSchedule.id, id))
    .returning({ id: streamSchedule.id });
  return stream ?? null;
}
