import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc, and, gt, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  let lastCheck = new Date();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(": heartbeat\n\n"));

      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
          clearInterval(pollInterval);
        }
      }, 30_000);

      const pollInterval = setInterval(async () => {
        try {
          const newNotifications = await db
            .select({
              id: notifications.id,
              type: notifications.type,
              title: notifications.title,
              body: notifications.body,
              link: notifications.link,
              isRead: notifications.isRead,
              actorId: notifications.actorId,
              referenceId: notifications.referenceId,
              createdAt: notifications.createdAt,
              actorDisplayName: users.displayName,
              actorImage: users.image,
            })
            .from(notifications)
            .leftJoin(users, eq(notifications.actorId, users.id))
            .where(and(eq(notifications.userId, userId), gt(notifications.createdAt, lastCheck)))
            .orderBy(desc(notifications.createdAt))
            .limit(10);

          if (newNotifications.length > 0) {
            lastCheck = new Date();

            // Get updated unread count
            const [unreadResult] = await db
              .select({ count: sql<number>`cast(count(*) as int)` })
              .from(notifications)
              .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

            const payload = JSON.stringify({
              notifications: newNotifications,
              unreadCount: unreadResult.count,
            });

            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          // DB query failed — skip this poll cycle
        }
      }, 5_000);

      // Clean up when the stream is cancelled
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        clearInterval(pollInterval);
      };

      // Store cleanup for cancel signal
      (controller as unknown as { _cleanup: () => void })._cleanup = cleanup;
    },
    cancel(controller) {
      const cleanup = (controller as unknown as { _cleanup?: () => void })._cleanup;
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
