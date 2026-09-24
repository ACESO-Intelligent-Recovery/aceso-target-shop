import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Inject synthetic flag before scripts load (Blueprint line 883)
  await page.addInitScript(() => {
    window.__ACESO_SYNTHETIC__ = true;
  });
});

test("synthetic user searches for products and filters category", async ({ page }) => {
  await page.goto("/search");
  await expect(page).toHaveTitle(/Aceso Target Shop/);

  const main = page.locator("main");

  // Verify catalogue loads products
  const productCards = main.locator("a[href^='/product/']");
  await expect(productCards.first()).toBeVisible();

  // Search for "headphones"
  const searchInput = main.locator("input[placeholder*='Filter by keyword']");
  await searchInput.fill("headphones");
  await searchInput.press("Enter");

  // Verify filtered results
  await expect(main.locator("h1")).toContainText(/headphones/i);
  await expect(main.getByText("Wireless Noise-Canceling Headphones")).toBeVisible();

  // Search for regex special characters (RE-02 defense: unescaped regex must not crash page)
  await searchInput.fill("[test");
  await searchInput.press("Enter");
  await expect(main.locator("h1")).toContainText(/\[test/);
  await expect(main.getByText("No matching products found")).toBeVisible();
});
