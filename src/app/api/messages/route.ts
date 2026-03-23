import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { directMessages, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

const messageLimiter = rateLimit({ interval: 60_000, limit: 20 });

// GET /api/messages — conversation list
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id;

  // Get conversations: for each conversation partner, get latest message + unread count
  const conversations = await db.execute(sql`
    WITH conversation_partners AS (
      SELECT DISTINCT
        CASE
          WHEN sender_id = ${userId} THEN recipient_id
          ELSE sender_id
        END AS partner_id
      FROM direct_message
      WHERE sender_id = ${userId} OR recipient_id = ${userId}
    ),
    latest_messages AS (
      SELECT DISTINCT ON (
        CASE
          WHEN dm.sender_id = ${userId} THEN dm.recipient_id
          ELSE dm.sender_id
        END
      )
        dm.id,
        dm.content,
        dm.sender_id,
        dm.recipient_id,
        dm.is_read,
        dm.created_at,
        CASE
          WHEN dm.sender_id = ${userId} THEN dm.recipient_id
          ELSE dm.sender_id
        END AS partner_id
      FROM direct_message dm
      WHERE dm.sender_id = ${userId} OR dm.recipient_id = ${userId}
      ORDER BY
        CASE
          WHEN dm.sender_id = ${userId} THEN dm.recipient_id
          ELSE dm.sender_id
        END,
        dm.created_at DESC
    ),
    unread_counts AS (
      SELECT
        sender_id AS partner_id,
        COUNT(*)::int AS unread_count
      FROM direct_message
      WHERE recipient_id = ${userId} AND is_read = false
      GROUP BY sender_id
    )
    SELECT
      lm.id,
      lm.content,
      lm.sender_id AS "senderId",
      lm.recipient_id AS "recipientId",
      lm.is_read AS "isRead",
      lm.created_at AS "createdAt",
      lm.partner_id AS "partnerId",
      COALESCE(uc.unread_count, 0) AS "unreadCount",
      u.display_name AS "partnerDisplayName",
      u.discord_username AS "partnerDiscordUsername",
      u.image AS "partnerImage",
      u.is_verified AS "partnerIsVerified"
    FROM latest_messages lm
    LEFT JOIN unread_counts uc ON uc.partner_id = lm.partner_id
    LEFT JOIN "user" u ON u.id = lm.partner_id
    ORDER BY lm.created_at DESC
  `);

  return NextResponse.json({ conversations: conversations.rows });
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = messageLimiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas mensagens. Tenta novamente em breve." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const { recipientId, content } = body;

  if (!recipientId || typeof recipientId !== "string") {
    return NextResponse.json({ error: "Destinatário inválido." }, { status: 400 });
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Mensagem não pode estar vazia." }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { error: "Mensagem não pode exceder 2000 caracteres." },
      { status: 400 },
    );
  }

  if (recipientId === session.user.id) {
    return NextResponse.json({ error: "Não podes enviar mensagens a ti mesmo." }, { status: 400 });
  }

  // Check recipient exists and is not banned
  const [recipient] = await db
    .select({ id: users.id, isBanned: users.isBanned, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, recipientId))
    .limit(1);

  if (!recipient) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  if (recipient.isBanned) {
    return NextResponse.json(
      { error: "Não é possível enviar mensagem a este utilizador." },
      { status: 403 },
    );
  }

  // Check sender is not banned
  const [sender] = await db
    .select({ isBanned: users.isBanned, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (sender?.isBanned) {
    return NextResponse.json({ error: "A tua conta está suspensa." }, { status: 403 });
  }

  const [message] = await db
    .insert(directMessages)
    .values({
      senderId: session.user.id,
      recipientId,
      content: content.trim(),
    })
    .returning();

  // Create notification for recipient
  await createNotification({
    userId: recipientId,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    title: "Nova mensagem",
    body: `${sender?.displayName ?? session.user.name ?? "Alguém"} enviou-te uma mensagem.`,
    link: `/dashboard/messages?to=${session.user.id}`,
    actorId: session.user.id,
    referenceId: String(message.id),
  });

  return NextResponse.json({ message }, { status: 201 });
}
