import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: "id", discordUsername: "discord_username" },
}));

import { parseMentions, renderMentions } from "@/lib/mentions";

describe("parseMentions", () => {
  it("extracts a single @username", () => {
    expect(parseMentions("Hello @alice")).toEqual(["alice"]);
  });

  it("extracts multiple @usernames", () => {
    const result = parseMentions("Hey @alice and @bob, check this out");
    expect(result).toContain("alice");
    expect(result).toContain("bob");
    expect(result).toHaveLength(2);
  });

  it("deduplicates repeated usernames", () => {
    const result = parseMentions("@alice said hi to @alice");
    expect(result).toEqual(["alice"]);
  });

  it("normalizes usernames to lowercase", () => {
    const result = parseMentions("@Alice @BOB @Charlie");
    expect(result).toEqual(["alice", "bob", "charlie"]);
  });

  it("returns empty array when no mentions exist", () => {
    expect(parseMentions("No mentions here")).toEqual([]);
  });

  it("handles usernames with underscores and numbers", () => {
    const result = parseMentions("Thanks @dev_user_42 for the help");
    expect(result).toEqual(["dev_user_42"]);
  });

  it("handles mentions at start and end of text", () => {
    const result = parseMentions("@start and @end");
    expect(result).toContain("start");
    expect(result).toContain("end");
  });

  it("handles empty string", () => {
    expect(parseMentions("")).toEqual([]);
  });
});

describe("renderMentions", () => {
  it("replaces @username with profile links for resolved users", () => {
    const result = renderMentions("Hello @alice", [{ username: "alice", userId: "u1" }]);
    expect(result).toBe("Hello [@alice](/profile/u1)");
  });

  it("leaves unresolved mentions unchanged", () => {
    const result = renderMentions("Hello @unknown", []);
    expect(result).toBe("Hello @unknown");
  });

  it("handles mixed resolved and unresolved mentions", () => {
    const result = renderMentions("Hey @alice and @unknown", [{ username: "alice", userId: "u1" }]);
    expect(result).toBe("Hey [@alice](/profile/u1) and @unknown");
  });

  it("is case-insensitive for matching", () => {
    const result = renderMentions("Hello @ALICE", [{ username: "alice", userId: "u1" }]);
    expect(result).toBe("Hello [@alice](/profile/u1)");
  });
});
