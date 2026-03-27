import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, blogPosts, showcaseProjects, badges, userBadges } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

// ─── Auth helper ────────────────────────────────────────────

function verifyBotSecret(request: Request): boolean {
  const secret = process.env.DISCORD_BOT_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const [scheme, token] = authHeader.split(" ");
  return scheme === "Bearer" && token === secret;
}

// ─── POST — User sync (role, XP, level, streak, badges) ────

export async function POST(request: Request) {
  if (!verifyBotSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { discordId } = body;

    if (!discordId || typeof discordId !== "string") {
      return NextResponse.json({ error: "discordId is required" }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: users.id,
        discordId: users.discordId,
        discordUsername: users.discordUsername,
        displayName: users.displayName,
        role: users.role,
        xpPoints: users.xpPoints,
        level: users.level,
        streakDays: users.streakDays,
        isBanned: users.isBanned,
        isVerified: users.isVerified,
        image: users.image,
      })
      .from(users)
      .where(eq(users.discordId, discordId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user badges
    const userBadgeRows = await db
      .select({
        name: badges.name,
        slug: badges.slug,
        icon: badges.icon,
        awardedAt: userBadges.awardedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, user.id));

    return NextResponse.json({
      id: user.id,
      discordId: user.discordId,
      username: user.displayName || user.discordUsername,
      role: user.role,
      xpPoints: user.xpPoints,
      level: user.level,
      streakDays: user.streakDays,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
      image: user.image,
      badges: userBadgeRows.map((b) => ({
        name: b.name,
        slug: b.slug,
        icon: b.icon,
        awardedAt: b.awardedAt,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Discord sync POST failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET — Community activity summary ───────────────────────

export async function GET(request: Request) {
  if (!verifyBotSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Latest 5 published blog posts
    const latestPosts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(5);

    // Latest 5 approved showcase projects
    const latestProjects = await db
      .select({
        id: showcaseProjects.id,
        title: showcaseProjects.title,
        slug: showcaseProjects.slug,
        description: showcaseProjects.description,
        authorName: users.discordUsername,
        authorDisplayName: users.displayName,
        createdAt: showcaseProjects.createdAt,
      })
      .from(showcaseProjects)
      .leftJoin(users, eq(showcaseProjects.authorId, users.id))
      .where(and(eq(showcaseProjects.status, "approved")))
      .orderBy(desc(showcaseProjects.createdAt))
      .limit(5);

    // Top 10 leaderboard
    const leaderboard = await db
      .select({
        id: users.id,
        username: users.discordUsername,
        displayName: users.displayName,
        level: users.level,
        xpPoints: users.xpPoints,
        image: users.image,
      })
      .from(users)
      .where(eq(users.isBanned, false))
      .orderBy(desc(users.xpPoints))
      .limit(10);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibetuga.com";

    return NextResponse.json({
      posts: latestPosts.map((p) => ({
        id: p.id,
        title: p.title,
        url: `${appUrl}/blog/${p.slug}`,
        excerpt: p.excerpt,
        author: p.authorDisplayName || p.authorName,
        publishedAt: p.publishedAt,
      })),
      projects: latestProjects.map((p) => ({
        id: p.id,
        title: p.title,
        url: `${appUrl}/showcase/${p.slug}`,
        description: p.description,
        author: p.authorDisplayName || p.authorName,
        createdAt: p.createdAt,
      })),
      leaderboard: leaderboard.map((u, i) => ({
        rank: i + 1,
        id: u.id,
        username: u.displayName || u.username,
        level: u.level,
        xpPoints: u.xpPoints,
        image: u.image,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Discord sync GET failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
