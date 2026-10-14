import type { Product } from "./products";

export const CLOTHING_SIZES = ["S", "M", "L", "XL"] as const;
export type ClothingSize = (typeof CLOTHING_SIZES)[number];
export const SHOE_SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"] as const;
export type ProductSize = ClothingSize | (typeof SHOE_SIZES)[number];

interface SizeRule {
  options: readonly ProductSize[];
  defaultSize: ProductSize;
}

const clothingRule: SizeRule = { options: CLOTHING_SIZES, defaultSize: "M" };
const SIZE_RULES: ReadonlyMap<string, SizeRule> = new Map([
  ["prod-06", clothingRule],
  ["prod-07", clothingRule],
  ["prod-09", clothingRule],
  ["prod-10", clothingRule],
  ["prod-08", { options: SHOE_SIZES, defaultSize: "UK 9" }],
]);

export interface CartItem {
  product: Product;
  quantity: number;
  size?: ProductSize;
}

export function productSizes(product: Product): readonly ProductSize[] {
  return SIZE_RULES.get(product.id)?.options ?? [];
}

export function productSize(product: Product, size?: ProductSize): ProductSize | undefined {
  const rule = SIZE_RULES.get(product.id);
  if (!rule) return undefined;
  return size && rule.options.includes(size) ? size : rule.defaultSize;
}

export function cartItemKey(product: Product, size?: ProductSize): string {
  const selected = productSize(product, size);
  // Default-size and unsized lines keep the original product-id identity.
  return selected && selected !== productSize(product) ? `${product.id}:${selected}` : product.id;
}

export function addCartItem(
  items: CartItem[],
  product: Product,
  quantity = 1,
  size?: ProductSize,
): CartItem[] {
  const selected = productSize(product, size);
  const key = cartItemKey(product, selected);
  const exists = items.some((item) => cartItemKey(item.product, item.size) === key);
  const choice = selected ? { size: selected } : {};
  if (exists) {
    return items.map((item) =>
      cartItemKey(item.product, item.size) === key
        ? { ...item, ...choice, quantity: item.quantity + quantity }
        : item
    );
  }
  return [...items, { product, quantity, ...choice }];
}

export function normalizeCartItems(items: CartItem[]): CartItem[] {
  return items.reduce<CartItem[]>(
    (cart, item) => addCartItem(cart, item.product, item.quantity, item.size), []
  );
}

export function removeCartItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((item) => cartItemKey(item.product, item.size) !== key);
}

export function setCartQuantity(items: CartItem[], key: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeCartItem(items, key);
  return items.map((item) =>
    cartItemKey(item.product, item.size) === key ? { ...item, quantity } : item
  );
}
