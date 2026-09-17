import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, RefreshCw } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export default function HomePage() {
  const featuredProducts = PRODUCTS.slice(0, 8);

  const categories = [
    { id: "electronics", label: "Electronics", count: 8, icon: "⚡" },
    { id: "apparel", label: "Apparel", count: 6, icon: "👕" },
    { id: "home", label: "Home & Kitchen", count: 5, icon: "☕" },
    { id: "books", label: "Technical Books", count: 5, icon: "📚" },
    { id: "outdoor", label: "Outdoor Gear", count: 6, icon: "🏕️" },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AcesoLoop Monitored Reference Target</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Next-Gen E-Commerce, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Closed-Loop Self-Healing.
            </span>
          </h1>

          <p className="text-neutral-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Welcome to the testbed for autonomous software recovery. This store emits real-time PostHog user telemetry
            and Sentry crash reports evaluated by AcesoLoop agents.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-900/30 text-sm"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition text-sm border border-white/10"
            >
              <span>Synthetic Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-start gap-4 shadow-2xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900">Live Funnel Signals</h3>
              <p className="text-xs text-neutral-500 mt-1">PostHog tracks every search, cart addition, and checkout flow.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-start gap-4 shadow-2xs">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900">Synthetic Playwright Cron</h3>
              <p className="text-xs text-neutral-500 mt-1">Automated user journeys run 6 times an hour with synthetic headers.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 flex items-start gap-4 shadow-2xs">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900">Verified Recovery</h3>
              <p className="text-xs text-neutral-500 mt-1">Canary-gated releases verified by anomaly detectors before promote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Shop by Category</h2>
          <Link href="/search" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="bg-white border border-neutral-200 p-4 rounded-xl hover:border-emerald-500 hover:shadow-sm transition group"
            >
              <div className="text-2xl mb-1.5">{cat.icon}</div>
              <div className="font-semibold text-sm text-neutral-800 group-hover:text-emerald-600 transition">
                {cat.label}
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{cat.count} items</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Featured Products</h2>
            <p className="text-xs text-neutral-500 mt-1">Deterministic catalogue for synthetic and manual test runs.</p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Full Catalog (30)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
