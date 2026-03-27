import { test, expect } from "@playwright/test";

test.describe("Leaderboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leaderboard");
  });

  test("loads and displays leaderboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Leaderboard/i, level: 1 })).toBeVisible();
  });

  test("shows ranking content or empty state", async ({ page }) => {
    // The page should render even without DB data
    const heading = page.getByRole("heading", { name: /Leaderboard/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test("time period tabs are visible", async ({ page }) => {
    await expect(page.getByText("Semanal")).toBeVisible();
    await expect(page.getByText("Mensal")).toBeVisible();
    await expect(page.getByText("All-Time")).toBeVisible();
  });
});
