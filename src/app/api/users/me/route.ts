import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  blogComments,
  showcaseProjects,
  storeProducts,
  storePurchases,
  storeReviews,
  xpEvents,
  userBadges,
  userSettings,
  blogPostLikes,
  blogPostBookmarks,
  newsletterSubscribers,
  accounts,
  sessions,
  subscriptions,
  roleRequests,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({
        displayName: users.displayName,
        bio: users.bio,
        websiteUrl: users.websiteUrl,
        email: users.email,
        discordUsername: users.discordUsername,
        image: users.image,
        role: users.role,
        xpPoints: users.xpPoints,
        level: users.level,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar perfil" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, string> = {};

    if (body.displayName !== undefined) {
      const displayName = String(body.displayName).trim();
      if (displayName.length > 50) {
        return NextResponse.json(
          { error: "O nome de exibição não pode ter mais de 50 caracteres" },
          { status: 400 },
        );
      }
      updates.displayName = displayName;
    }

    if (body.bio !== undefined) {
      const bio = String(body.bio).trim();
      if (bio.length > 500) {
        return NextResponse.json(
          { error: "A bio não pode ter mais de 500 caracteres" },
          { status: 400 },
        );
      }
      updates.bio = bio;
    }

    if (body.websiteUrl !== undefined) {
      const websiteUrl = String(body.websiteUrl).trim();
      if (websiteUrl.length > 200) {
        return NextResponse.json(
          { error: "O URL do website não pode ter mais de 200 caracteres" },
          { status: 400 },
        );
      }
      updates.websiteUrl = websiteUrl;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}

const deleteLimiter = rateLimit({ interval: 24 * 60 * 60 * 1000, limit: 1 });

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!deleteLimiter.check(ip).success) {
    return NextResponse.json(
      { error: "Limite excedido. Só podes eliminar a conta uma vez por dia." },
      { status: 429 },
    );
  }

  try {
    const userId = session.user.id;

    // 1. Delete user settings (also cascades on user delete, but explicit)
    await db.delete(userSettings).where(eq(userSettings.userId, userId));

    // 2. Delete XP events
    await db.delete(xpEvents).where(eq(xpEvents.userId, userId));

    // 3. Delete user badges
    await db.delete(userBadges).where(eq(userBadges.userId, userId));

    // 4. Delete blog post likes
    await db.delete(blogPostLikes).where(eq(blogPostLikes.userId, userId));

    // 5. Delete blog post bookmarks
    await db.delete(blogPostBookmarks).where(eq(blogPostBookmarks.userId, userId));

    // 6. Delete newsletter subscriptions
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.userId, userId));

    // 7. Delete store reviews by user
    await db.delete(storeReviews).where(eq(storeReviews.reviewerId, userId));

    // 8. Delete store purchases by user (as buyer)
    await db.delete(storePurchases).where(eq(storePurchases.buyerId, userId));

    // 9. Handle store products the user sells — delete reviews & purchases on their products, then delete products
    const sellerProducts = await db
      .select({ id: storeProducts.id })
      .from(storeProducts)
      .where(eq(storeProducts.sellerId, userId));

    if (sellerProducts.length > 0) {
      const productIds = sellerProducts.map((p) => p.id);
      await db.delete(storeReviews).where(inArray(storeReviews.productId, productIds));
      await db.delete(storePurchases).where(inArray(storePurchases.productId, productIds));
      await db.delete(storeProducts).where(eq(storeProducts.sellerId, userId));
    }

    // 10. Anonymize comments by user — detach child comments first, then delete user's comments
    const userComments = await db
      .select({ id: blogComments.id })
      .from(blogComments)
      .where(eq(blogComments.authorId, userId));

    if (userComments.length > 0) {
      const commentIds = userComments.map((c) => c.id);
      // Set parentId to null for replies to user's comments
      await db
        .update(blogComments)
        .set({ parentId: null })
        .where(inArray(blogComments.parentId, commentIds));
      // Delete user's comments
      await db.delete(blogComments).where(eq(blogComments.authorId, userId));
    }

    // 11. Delete blog posts by user (cascades: comments on those posts, likes, bookmarks)
    await db.delete(blogPosts).where(eq(blogPosts.authorId, userId));

    // 12. Delete showcase projects
    await db.delete(showcaseProjects).where(eq(showcaseProjects.authorId, userId));

    // 13. Delete role requests
    await db.delete(roleRequests).where(eq(roleRequests.userId, userId));

    // 14. Delete subscriptions
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));

    // 15. Delete auth accounts and sessions
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(accounts).where(eq(accounts.userId, userId));

    // 16. Delete user record
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar conta" }, { status: 500 });
  }
}
