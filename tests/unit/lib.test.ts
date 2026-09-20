import { describe, expect, it } from "vitest";
import { getProducts, getProductById, PRODUCTS, type Product } from "@/lib/products";
import { findUserByEmailOrUsername, SYNTHETIC_USERS } from "@/lib/users";

describe("getProducts", () => {
  it("returns the full catalogue when no filters are given", () => {
    expect(getProducts().length).toBe(PRODUCTS.length);
  });

  it("filters by category", () => {
    const electronics = getProducts(undefined, "electronics");
    expect(electronics.length).toBeGreaterThan(0);
    expect(electronics.every((p: Product) => p.category === "electronics")).toBe(true);
  });

  it("ignores the category 'all' and returns everything", () => {
    expect(getProducts(undefined, "all").length).toBe(PRODUCTS.length);
  });

  it("filters by keyword across name, description, and category", () => {
    const result = getProducts("headphones");
    expect(result.map((p) => p.id)).toContain("prod-01");

    const cotton = getProducts("cotton");
    expect(cotton.some((p) => p.category === "apparel")).toBe(true);
  });

  it("is case-insensitive and trims the query", () => {
    expect(getProducts("  HEADPHONES  ").map((p) => p.id)).toEqual(
      getProducts("headphones").map((p) => p.id)
    );
  });

  it("returns no products for a nonsense query", () => {
    expect(getProducts("zzzznotaproduct")).toEqual([]);
  });

  it("combines category and keyword filters", () => {
    const result = getProducts("shoes", "apparel");
    expect(result.every((p) => p.category === "apparel")).toBe(true);
  });
});

describe("getProductById", () => {
  it("finds a product by id", () => {
    const product = getProductById("prod-01");
    expect(product).toBeDefined();
    expect(product?.name).toContain("Headphones");
  });

  it("returns undefined for an unknown id", () => {
    expect(getProductById("does-not-exist")).toBeUndefined();
  });
});

describe("findUserByEmailOrUsername", () => {
  it("finds a synthetic user by username", () => {
    const user = findUserByEmailOrUsername("synthetic-01");
    expect(user?.id).toBe("user-syn-01");
    expect(user?.isSynthetic).toBe(true);
  });

  it("finds a synthetic user by email, case-insensitively", () => {
    const user = findUserByEmailOrUsername("SYNTHETIC-02@Test.aceso.dev");
    expect(user?.id).toBe("user-syn-02");
  });

  it("trims surrounding whitespace", () => {
    expect(findUserByEmailOrUsername("  synthetic-03  ")?.id).toBe("user-syn-03");
  });

  it("returns undefined for an unknown identifier", () => {
    expect(findUserByEmailOrUsername("nobody")).toBeUndefined();
  });

  it("exposes exactly 20 synthetic accounts with unique ids", () => {
    expect(SYNTHETIC_USERS.length).toBe(20);
    expect(new Set(SYNTHETIC_USERS.map((u) => u.id)).size).toBe(20);
  });
});