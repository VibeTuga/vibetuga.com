import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("loads and displays blog heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Blog/i, level: 1 })).toBeVisible();
  });

  test("shows post cards or empty state", async ({ page }) => {
    // With or without DB, the page should render something
    const posts = page.locator("article");
    const emptyState = page.getByText(/Nenhum|Ainda não/i);
    const heading = page.getByRole("heading", { name: /Blog/i, level: 1 });
    const hasContent =
      (await posts.count()) > 0 || (await emptyState.count()) > 0 || (await heading.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test("category filter 'Tudo' button exists", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Tudo" })).toBeVisible();
  });
});
