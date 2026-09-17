"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, ShieldCheck, Package } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-000000";
  const total = searchParams.get("total") || "0.00";

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          Funnel Step: Checkout Completed
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900">Order Confirmed!</h1>
        <p className="text-xs text-neutral-500">
          Your synthetic order has been logged and the PostHog funnel event has been dispatched.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs text-left space-y-3 text-xs">
        <div className="flex justify-between pb-2 border-b border-neutral-100">
          <span className="text-neutral-500">Order Number</span>
          <span className="font-mono font-bold text-neutral-900">{orderId}</span>
        </div>
        <div className="flex justify-between pb-2 border-b border-neutral-100">
          <span className="text-neutral-500">Total Paid (Synthetic)</span>
          <span className="font-bold text-neutral-900">${total}</span>
        </div>
        <div className="flex justify-between pb-2 border-b border-neutral-100">
          <span className="text-neutral-500">Status</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            <span>Processing Dispatch</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Telemetry Proof</span>
          <span className="text-neutral-700 font-mono text-[11px]">checkout_completed ✅</span>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-neutral-500">Loading confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
