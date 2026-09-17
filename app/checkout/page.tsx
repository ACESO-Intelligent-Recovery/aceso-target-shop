"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/telemetry";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "Synthetic User",
    email: "synthetic-01@test.aceso.dev",
    address: "100 Innovation Way",
    city: "San Francisco",
    state: "CA",
    zip: "94107",
    cardNumber: "4242 •••• •••• 4242",
    expDate: "12/28",
    cvv: "123",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  useEffect(() => {
    if (items.length > 0) {
      // Track checkout_started funnel event for PostHog
      trackEvent("checkout_started", {
        itemsCount: items.length,
        subtotal,
        total,
      });
    }
  }, [items.length, subtotal, total]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Simulate network processing
    await new Promise((res) => setTimeout(res, 800));

    // Track checkout_completed funnel event for PostHog (HC-1.1 verification)
    trackEvent("checkout_completed", {
      orderId,
      total,
      itemsCount: items.reduce((acc, it) => acc + it.quantity, 0),
      items: items.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
      })),
    });

    clearCart();
    setIsProcessing(false);
    router.push(`/order-success?orderId=${orderId}&total=${total.toFixed(2)}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-bold text-neutral-900">Your cart is empty</h1>
        <p className="text-xs text-neutral-500">Add at least one product to checkout.</p>
        <Link
          href="/search"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Cart</span>
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Complete your synthetic payment and verify event delivery.</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Telemetry Armed</span>
        </div>
      </div>

      <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">1. Shipping Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-neutral-700 font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">2. Synthetic Payment</h2>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Simulated Sandbox</span>
              </div>
            </div>

            <div className="border border-emerald-500/50 bg-emerald-50/40 p-4 rounded-xl flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-950">Synthetic Test Card Active</p>
                <p className="text-emerald-700 mt-0.5">
                  Transactions in this reference shop are simulated. No actual financial processing takes place.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Expiration</label>
                  <input
                    type="text"
                    name="expDate"
                    required
                    value={formData.expDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Security Code (CVV)</label>
                  <input
                    type="text"
                    name="cvv"
                    required
                    value={formData.cvv}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Button */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-neutral-900">Order Summary</h2>

            <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-neutral-800">{product.name}</span>
                    <span className="text-neutral-400 block">Qty: {quantity}</span>
                  </div>
                  <span className="font-semibold text-neutral-900 flex-shrink-0">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between text-sm font-black text-neutral-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-400 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-sm text-sm"
            >
              {isProcessing ? (
                <span>Authorizing Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order (${total.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
