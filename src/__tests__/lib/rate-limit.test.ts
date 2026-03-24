import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const limiter = rateLimit({ interval: 60_000, limit: 3 });

    expect(limiter.check("1.2.3.4").success).toBe(true);
    expect(limiter.check("1.2.3.4").success).toBe(true);
    expect(limiter.check("1.2.3.4").success).toBe(true);
  });

  it("blocks requests after exceeding the limit", () => {
    const limiter = rateLimit({ interval: 60_000, limit: 2 });

    expect(limiter.check("1.2.3.4").success).toBe(true);
    expect(limiter.check("1.2.3.4").success).toBe(true);
    expect(limiter.check("1.2.3.4").success).toBe(false);
    expect(limiter.check("1.2.3.4").success).toBe(false);
  });

  it("resets after the interval elapses", () => {
    const limiter = rateLimit({ interval: 60_000, limit: 1 });

    expect(limiter.check("1.2.3.4").success).toBe(true);
    expect(limiter.check("1.2.3.4").success).toBe(false);

    vi.advanceTimersByTime(60_000);

    expect(limiter.check("1.2.3.4").success).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const limiter = rateLimit({ interval: 60_000, limit: 1 });

    expect(limiter.check("1.1.1.1").success).toBe(true);
    expect(limiter.check("1.1.1.1").success).toBe(false);

    expect(limiter.check("2.2.2.2").success).toBe(true);
    expect(limiter.check("2.2.2.2").success).toBe(false);
  });

  it("allows exactly the limit number of requests", () => {
    const limiter = rateLimit({ interval: 60_000, limit: 5 });
    const ip = "10.0.0.1";

    for (let i = 0; i < 5; i++) {
      expect(limiter.check(ip).success).toBe(true);
    }
    expect(limiter.check(ip).success).toBe(false);
  });
});
