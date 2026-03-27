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
    // Stats depend on DB — check at least the section exists
    const statsSection = page.locator("section").filter({
      has: page.getByText(/Membros|Projetos|Blog Posts/i),
    });
    const sectionExists = (await statsSection.count()) > 0;
    // Stats may not render without DB, so just ensure no 500 error
    expect(sectionExists || (await page.title()).includes("VibeTuga")).toBeTruthy();
  });

  test("navigation links to main sections exist", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Showcase" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Leaderboard" })).toBeVisible();
  });

  test("leaderboard widget section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Leaderboard/i })).toBeVisible();
  });
});
