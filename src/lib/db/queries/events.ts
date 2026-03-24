import { cache } from "react";
import { db } from "@/lib/db";
import { communityEvents, users } from "@/lib/db/schema";
import { eq, desc, gte, lte, count, asc } from "drizzle-orm";

const EVENTS_PER_PAGE = 12;

export const getUpcomingEvents = cache(async (limit: number = EVENTS_PER_PAGE) => {
  const now = new Date();

  return db
    .select({
      id: communityEvents.id,
      title: communityEvents.title,
      description: communityEvents.description,
      eventType: communityEvents.eventType,
      startAt: communityEvents.startAt,
      endAt: communityEvents.endAt,
      link: communityEvents.link,
      coverImage: communityEvents.coverImage,
      createdAt: communityEvents.createdAt,
      creatorName: users.discordUsername,
      creatorDisplayName: users.displayName,
    })
    .from(communityEvents)
    .leftJoin(users, eq(communityEvents.createdBy, users.id))
    .where(gte(communityEvents.startAt, now))
    .orderBy(asc(communityEvents.startAt))
    .limit(limit);
});

export const getPastEvents = cache(async (limit: number = EVENTS_PER_PAGE, offset: number = 0) => {
  const now = new Date();

  const [eventsResult, totalResult] = await Promise.all([
    db
      .select({
        id: communityEvents.id,
        title: communityEvents.title,
        description: communityEvents.description,
        eventType: communityEvents.eventType,
        startAt: communityEvents.startAt,
        endAt: communityEvents.endAt,
        link: communityEvents.link,
        coverImage: communityEvents.coverImage,
        createdAt: communityEvents.createdAt,
        creatorName: users.discordUsername,
        creatorDisplayName: users.displayName,
      })
      .from(communityEvents)
      .leftJoin(users, eq(communityEvents.createdBy, users.id))
      .where(lte(communityEvents.startAt, now))
      .orderBy(desc(communityEvents.startAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(communityEvents).where(lte(communityEvents.startAt, now)),
  ]);

  const total = totalResult[0]?.value ?? 0;

  return {
    events: eventsResult,
    total,
    totalPages: Math.ceil(total / limit),
  };
});

export const getEventById = cache(async (id: string) => {
  const [event] = await db
    .select({
      id: communityEvents.id,
      title: communityEvents.title,
      description: communityEvents.description,
      eventType: communityEvents.eventType,
      startAt: communityEvents.startAt,
      endAt: communityEvents.endAt,
      link: communityEvents.link,
      coverImage: communityEvents.coverImage,
      createdBy: communityEvents.createdBy,
      createdAt: communityEvents.createdAt,
      updatedAt: communityEvents.updatedAt,
      creatorName: users.discordUsername,
      creatorDisplayName: users.displayName,
    })
    .from(communityEvents)
    .leftJoin(users, eq(communityEvents.createdBy, users.id))
    .where(eq(communityEvents.id, id))
    .limit(1);

  return event ?? null;
});

export async function createEvent(data: {
  title: string;
  description?: string;
  eventType: "stream" | "workshop" | "challenge" | "meetup" | "other";
  startAt: Date;
  endAt?: Date;
  link?: string;
  coverImage?: string;
  createdBy: string;
}) {
  const [event] = await db.insert(communityEvents).values(data).returning();
  return event;
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    eventType: "stream" | "workshop" | "challenge" | "meetup" | "other";
    startAt: Date;
    endAt: Date | null;
    link: string | null;
    coverImage: string | null;
  }>,
) {
  const [event] = await db
    .update(communityEvents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(communityEvents.id, id))
    .returning();
  return event ?? null;
}

export async function deleteEvent(id: string) {
  const [event] = await db
    .delete(communityEvents)
    .where(eq(communityEvents.id, id))
    .returning({ id: communityEvents.id });
  return event ?? null;
}

export const getAllEvents = cache(async () => {
  return db
    .select({
      id: communityEvents.id,
      title: communityEvents.title,
      description: communityEvents.description,
      eventType: communityEvents.eventType,
      startAt: communityEvents.startAt,
      endAt: communityEvents.endAt,
      link: communityEvents.link,
      coverImage: communityEvents.coverImage,
      createdBy: communityEvents.createdBy,
      createdAt: communityEvents.createdAt,
      updatedAt: communityEvents.updatedAt,
      creatorName: users.discordUsername,
      creatorDisplayName: users.displayName,
    })
    .from(communityEvents)
    .leftJoin(users, eq(communityEvents.createdBy, users.id))
    .orderBy(desc(communityEvents.startAt));
});
