import { test, expect } from "@playwright/test";

test.describe("Leaderboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leaderboard");
  });

  test("loads and displays leaderboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Leaderboard/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Quem está a vibrar mais forte/i)).toBeVisible();
  });

  test("shows ranking table or podium section", async ({ page }) => {
    const table = page.getByRole("table");
    const podium = page.getByText(/#1/i);
    const hasContent = (await table.count()) > 0 || (await podium.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test("time period tabs are visible", async ({ page }) => {
    await expect(page.getByText("Semanal")).toBeVisible();
    await expect(page.getByText("Mensal")).toBeVisible();
    await expect(page.getByText("All-Time")).toBeVisible();
  });
});
