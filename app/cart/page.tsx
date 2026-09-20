"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, totalCount } = useCart();
  const router = useRouter();

  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Your Cart is Empty</h1>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Browse our catalogue and add items to your cart to test the full checkout funnel.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{totalCount} items in your order</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 hover:text-red-600 transition"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl border border-neutral-200 flex gap-4 items-center shadow-2xs"
            >
              <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${product.id}`}
                  className="font-semibold text-sm text-neutral-900 hover:text-emerald-600 truncate block transition"
                >
                  {product.name}
                </Link>
                <div className="text-xs text-neutral-500 mt-0.5">${product.price.toFixed(2)} each</div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-neutral-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-neutral-400 hover:text-red-500 p-1 rounded-md transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-neutral-900">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs h-fit space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Order Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Estimated Shipping</span>
              <span className="text-emerald-600 font-semibold">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-neutral-900">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-extrabold text-neutral-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-xs text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
