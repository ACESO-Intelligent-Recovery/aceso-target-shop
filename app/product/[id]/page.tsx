"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingBag, ArrowLeft, Check, Shield, Truck } from "lucide-react";
import { getProductById } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/telemetry";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const product = getProductById(resolvedParams.id);

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedAlert, setAddedAlert] = useState(false);

  useEffect(() => {
    if (product) {
      // Track product_viewed funnel event for PostHog
      trackEvent("product_viewed", {
        productId: product.id,
        productName: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Product Not Found</h1>
        <p className="text-sm text-neutral-500">The product identifier &quot;{resolvedParams.id}&quot; does not exist in this catalogue.</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    trackEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-neutral-900">Home</Link>
        <span>/</span>
        <Link href={`/search?category=${product.category}`} className="capitalize hover:text-neutral-900">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-neutral-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-xs">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl bg-neutral-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-xs text-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-md">
            {product.category}
          </span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-neutral-900">{product.rating}</span>
              <span className="text-neutral-400">({product.reviewsCount} customer reviews)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
              {product.name}
            </h1>

            <div className="text-3xl font-black text-neutral-900">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-neutral-600 text-sm leading-relaxed pt-2 border-t border-neutral-100">
              {product.description}
            </p>

            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
              <Check className="w-3.5 h-3.5" />
              <span>In Stock ({product.stock} units available)</span>
            </div>
          </div>

          {/* Purchasing Controls */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-700">Quantity:</span>
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-700 font-bold text-sm transition"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-semibold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-700 font-bold text-sm transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl transition shadow-xs text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition shadow-xs text-sm"
              >
                Buy Now
              </button>
            </div>

            {addedAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Added {quantity} × &quot;{product.name}&quot; to your cart.</span>
              </div>
            )}

            {/* Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neutral-400" />
                <span>Free Synthetic Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-400" />
                <span>Telemetry Instrumented</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
