import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { addCartItem, cartItemKey, normalizeCartItems, productSize, productSizes } from "@/lib/cart-items";

const shoes = PRODUCTS.find((product) => product.id === "prod-08")!;
const bag = PRODUCTS.find((product) => product.id === "prod-28")!;
const headphones = PRODUCTS.find((product) => product.id === "prod-01")!;

describe("sizes by product id", () => {
  it("offers UK 6 through UK 11 for shoes with UK 9 as the default", () => {
    expect(productSizes(shoes)).toEqual(["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]);
    expect(productSize(shoes)).toBe("UK 9");
    expect(addCartItem([], shoes)).toEqual([{ product: shoes, quantity: 1, size: "UK 9" }]);
  });

  it.each([bag, headphones])("offers no size for $id", (product) => {
    expect(productSizes(product)).toEqual([]);
    expect(productSize(product)).toBeUndefined();
    expect(productSize(product, "M")).toBeUndefined();
    expect(addCartItem([], product, 1, "M")).toEqual([{ product, quantity: 1 }]);
    expect(cartItemKey(product, "M")).toBe(product.id);
  });

  it("keeps UK 8 and UK 10 in distinct lines, merging only matching sizes", () => {
    const twoSizes = addCartItem(addCartItem([], shoes, 1, "UK 8"), shoes, 1, "UK 10");
    expect(twoSizes.map(({ size, quantity }) => [size, quantity])).toEqual([["UK 8", 1], ["UK 10", 1]]);
    expect(cartItemKey(shoes, "UK 8")).not.toBe(cartItemKey(shoes, "UK 10"));
    expect(addCartItem(twoSizes, shoes, 1, "UK 8").map((item) => item.quantity)).toEqual([2, 1]);
  });

  it("keeps the default shoe on the plain product-id key, including saved M lines", () => {
    expect(cartItemKey(shoes)).toBe("prod-08");
    expect(cartItemKey(shoes, "UK 9")).toBe("prod-08");
    expect(cartItemKey(shoes, "M")).toBe("prod-08");
    expect(normalizeCartItems([{ product: shoes, size: "M", quantity: 2 }])).toEqual([
      { product: shoes, size: "UK 9", quantity: 2 },
    ]);
  });

  it("consolidates obsolete shoe and bag sizes without changing their total units", () => {
    const saved = [
      { product: shoes, size: "M" as const, quantity: 2 },
      { product: shoes, size: "L" as const, quantity: 1 },
      { product: bag, size: "M" as const, quantity: 1 },
      { product: bag, size: "XL" as const, quantity: 2 },
    ];
    const restored = normalizeCartItems(saved);
    expect(restored).toEqual([
      { product: shoes, size: "UK 9", quantity: 3 }, { product: bag, quantity: 3 },
    ]);
    expect(restored.reduce((sum, item) => sum + item.quantity, 0)).toBe(6);
    expect(addCartItem(restored, shoes).map((item) => item.quantity)).toEqual([4, 3]);
    expect(saved.map((item) => item.quantity)).toEqual([2, 1, 1, 2]);
  });

  it.each(["prod-06", "prod-07", "prod-09", "prod-10"])("leaves %s clothing choices and keys unchanged", (id) => {
    const product = PRODUCTS.find((item) => item.id === id)!;
    expect(productSizes(product)).toEqual(["S", "M", "L", "XL"]);
    expect(productSize(product)).toBe("M");
    expect(cartItemKey(product, "M")).toBe(id);
    expect(cartItemKey(product, "L")).toBe(`${id}:L`);
  });

  it("gives every other product no size regardless of its category", () => {
    const sized = new Set(["prod-06", "prod-07", "prod-08", "prod-09", "prod-10"]);
    for (const product of PRODUCTS.filter((item) => !sized.has(item.id))) {
      expect(productSizes(product)).toEqual([]);
      expect(productSize(product)).toBeUndefined();
    }
  });
});
