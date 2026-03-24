import { db } from "@/lib/db";
import { badges, userBadges } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const CACHE_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderBadgeSvg(name: string, icon: string | null) {
  const safeName = escapeXml(name);
  const safeIcon = escapeXml(icon ?? "🏆");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </linearGradient>
  </defs>

  <rect width="200" height="40" rx="20" fill="url(#bg)"/>
  <rect width="200" height="40" rx="20" fill="none" stroke="#00ff88" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Icon circle -->
  <circle cx="24" cy="20" r="12" fill="#00ff88" fill-opacity="0.12"/>
  <text x="24" y="26" text-anchor="middle" font-size="13">${safeIcon}</text>

  <!-- Badge name -->
  <text x="44" y="25" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="12" font-weight="600" fill="#ffffff">${safeName}</text>

  <!-- Branding dot -->
  <circle cx="186" cy="20" r="3" fill="#00ff88" fill-opacity="0.4"/>
</svg>`;
}

function renderNotFoundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
  <rect width="200" height="40" rx="20" fill="#0a0a0f"/>
  <rect width="200" height="40" rx="20" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  <text x="100" y="25" text-anchor="middle" font-family="monospace" font-size="11" fill="#ffffff" fill-opacity="0.3">Badge not found</text>
</svg>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string; badgeSlug: string }> },
) {
  const { userId, badgeSlug } = await params;

  try {
    const [badge] = await db
      .select({
        name: badges.name,
        icon: badges.icon,
      })
      .from(badges)
      .where(eq(badges.slug, badgeSlug))
      .limit(1);

    if (!badge) {
      return new Response(renderNotFoundSvg(), {
        status: 404,
        headers: CACHE_HEADERS,
      });
    }

    // Verify user has this badge
    const [earned] = await db
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .innerJoin(badges, eq(badges.id, userBadges.badgeId))
      .where(and(eq(userBadges.userId, userId), eq(badges.slug, badgeSlug)))
      .limit(1);

    if (!earned) {
      return new Response(renderNotFoundSvg(), {
        status: 404,
        headers: CACHE_HEADERS,
      });
    }

    return new Response(renderBadgeSvg(badge.name, badge.icon), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch {
    return new Response(renderNotFoundSvg(), {
      status: 500,
      headers: CACHE_HEADERS,
    });
  }
}
