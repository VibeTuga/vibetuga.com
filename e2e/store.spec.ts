import { test, expect } from "@playwright/test";

test.describe("Store Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/store");
  });

  test("loads and displays store heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Loja/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Ferramentas, templates e kits/i)).toBeVisible();
  });

  test("shows product grid or empty state", async ({ page }) => {
    const products = page.locator("article");
    const emptyState = page.getByText(/Nenhum produto encontrado/i);
    const hasContent = (await products.count()) > 0 || (await emptyState.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test("type filter buttons exist", async ({ page }) => {
    const filterSection = page.locator("nav, [role='tablist'], .flex").filter({
      has: page.getByRole("link"),
    });
    await expect(filterSection.first()).toBeVisible();
  });
});
