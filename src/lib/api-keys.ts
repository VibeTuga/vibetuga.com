import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq, and, gt, isNull, or } from "drizzle-orm";

const API_KEY_PREFIX = "vtg_";
const KEY_BYTES = 32;

export function generateApiKey(): string {
  const raw = randomBytes(KEY_BYTES).toString("hex");
  return `${API_KEY_PREFIX}${raw}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(key: string) {
  const hash = hashApiKey(key);
  const now = new Date();

  const [result] = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      name: apiKeys.name,
      scopes: apiKeys.scopes,
    })
    .from(apiKeys)
    .where(
      and(eq(apiKeys.keyHash, hash), or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, now))),
    )
    .limit(1);

  if (!result) {
    return null;
  }

  // Update lastUsedAt (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: now })
    .where(eq(apiKeys.id, result.id))
    .then(() => {})
    .catch(() => {});

  return result;
}
