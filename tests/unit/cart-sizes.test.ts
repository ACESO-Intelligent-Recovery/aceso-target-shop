import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { addCartItem, cartItemKey, productSize, removeCartItem, setCartQuantity } from "@/lib/cart-items";

const shirt = PRODUCTS.find((product) => product.id === "prod-07")!;
const headphones = PRODUCTS.find((product) => product.id === "prod-01")!;

describe("cart sizes", () => {
  it("preselects M for apparel, including adds from catalogue cards", () => {
    expect(productSize(shirt)).toBe("M");
    expect(addCartItem([], shirt)).toEqual([{ product: shirt, quantity: 1, size: "M" }]);
  });

  it("keeps two sizes of the same product in separate lines and counts both units", () => {
    const items = addCartItem(addCartItem([], shirt, 1, "S"), shirt, 2, "L");
    expect(items.map(({ size, quantity }) => [size, quantity])).toEqual([["S", 1], ["L", 2]]);
    expect(new Set(items.map((item) => cartItemKey(item.product, item.size))).size).toBe(2);
    expect(items.reduce((sum, item) => sum + item.quantity, 0)).toBe(3);
    expect(items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)).toBe(174);
  });

  it("merges the same product and size without mutating the earlier cart", () => {
    const original = addCartItem([], shirt, 1, "XL");
    const merged = addCartItem(original, shirt, 2, "XL");
    expect(merged).toEqual([{ product: shirt, size: "XL", quantity: 3 }]);
    expect(original[0].quantity).toBe(1);
  });

  it("keeps products without sizes behaving as before, even if a size was supplied", () => {
    expect(productSize(headphones)).toBeUndefined();
    const items = addCartItem(addCartItem([], headphones), headphones, 2, "XL");
    expect(items).toEqual([{ product: headphones, quantity: 3 }]);
    expect(cartItemKey(headphones)).toBe(headphones.id);
  });

  it("treats a saved apparel line without a size as M and merges into it", () => {
    const saved = [{ product: shirt, quantity: 2 }];
    expect(addCartItem(saved, shirt, 1, "M")).toEqual([{ product: shirt, quantity: 3, size: "M" }]);
    expect(cartItemKey(shirt)).toBe(cartItemKey(shirt, "M"));
  });

  it("updates, decrements to zero and removes only the chosen size", () => {
    const items = addCartItem(addCartItem([], shirt, 1, "M"), shirt, 1, "L");
    const key = cartItemKey(shirt, "L");
    expect(setCartQuantity(items, key, 3).map((item) => item.quantity)).toEqual([1, 3]);
    expect(setCartQuantity(items, key, 0)).toEqual([items[0]]);
    expect(removeCartItem(items, key)).toEqual([items[0]]);
    expect(removeCartItem(items, cartItemKey(shirt, "M"))).toEqual([items[1]]);
  });
});
