import type { Product } from "./products";

export const CLOTHING_SIZES = ["S", "M", "L", "XL"] as const;
export type ClothingSize = (typeof CLOTHING_SIZES)[number];

export interface CartItem {
  product: Product;
  quantity: number;
  size?: ClothingSize;
}

export function productSize(product: Product, size: ClothingSize = "M") {
  return product.category === "apparel" ? size : undefined;
}

export function cartItemKey(product: Product, size?: ClothingSize): string {
  const selected = productSize(product, size);
  // Default-size and non-apparel lines keep the original product-id identity.
  return selected && selected !== "M" ? `${product.id}:${selected}` : product.id;
}

export function addCartItem(
  items: CartItem[],
  product: Product,
  quantity = 1,
  size?: ClothingSize,
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

export function removeCartItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((item) => cartItemKey(item.product, item.size) !== key);
}

export function setCartQuantity(items: CartItem[], key: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeCartItem(items, key);
  return items.map((item) =>
    cartItemKey(item.product, item.size) === key ? { ...item, quantity } : item
  );
}
