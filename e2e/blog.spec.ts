import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("loads and displays blog heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Blog/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Artigos, tutoriais e deep dives/i)).toBeVisible();
  });

  test("shows post cards or empty state", async ({ page }) => {
    const posts = page.locator("article");
    const emptyState = page.getByText(/Nenhum/i);
    const hasContent = (await posts.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test("category filter 'Tudo' button exists", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Tudo" })).toBeVisible();
  });

  test("search dialog opens with Cmd+K", async ({ page }) => {
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  });
});
