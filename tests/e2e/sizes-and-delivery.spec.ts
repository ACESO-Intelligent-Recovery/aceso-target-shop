import { test, expect } from "./fixtures";

test.use({ timezoneId: "UTC" });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ACESO_SYNTHETIC__ = true;
    window.__ACESO_EVENTS__ = [];
  });
});

test("clothing size is keyboard usable and follows the choice into cart and checkout @features", async ({ page }, testInfo) => {
  await page.goto("/product/prod-07");
  // A product-view event confirms hydration before using the selector.
  await expect.poll(() => page.evaluate(() => (window.__ACESO_EVENTS__ || []).filter((event) => event.event === "product_viewed").length)).toBeGreaterThan(0);
  const initialViews = await page.evaluate(() => (window.__ACESO_EVENTS__ || []).filter((event) => event.event === "product_viewed").length);
  const selector = page.getByLabel("Size:", { exact: true });
  await expect(selector).toHaveValue("M");
  await expect(selector.locator("option")).toHaveText(["S", "M", "L", "XL"]);
  await selector.focus();
  await selector.press("ArrowDown");
  await selector.press("Enter");
  await expect(selector).toHaveValue("L");
  await page.screenshot({ path: testInfo.outputPath("product-sizes.png"), fullPage: true });
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByText(/Added 1 ×/)).toBeVisible();
  const events = await page.evaluate(() => window.__ACESO_EVENTS__ || []);
  expect(events.filter((event) => event.event === "product_viewed")).toHaveLength(initialViews);
  const adds = events.filter((event) => event.event === "add_to_cart");
  expect(adds).toHaveLength(1);
  expect(adds[0]).toMatchObject({ productId: "prod-07", productName: "Tailored Oxford Button-Down Shirt", price: 58, quantity: 1, category: "apparel" });
  await page.goto("/cart");
  await expect(page.getByText("Size: L", { exact: true })).toBeVisible();
  await expect(page.getByText("1 items in your order", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Proceed to Checkout" }).click();
  await expect(page.getByText("Size: L", { exact: true })).toBeVisible();
});

test("two sizes remain separate when adjusting or removing a cart line @features", async ({ page }) => {
  await page.goto("/product/prod-07");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed"))).toBe(true);
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await expect(page.getByText(/Added 1 ×/)).toBeVisible();
  await page.getByLabel("Size:", { exact: true }).selectOption("L");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(2);
  await expect(page.getByText("2 items in your order", { exact: true })).toBeVisible();
  const large = page.getByTestId("cart-line").filter({ hasText: "Size: L" });
  await large.getByRole("button", { name: "+", exact: true }).click();
  await expect(large.getByText("$116.00", { exact: true })).toBeVisible();
  await expect(page.getByText("3 items in your order", { exact: true })).toBeVisible();
  await large.getByRole("button", { name: "-", exact: true }).click();
  await expect(page.getByText("2 items in your order", { exact: true })).toBeVisible();
  await large.getByTitle("Remove item").click();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByText("Size: M", { exact: true })).toBeVisible();
});

test("buy now works with the default clothing size and other products have no selector @features", async ({ page }) => {
  await page.goto("/product/prod-01");
  await expect(page.getByLabel("Size:", { exact: true })).toHaveCount(0);
  await page.goto("/product/prod-07");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed"))).toBe(true);
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Size: M", { exact: true })).toBeVisible();
  await expect(page.getByText("Qty: 1", { exact: true })).toBeVisible();
});

test("confirmation adds five calendar days after mount without changing the redirect @features", async ({ page }, testInfo) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.clock.setFixedTime(new Date("2026-10-13T12:00:00Z"));
  await page.goto("/product/prod-07");
  await expect.poll(() => page.evaluate(() => window.__ACESO_EVENTS__?.some((event) => event.event === "product_viewed"))).toBe(true);
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  await expect(page.getByRole("button", { name: /Place Order/ })).toBeVisible();
  await page.getByRole("button", { name: /Place Order/ }).click();
  await expect(page.getByRole("heading", { name: "Order Confirmed!" })).toBeVisible();
  await expect(page.getByText("Estimated delivery", { exact: true })).toBeVisible();
  await expect(page.locator("time")).toHaveText("18 Oct 2026");
  await expect(page.locator("time")).toHaveAttribute("datetime", "2026-10-18");
  expect(new URL(page.url()).searchParams.has("delivery")).toBe(false);
  await expect(page.getByText("$62.64", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("order-delivery.png"), fullPage: true });
  expect(pageErrors).toHaveLength(0);
});

test("delivery date crosses the year boundary in the same fixed format @features", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-29T12:00:00Z"));
  await page.goto("/order-success?orderId=ORD-TEST&total=58.00");
  await expect(page.locator("time")).toHaveText("03 Jan 2027");
  await expect(page.locator("time")).toHaveAttribute("datetime", "2027-01-03");
});
