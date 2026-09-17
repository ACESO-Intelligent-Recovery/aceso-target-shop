"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, User, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount } = useCart();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Aceso<span className="text-emerald-600">Shop</span></span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex items-center relative">
            <input
              type="text"
              placeholder="Search products (e.g. headphones, keyboard)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-50 focus:bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          </form>

          {/* Action Links */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/search"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 hidden md:block"
            >
              All Products
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100 transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 rounded-full font-medium text-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-xs font-bold rounded-full">
                  {totalCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
