"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/telemetry";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    trackEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
    });
  };

  return (
    <div className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-neutral-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-neutral-700 text-[10px] font-semibold uppercase tracking-wider rounded-md">
          {product.category}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-amber-500 mb-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-neutral-800">{product.rating}</span>
          <span className="text-neutral-400">({product.reviewsCount})</span>
        </div>

        <Link href={`/product/${product.id}`} className="flex-1">
          <h3 className="font-medium text-sm text-neutral-900 line-clamp-2 group-hover:text-emerald-600 transition">
            {product.name}
          </h3>
        </Link>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Price</span>
            <span className="text-base font-bold text-neutral-900">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
