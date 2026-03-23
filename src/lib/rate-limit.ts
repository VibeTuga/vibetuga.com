type RateLimitEntry = {
  count: number;
  resetAt: number;
};

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
        return { success: false };
      }

      entry.count++;
      return { success: true };
    },
  };
}
