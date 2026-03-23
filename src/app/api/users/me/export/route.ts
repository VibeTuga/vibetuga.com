import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  blogComments,
  showcaseProjects,
  xpEvents,
  userBadges,
  badges,
  storePurchases,
  storeProducts,
  storeReviews,
  newsletterSubscribers,
  userSettings,
  blogPostLikes,
  blogPostBookmarks,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const exportLimiter = rateLimit({ interval: 60 * 60 * 1000, limit: 1 });

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!exportLimiter.check(ip).success) {
    return NextResponse.json(
      { error: "Limite excedido. Podes exportar os teus dados uma vez por hora." },
      { status: 429 },
    );
  }

  try {
    const userId = session.user.id;

    const [profile] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        status: blogPosts.status,
        postType: blogPosts.postType,
        tags: blogPosts.tags,
        coverImage: blogPosts.coverImage,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId));

    const comments = await db
      .select({
        id: blogComments.id,
        postId: blogComments.postId,
        parentId: blogComments.parentId,
        content: blogComments.content,
        createdAt: blogComments.createdAt,
      })
      .from(blogComments)
      .where(eq(blogComments.authorId, userId));

    const projects = await db
      .select({
        id: showcaseProjects.id,
        title: showcaseProjects.title,
        slug: showcaseProjects.slug,
        description: showcaseProjects.description,
        coverImage: showcaseProjects.coverImage,
        liveUrl: showcaseProjects.liveUrl,
        repoUrl: showcaseProjects.repoUrl,
        techStack: showcaseProjects.techStack,
        aiToolsUsed: showcaseProjects.aiToolsUsed,
        status: showcaseProjects.status,
        createdAt: showcaseProjects.createdAt,
      })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.authorId, userId));

    const xp = await db
      .select({
        id: xpEvents.id,
        action: xpEvents.action,
        xpAmount: xpEvents.xpAmount,
        createdAt: xpEvents.createdAt,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId));

    const earnedBadges = await db
      .select({
        badgeName: badges.name,
        badgeSlug: badges.slug,
        awardedAt: userBadges.awardedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    const purchases = await db
      .select({
        id: storePurchases.id,
        productTitle: storeProducts.title,
        pricePaidCents: storePurchases.pricePaidCents,
        createdAt: storePurchases.createdAt,
      })
      .from(storePurchases)
      .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
      .where(eq(storePurchases.buyerId, userId));

    const reviews = await db
      .select({
        id: storeReviews.id,
        productId: storeReviews.productId,
        rating: storeReviews.rating,
        comment: storeReviews.comment,
        createdAt: storeReviews.createdAt,
      })
      .from(storeReviews)
      .where(eq(storeReviews.reviewerId, userId));

    const [newsletter] = await db
      .select({
        email: newsletterSubscribers.email,
        status: newsletterSubscribers.status,
        subscribedAt: newsletterSubscribers.subscribedAt,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.userId, userId))
      .limit(1);

    const [settings] = await db
      .select({
        emailNotifications: userSettings.emailNotifications,
        inAppNotifications: userSettings.inAppNotifications,
        privacyLevel: userSettings.privacyLevel,
        locale: userSettings.locale,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    const likes = await db
      .select({
        postId: blogPostLikes.postId,
        createdAt: blogPostLikes.createdAt,
      })
      .from(blogPostLikes)
      .where(eq(blogPostLikes.userId, userId));

    const bookmarks = await db
      .select({
        postId: blogPostBookmarks.postId,
        createdAt: blogPostBookmarks.createdAt,
      })
      .from(blogPostBookmarks)
      .where(eq(blogPostBookmarks.userId, userId));

    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: profile.id,
        discordUsername: profile.discordUsername,
        displayName: profile.displayName,
        email: profile.email,
        bio: profile.bio,
        websiteUrl: profile.websiteUrl,
        role: profile.role,
        xpPoints: profile.xpPoints,
        level: profile.level,
        streakDays: profile.streakDays,
        createdAt: profile.createdAt,
      },
      settings: settings ?? null,
      blogPosts: posts,
      blogComments: comments,
      blogPostLikes: likes,
      blogPostBookmarks: bookmarks,
      showcaseProjects: projects,
      xpEvents: xp,
      badges: earnedBadges,
      storePurchases: purchases,
      storeReviews: reviews,
      newsletterSubscription: newsletter ?? null,
    };

    const json = JSON.stringify(exportData, null, 2);
    const filename = `vibetuga-data-export-${profile.discordUsername}-${Date.now()}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 });
  }
}
