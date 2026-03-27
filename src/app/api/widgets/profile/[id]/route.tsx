import { db } from "@/lib/db";
import { users, userBadges } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { LEVEL_NAMES } from "@/lib/db/queries/profile";

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

async function fetchImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

function renderProfileSvg(data: {
  displayName: string;
  level: number;
  levelName: string;
  xpPoints: number;
  badgeCount: number;
  avatarUrl: string | null;
}) {
  const { displayName, level, levelName, xpPoints, badgeCount, avatarUrl } = data;
  const safeName = escapeXml(displayName);
  const safeLevelName = escapeXml(levelName);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="200" viewBox="0 0 800 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00ff88"/>
      <stop offset="100%" stop-color="#00cc6a"/>
    </linearGradient>
    ${avatarUrl ? `<clipPath id="avatarClip"><circle cx="100" cy="100" r="60"/></clipPath>` : ""}
  </defs>

  <rect width="800" height="200" rx="12" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="200" rx="12" fill="none" stroke="#00ff88" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Avatar -->
  <g>
    <circle cx="100" cy="100" r="62" fill="none" stroke="#00ff88" stroke-width="2" stroke-opacity="0.4"/>
    ${
      avatarUrl
        ? `<image href="${escapeXml(avatarUrl)}" x="40" y="40" width="120" height="120" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
        : `<circle cx="100" cy="100" r="60" fill="#1a1a2e"/>
           <text x="100" y="115" text-anchor="middle" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="40" fill="#00ff88">${safeName.charAt(0).toUpperCase()}</text>`
    }
  </g>

  <!-- Name -->
  <text x="200" y="65" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${safeName}</text>

  <!-- Level badge -->
  <rect x="200" y="80" width="${safeLevelName.length * 10 + 60}" height="28" rx="14" fill="#00ff88" fill-opacity="0.12"/>
  <text x="215" y="99" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#00ff88">LVL ${level} &#xB7; ${safeLevelName}</text>

  <!-- Stats -->
  <g transform="translate(200, 125)">
    <!-- XP -->
    <rect width="140" height="44" rx="8" fill="#ffffff" fill-opacity="0.04"/>
    <text x="15" y="18" font-family="monospace" font-size="10" fill="#ffffff" fill-opacity="0.4">XP</text>
    <text x="15" y="35" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#00ff88">${xpPoints.toLocaleString("en")}</text>

    <!-- Badges -->
    <g transform="translate(160, 0)">
      <rect width="140" height="44" rx="8" fill="#ffffff" fill-opacity="0.04"/>
      <text x="15" y="18" font-family="monospace" font-size="10" fill="#ffffff" fill-opacity="0.4">BADGES</text>
      <text x="15" y="35" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#00ff88">${badgeCount}</text>
    </g>
  </g>

  <!-- Branding -->
  <text x="700" y="185" text-anchor="middle" font-family="monospace" font-size="10" fill="#ffffff" fill-opacity="0.2">vibetuga.com</text>
</svg>`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const [user] = await db
      .select({
        displayName: users.displayName,
        discordUsername: users.discordUsername,
        image: users.image,
        level: users.level,
        xpPoints: users.xpPoints,
        isBanned: users.isBanned,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user || user.isBanned) {
      return new Response(
        renderProfileSvg({
          displayName: "User not found",
          level: 0,
          levelName: "Unknown",
          xpPoints: 0,
          badgeCount: 0,
          avatarUrl: null,
        }),
        { status: 404, headers: CACHE_HEADERS },
      );
    }

    const [badgeResult] = await db
      .select({ count: count() })
      .from(userBadges)
      .where(eq(userBadges.userId, id));

    const badgeCount = badgeResult?.count ?? 0;
    const levelName = LEVEL_NAMES[user.level] ?? `LVL ${user.level}`;

    // Convert avatar to inline data URI so it works when SVG is loaded via <img>
    const avatarDataUri = user.image ? await fetchImageAsDataUri(user.image) : null;

    return new Response(
      renderProfileSvg({
        displayName: user.displayName || user.discordUsername || "VibeTuga User",
        level: user.level,
        levelName,
        xpPoints: user.xpPoints,
        badgeCount,
        avatarUrl: avatarDataUri,
      }),
      { status: 200, headers: CACHE_HEADERS },
    );
  } catch {
    return new Response(
      renderProfileSvg({
        displayName: "Error",
        level: 0,
        levelName: "Unknown",
        xpPoints: 0,
        badgeCount: 0,
        avatarUrl: null,
      }),
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
