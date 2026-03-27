import { test, expect } from "@playwright/test";

test.describe("Store Page", () => {
  test("store route responds without server error", async ({ page }) => {
    const response = await page.goto("/store");
    // Store may return 404 if feature flag is disabled, or 200 if enabled
    // It should never return 500
    expect(response?.status()).not.toBe(500);
  });
});
