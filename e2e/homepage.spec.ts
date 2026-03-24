import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and displays hero heading", async ({ page }) => {
    await expect(page).toHaveTitle(/VibeTuga/i);
    await expect(
      page.getByRole("heading", { name: /Onde o código encontra a vibe/i }),
    ).toBeVisible();
  });

  test("hero CTA buttons are visible", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Junta-te ao Discord/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Explora Projetos/i })).toBeVisible();
  });

  test("stats section renders community numbers", async ({ page }) => {
    await expect(page.getByText("Membros")).toBeVisible();
    await expect(page.getByText("Projetos")).toBeVisible();
    await expect(page.getByText("Blog Posts")).toBeVisible();
    await expect(page.getByText("XP Total")).toBeVisible();
  });

  test("navigation links to main sections exist", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Showcase" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Leaderboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Store" })).toBeVisible();
  });

  test("leaderboard widget section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Leaderboard/i })).toBeVisible();
  });
});
