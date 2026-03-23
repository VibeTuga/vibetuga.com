import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

/**
 * Extract unique @usernames from text content.
 */
export function parseMentions(content: string): string[] {
  const matches = content.matchAll(MENTION_REGEX);
  const usernames = new Set<string>();
  for (const match of matches) {
    usernames.add(match[1].toLowerCase());
  }
  return Array.from(usernames);
}

/**
 * Replace @username in content with markdown-style profile links.
 */
export function renderMentions(
  content: string,
  resolvedUsers: { username: string; userId: string }[],
): string {
  const userMap = new Map(resolvedUsers.map((u) => [u.username.toLowerCase(), u]));

  return content.replace(MENTION_REGEX, (match, username: string) => {
    const resolved = userMap.get(username.toLowerCase());
    if (resolved) {
      return `[@${resolved.username}](/profile/${resolved.userId})`;
    }
    return match;
  });
}

/**
 * Resolve usernames to user IDs by querying the database.
 */
export async function resolveMentions(
  usernames: string[],
): Promise<{ username: string; userId: string }[]> {
  if (usernames.length === 0) return [];

  const matchedUsers = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
    })
    .from(users)
    .where(inArray(users.discordUsername, usernames));

  return matchedUsers.map((u) => ({
    username: u.discordUsername,
    userId: u.id,
  }));
}
