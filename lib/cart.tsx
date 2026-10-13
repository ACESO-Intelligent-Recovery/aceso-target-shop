"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "./products";
import { addCartItem, removeCartItem, setCartQuantity, type CartItem, type ClothingSize } from "./cart-items";

export type { CartItem } from "./cart-items";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: ClothingSize) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aceso_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage read errors
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("aceso_cart", JSON.stringify(items));
      } catch {
        // Ignore storage write errors
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1, size?: ClothingSize) => {
    setItems((prev) => addCartItem(prev, product, quantity, size));
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => removeCartItem(prev, productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) => setCartQuantity(prev, productId, quantity));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
