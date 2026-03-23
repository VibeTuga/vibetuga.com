import { db } from "@/lib/db";
import { notifications, userSettings, userFollows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const NOTIFICATION_TYPES = {
  NEW_FOLLOWER: "new_follower",
  COMMENT_REPLY: "comment_reply",
  POST_APPROVED: "post_approved",
  XP_MILESTONE: "xp_milestone",
  BADGE_EARNED: "badge_earned",
  POST_LIKED: "post_liked",
  PROJECT_FEATURED: "project_featured",
  MENTION: "mention",
  REFERRAL_COMPLETED: "referral_completed",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  actorId?: string;
  referenceId?: string;
}

async function hasInAppNotificationsEnabled(userId: string): Promise<boolean> {
  const [settings] = await db
    .select({ inAppNotifications: userSettings.inAppNotifications })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  // Default to true if no settings row exists
  return settings?.inAppNotifications ?? true;
}

export async function createNotification(data: CreateNotificationData): Promise<void> {
  // Don't notify yourself
  if (data.actorId && data.actorId === data.userId) return;

  const enabled = await hasInAppNotificationsEnabled(data.userId);
  if (!enabled) return;

  await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    body: data.body ?? null,
    link: data.link ?? null,
    actorId: data.actorId ?? null,
    referenceId: data.referenceId ?? null,
  });
}

export async function createNotificationForFollowers(
  actorId: string,
  data: Omit<CreateNotificationData, "userId" | "actorId">,
): Promise<void> {
  const followers = await db
    .select({ followerId: userFollows.followerId })
    .from(userFollows)
    .where(eq(userFollows.followingId, actorId));

  if (followers.length === 0) return;

  const notificationsToInsert: CreateNotificationData[] = [];

  for (const { followerId } of followers) {
    const enabled = await hasInAppNotificationsEnabled(followerId);
    if (!enabled) continue;

    notificationsToInsert.push({
      userId: followerId,
      actorId,
      ...data,
    });
  }

  if (notificationsToInsert.length === 0) return;

  await db.insert(notifications).values(
    notificationsToInsert.map((n) => ({
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
      actorId: n.actorId ?? null,
      referenceId: n.referenceId ?? null,
    })),
  );
}
