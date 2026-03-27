import { logger } from "@/lib/logger";

// ─── Discord Embed Types ────────────────────────────────────

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  fields?: DiscordEmbedField[];
  thumbnail?: DiscordEmbedThumbnail;
  footer?: DiscordEmbedFooter;
  timestamp?: string;
}

// ─── Discord Webhook Colors ─────────────────────────────────

export const DISCORD_COLORS = {
  primary: 0x00ff88, // neon green (VibeTuga brand)
  secondary: 0x00d4ff, // cyan
  tertiary: 0xbf5af2, // purple
  success: 0x34d399, // green
  warning: 0xfbbf24, // amber
  error: 0xff716c, // red
  levelUp: 0xffd700, // gold
} as const;

// ─── Send Discord Notification ──────────────────────────────

export async function sendDiscordNotification(
  webhookUrl: string,
  embed: DiscordEmbed,
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      logger.warn(
        { status: response.status, statusText: response.statusText },
        "Discord webhook request failed",
      );
    }
  } catch (error) {
    logger.warn({ error }, "Discord webhook delivery error");
  }
}

// ─── Fire-and-forget helper ─────────────────────────────────

export function notifyDiscord(embed: DiscordEmbed): void {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  // Fire-and-forget — errors caught inside sendDiscordNotification
  sendDiscordNotification(webhookUrl, embed).catch(() => {
    // Already logged inside sendDiscordNotification
  });
}

// ─── Pre-built notification helpers ─────────────────────────

export function notifyLevelUp(username: string, newLevel: number, levelName: string): void {
  notifyDiscord({
    title: "🎉 Level Up!",
    description: `**${username}** subiu para o nível **${newLevel} — ${levelName}**!`,
    color: DISCORD_COLORS.levelUp,
    footer: { text: "VibeTuga • Gamificação" },
    timestamp: new Date().toISOString(),
  });
}

export function notifyNewPost(title: string, slug: string, authorName: string): void {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibetuga.com";
  notifyDiscord({
    title: "📝 Novo Post Publicado",
    description: `**${authorName}** publicou um novo artigo: **${title}**`,
    color: DISCORD_COLORS.primary,
    url: `${appUrl}/blog/${slug}`,
    footer: { text: "VibeTuga • Blog" },
    timestamp: new Date().toISOString(),
  });
}
