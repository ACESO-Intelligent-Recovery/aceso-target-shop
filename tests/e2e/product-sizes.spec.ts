import { test, expect } from "./fixtures";
import { PRODUCTS } from "../../lib/products";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ACESO_SYNTHETIC__ = true;
    window.__ACESO_EVENTS__ = [];
  });
});

test("shoe page offers UK sizes and carries the selection to cart and checkout @features", async ({ page }, testInfo) => {
  await page.goto("/product/prod-08");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed"))).toBe(true);
  const selector = page.getByLabel("Size:", { exact: true });
  await expect(selector).toHaveValue("UK 9");
  await expect(selector.locator("option")).toHaveText(["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]);
  await page.screenshot({ path: testInfo.outputPath("shoe-uk-sizes.png"), fullPage: true });
  await selector.selectOption("UK 8");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByText(/Added 1 ×/)).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText("Size: UK 8", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Proceed to Checkout" }).click();
  // "Size: UK 8" is shown on /cart too, so the checkout page itself is checked first (DL-74).
  await expect(page).toHaveURL(/\/checkout$/, { timeout: 45000 });
  await expect(page.getByText("Size: UK 8", { exact: true })).toBeVisible();
});

test("bag page has no selector or cart and checkout size @features", async ({ page }, testInfo) => {
  await page.goto("/product/prod-28");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed"))).toBe(true);
  await expect(page.getByLabel("Size:", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("bag-no-size.png"), fullPage: true });
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByText(/Added 1 ×/)).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByText(/^Size:/)).toHaveCount(0);
  await page.getByRole("button", { name: "Proceed to Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/, { timeout: 45000 });
  await expect(page.getByText("Qty: 1", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Size:/)).toHaveCount(0);
});

test("buy now preselects UK 9 and the default shoe retains its product-id key @features", async ({ page }) => {
  // This journey chains three cold routes, and on a busy preview a click can land before
  // React hydrates and be lost (it failed in 17 of 52 preview runs of the 2026-10-26
  // capture, at different steps, on the healthy build too). Each click is retried until
  // its effect shows, as in auth.spec.ts; a click that never takes effect still fails.
  // Buy Now is clicked again only if the last click recorded no add_to_cart event. A click
  // that was taken but navigates slowly must not be repeated: it would add a second shoe and
  // restart the navigation to /checkout.
  await page.goto("/product/prod-08");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed")), { timeout: 30000 }).toBe(true);
  await expect(async () => {
    if (
      !/\/checkout$/.test(new URL(page.url()).pathname) &&
      !(await page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "add_to_cart")))
    ) {
      await page.getByRole("button", { name: "Buy Now", exact: true }).click({ timeout: 5000 });
    }
    await expect(page).toHaveURL(/\/checkout$/, { timeout: 5000 });
  }).toPass({ timeout: 30000 });
  await expect(page.getByText("Size: UK 9", { exact: true })).toBeVisible();
  await expect(page.getByText("Qty: 1", { exact: true })).toBeVisible();
  await page.goto("/cart");
  // The cart line renders once the saved cart has loaded; only then can "+" change it.
  await expect(page.getByText("1 items in your order", { exact: true })).toBeVisible();
  await expect(async () => {
    if (await page.getByText("1 items in your order", { exact: true }).isVisible()) {
      await page.getByRole("button", { name: "+", exact: true }).click({ timeout: 5000 });
    }
    await expect(page.getByText("2 items in your order", { exact: true })).toBeVisible({ timeout: 5000 });
  }).toPass({ timeout: 30000 });
});

test("home and search card adds use UK 9 and merge into one line @features", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("aceso_cart"))).not.toBeNull();
  const name = "Performance Breathable Running Shoes";
  await page.getByRole("heading", { name, exact: true }).locator("../..").getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("1");
  await page.goto("/search?q=shoes");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "search_performed"))).toBe(true);
  await page.getByRole("heading", { name, exact: true }).locator("../..").getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("2");
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByText("Size: UK 9", { exact: true })).toBeVisible();
  await expect(page.getByText("2 items in your order", { exact: true })).toBeVisible();
});

test("saved PR 21 shoe and bag sizes restore without losing or duplicating units @features", async ({ page }) => {
  const shoes = PRODUCTS.find((product) => product.id === "prod-08")!;
  const bag = PRODUCTS.find((product) => product.id === "prod-28")!;
  await page.addInitScript((saved) => localStorage.setItem("aceso_cart", JSON.stringify(saved)), [
    { product: shoes, quantity: 2, size: "M" },
    { product: shoes, quantity: 1, size: "L" },
    { product: bag, quantity: 1, size: "M" },
    { product: bag, quantity: 2, size: "XL" },
  ]);
  await page.goto("/cart");
  await expect(page.getByText("6 items in your order", { exact: true })).toBeVisible();
  await expect(page.getByTestId("cart-line")).toHaveCount(2);
  await expect(page.getByText("Size: UK 9", { exact: true })).toBeVisible();
  const bagLine = page.getByTestId("cart-line").filter({ hasText: bag.name });
  await expect(bagLine.getByText(/^Size:/)).toHaveCount(0);
});
