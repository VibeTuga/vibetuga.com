import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

function renderLeaderboardSvg(
  entries: Array<{
    rank: number;
    name: string;
    xpPoints: number;
    level: number;
  }>,
) {
  const rows = entries
    .map((entry, i) => {
      const y = 100 + i * 76;
      const safeName = escapeXml(entry.name);
      const levelName = escapeXml(LEVEL_NAMES[entry.level] ?? `LVL ${entry.level}`);
      const medalColors: Record<number, string> = {
        1: "#ffd700",
        2: "#c0c0c0",
        3: "#cd7f32",
      };
      const rankColor = medalColors[entry.rank] ?? "#ffffff80";

      return `
    <g transform="translate(0, ${y})">
      <rect x="20" y="0" width="360" height="60" rx="8" fill="#ffffff" fill-opacity="0.03"/>
      <rect x="20" y="0" width="360" height="60" rx="8" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

      <!-- Rank -->
      <text x="50" y="37" text-anchor="middle" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="${rankColor}">#${entry.rank}</text>

      <!-- Name & Level -->
      <text x="80" y="28" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#ffffff">${safeName}</text>
      <text x="80" y="48" font-family="monospace" font-size="11" fill="#ffffff" fill-opacity="0.4">${levelName}</text>

      <!-- XP -->
      <text x="360" y="37" text-anchor="end" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#00ff88">${entry.xpPoints.toLocaleString("en")} XP</text>
    </g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#0f0f1a"/>
    </linearGradient>
  </defs>

  <rect width="400" height="500" rx="12" fill="url(#bg)"/>
  <rect x="0" y="0" width="400" height="500" rx="12" fill="none" stroke="#00ff88" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Header -->
  <rect x="20" y="20" width="360" height="55" rx="8" fill="#00ff88" fill-opacity="0.08"/>
  <text x="40" y="42" font-family="monospace" font-size="10" fill="#00ff88" fill-opacity="0.6">VIBETUGA</text>
  <text x="40" y="62" font-family="'Space Grotesk', 'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Leaderboard</text>

  <!-- Entries -->
  ${rows}

  <!-- Branding -->
  <text x="200" y="488" text-anchor="middle" font-family="monospace" font-size="10" fill="#ffffff" fill-opacity="0.2">vibetuga.com</text>
</svg>`;
}

export async function GET() {
  try {
    const topUsers = await db
      .select({
        displayName: users.displayName,
        discordUsername: users.discordUsername,
        level: users.level,
        xpPoints: users.xpPoints,
      })
      .from(users)
      .where(eq(users.isBanned, false))
      .orderBy(desc(users.xpPoints))
      .limit(5);

    const entries = topUsers.map((user, i) => ({
      rank: i + 1,
      name: user.displayName || user.discordUsername || "VibeTuga User",
      xpPoints: user.xpPoints,
      level: user.level,
    }));

    return new Response(renderLeaderboardSvg(entries), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch {
    return new Response(renderLeaderboardSvg([]), {
      status: 500,
      headers: CACHE_HEADERS,
    });
  }
}
