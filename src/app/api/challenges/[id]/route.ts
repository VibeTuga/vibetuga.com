import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { challenges, challengeEntries, users, badges, userBadges } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/gamification";
import { createNotification, NOTIFICATION_TYPES } from "@/lib/notifications";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const [challenge] = await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        startAt: challenges.startAt,
        endAt: challenges.endAt,
        xpReward: challenges.xpReward,
        badgeRewardId: challenges.badgeRewardId,
        status: challenges.status,
        createdBy: challenges.createdBy,
        createdAt: challenges.createdAt,
      })
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: "Desafio não encontrado." }, { status: 404 });
    }

    // Get badge info if exists
    let badgeReward = null;
    if (challenge.badgeRewardId) {
      const [badge] = await db
        .select({ id: badges.id, name: badges.name, icon: badges.icon })
        .from(badges)
        .where(eq(badges.id, challenge.badgeRewardId))
        .limit(1);
      badgeReward = badge ?? null;
    }

    // Get entries with user info
    const entries = await db
      .select({
        id: challengeEntries.id,
        submissionUrl: challengeEntries.submissionUrl,
        description: challengeEntries.description,
        votesCount: challengeEntries.votesCount,
        status: challengeEntries.status,
        createdAt: challengeEntries.createdAt,
        userId: challengeEntries.userId,
        userDisplayName: users.displayName,
        userImage: users.image,
        userLevel: users.level,
        userDiscordUsername: users.discordUsername,
      })
      .from(challengeEntries)
      .innerJoin(users, eq(challengeEntries.userId, users.id))
      .where(eq(challengeEntries.challengeId, challengeId))
      .orderBy(desc(challengeEntries.votesCount));

    return NextResponse.json({
      challenge: { ...challenge, badgeReward },
      entries,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar desafio." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Apenas administradores." }, { status: 403 });
    }

    const { id } = await params;
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = String(body.title).slice(0, 200);
    if (body.description !== undefined) updates.description = String(body.description);
    if (body.startAt !== undefined) updates.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) updates.endAt = new Date(body.endAt);
    if (body.xpReward !== undefined) updates.xpReward = Number(body.xpReward);
    if (body.badgeRewardId !== undefined) updates.badgeRewardId = body.badgeRewardId || null;
    if (body.status !== undefined) updates.status = body.status;

    // Handle marking a winner
    if (body.winnerId) {
      const entryId = parseInt(body.winnerId, 10);
      const [entry] = await db
        .select({
          id: challengeEntries.id,
          userId: challengeEntries.userId,
          challengeId: challengeEntries.challengeId,
        })
        .from(challengeEntries)
        .where(and(eq(challengeEntries.id, entryId), eq(challengeEntries.challengeId, challengeId)))
        .limit(1);

      if (entry) {
        await db
          .update(challengeEntries)
          .set({ status: "winner" })
          .where(eq(challengeEntries.id, entry.id));

        // Get challenge for XP reward
        const [challenge] = await db
          .select({
            xpReward: challenges.xpReward,
            title: challenges.title,
            badgeRewardId: challenges.badgeRewardId,
          })
          .from(challenges)
          .where(eq(challenges.id, challengeId))
          .limit(1);

        if (challenge) {
          // Award winner XP
          await awardXP(entry.userId, "challenge_winner", String(challengeId));

          // Award badge if configured
          if (challenge.badgeRewardId) {
            const existingBadge = await db
              .select({ badgeId: userBadges.badgeId })
              .from(userBadges)
              .where(
                and(
                  eq(userBadges.userId, entry.userId),
                  eq(userBadges.badgeId, challenge.badgeRewardId),
                ),
              )
              .limit(1);

            if (existingBadge.length === 0) {
              await db.insert(userBadges).values({
                userId: entry.userId,
                badgeId: challenge.badgeRewardId,
              });
            }
          }

          // Notify winner
          createNotification({
            userId: entry.userId,
            type: NOTIFICATION_TYPES.CHALLENGE_WINNER,
            title: "Venceste o desafio!",
            body: `Parabéns! Foste o vencedor de "${challenge.title}". +${challenge.xpReward > 0 ? challenge.xpReward : 200} XP!`,
            link: `/challenges/${challengeId}`,
            actorId: session.user.id,
          }).catch(() => null);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(challenges).set(updates).where(eq(challenges.id, challengeId));
    }

    const [updated] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    return NextResponse.json({ challenge: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar desafio." }, { status: 500 });
  }
}
