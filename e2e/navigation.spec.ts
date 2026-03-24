import { test, expect } from "@playwright/test";

test.describe("Header Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header nav links navigate to correct pages", async ({ page }) => {
    const nav = page.getByRole("navigation");

    await expect(nav.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(nav.getByRole("link", { name: "Showcase" })).toHaveAttribute("href", "/showcase");
    await expect(nav.getByRole("link", { name: "Leaderboard" })).toHaveAttribute(
      "href",
      "/leaderboard",
    );
    await expect(nav.getByRole("link", { name: "Store" })).toHaveAttribute("href", "/store");
  });

  test("blog link navigates to blog page", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { name: /Blog/i, level: 1 })).toBeVisible();
  });

  test("mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole("button", { name: /menu/i });
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });
});

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("footer is visible with tagline", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/Feito com vibe em Portugal/i)).toBeVisible();
  });

  test("footer contains legal links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /Privacidade/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Termos/i })).toBeVisible();
  });

  test("footer social links are present", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /Discord/i })).toBeVisible();
  });
});
