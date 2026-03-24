import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn() }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ xpPoints: 100 }]),
        }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockResolvedValue([{ level: 1, xpRequired: 0 }]),
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: "id", xpPoints: "xp_points", level: "level", streakDays: "streak_days" },
  xpEvents: { userId: "user_id", action: "action" },
  badges: { id: "id", slug: "slug" },
  userBadges: { userId: "user_id", badgeId: "badge_id" },
  levels: { level: "level", xpRequired: "xp_required" },
}));

describe("gamification", () => {
  describe("XP_VALUES", () => {
    it("exports all expected XP action constants", async () => {
      const { XP_VALUES } = await import("@/lib/gamification");

      expect(XP_VALUES).toBeDefined();
      expect(XP_VALUES.blog_post_published).toBe(50);
      expect(XP_VALUES.blog_comment).toBe(5);
      expect(XP_VALUES.project_submitted).toBe(30);
      expect(XP_VALUES.project_featured).toBe(100);
      expect(XP_VALUES.product_sold).toBe(20);
      expect(XP_VALUES.product_reviewed).toBe(10);
      expect(XP_VALUES.daily_login).toBe(5);
      expect(XP_VALUES.streak_7_days).toBe(50);
      expect(XP_VALUES.streak_30_days).toBe(200);
      expect(XP_VALUES.referred_user).toBe(25);
      expect(XP_VALUES.community_helper).toBe(15);
      expect(XP_VALUES.first_follower).toBe(10);
      expect(XP_VALUES.challenge_entry).toBe(20);
      expect(XP_VALUES.challenge_winner).toBe(200);
    });

    it("has positive XP values for all actions", async () => {
      const { XP_VALUES } = await import("@/lib/gamification");

      for (const [action, value] of Object.entries(XP_VALUES)) {
        expect(value, `${action} should be positive`).toBeGreaterThan(0);
      }
    });
  });

  describe("awardXP", () => {
    it("is an async function that accepts userId, action, and optional referenceId", async () => {
      const { awardXP } = await import("@/lib/gamification");

      expect(typeof awardXP).toBe("function");
      expect(awardXP.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("checkAndAwardBadges", () => {
    it("is an async function that accepts userId", async () => {
      const { checkAndAwardBadges } = await import("@/lib/gamification");

      expect(typeof checkAndAwardBadges).toBe("function");
      expect(checkAndAwardBadges.length).toBe(1);
    });
  });
});
