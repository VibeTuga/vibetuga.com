import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { directMessages, users } from "@/lib/db/schema";
import { eq, or, and, desc, sql } from "drizzle-orm";

// GET /api/messages/[userId] — get messages between current user and [userId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { userId } = await params;
  const currentUserId = session.user.id;

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 50;

  // Mark all unread messages FROM [userId] TO current user as read
  await db
    .update(directMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(directMessages.senderId, userId),
        eq(directMessages.recipientId, currentUserId),
        eq(directMessages.isRead, false),
      ),
    );

  // Fetch messages between the two users
  const conditions = [
    and(eq(directMessages.senderId, currentUserId), eq(directMessages.recipientId, userId)),
    and(eq(directMessages.senderId, userId), eq(directMessages.recipientId, currentUserId)),
  ];

  const cursorCondition = cursor ? sql`${directMessages.id} < ${Number(cursor)}` : undefined;

  const messages = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      recipientId: directMessages.recipientId,
      content: directMessages.content,
      isRead: directMessages.isRead,
      createdAt: directMessages.createdAt,
      senderDisplayName: users.displayName,
      senderImage: users.image,
      senderDiscordUsername: users.discordUsername,
    })
    .from(directMessages)
    .leftJoin(users, eq(directMessages.senderId, users.id))
    .where(cursorCondition ? and(or(...conditions), cursorCondition) : or(...conditions))
    .orderBy(desc(directMessages.id))
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const results = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? results[results.length - 1].id : null;

  return NextResponse.json({
    messages: results,
    nextCursor,
    hasMore,
  });
}
