import { createHash } from "crypto";
import { logger } from "./logger";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

export function rateLimit({ interval, limit }: { interval: number; limit: number }) {
  const store = new Map<string, RateLimitEntry>();

  return {
    check(ip: string): { success: boolean } {
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now >= entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + interval });
        return { success: true };
      }

      if (entry.count >= limit) {
        logger.warn({ ipHash: hashIp(ip), limit }, "Rate limit exceeded");
        return { success: false };
      }

      entry.count++;
      return { success: true };
    },
  };
}
