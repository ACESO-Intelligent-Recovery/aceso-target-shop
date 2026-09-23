import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ACESO_SYNTHETIC__ = true;
  });
});

test("synthetic user completes full checkout journey", async ({ page }) => {
  // 1. Visit product detail page
  await page.goto("/product/prod-01");
  await expect(page.getByRole("heading", { name: "Aceso Wireless Noise-Canceling Headphones" })).toBeVisible();

  // 2. Add product to cart
  await page.getByRole("button", { name: /Add to Cart/i }).click();
  await expect(page.getByText(/Added \d+ ×/)).toBeVisible();

  // 3. Go to cart
  await page.goto("/cart");
  await expect(page.getByText(/Shopping Cart/i)).toBeVisible();
  await expect(page.getByText("Wireless Noise-Canceling Headphones")).toBeVisible();
  // Monetary verification: verify ground-truth total ($215.99 = $199.99 subtotal + $0 shipping + $16.00 tax)
  await expect(page.getByText("$215.99")).toBeVisible();

  // 4. Proceed to checkout
  await page.getByRole("button", { name: /Proceed to Checkout/i }).click();
  await expect(page).toHaveURL(/.*checkout/);
  // Monetary verification: verify 8% tax ($16.00) and order total button ($215.99)
  await expect(page.getByText("$16.00")).toBeVisible();
  await expect(page.getByRole("button", { name: /Place Order \(\$215\.99\)/i })).toBeVisible();

  // 5. Place order
  await page.getByRole("button", { name: /Place Order/i }).click();

  // 6. Verify confirmation page (HC-1.1 proof)
  await expect(page).toHaveURL(/.*order-success/);
  await expect(page.getByRole("heading", { name: /Order Confirmed!/i })).toBeVisible();
  await expect(page.getByText("$215.99")).toBeVisible();
  await expect(page.getByText(/checkout_completed/i)).toBeVisible();
});
