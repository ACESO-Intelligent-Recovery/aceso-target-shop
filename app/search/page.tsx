"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProducts, Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { trackEvent } from "@/lib/telemetry";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "all";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedCategory(categoryParam);

    // Track search_performed funnel event for PostHog
    trackEvent("search_performed", {
      query: queryParam,
      category: categoryParam,
    });
  }, [queryParam, categoryParam]);

  const products: Product[] = getProducts(queryParam, categoryParam);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "electronics", label: "Electronics" },
    { id: "apparel", label: "Apparel" },
    { id: "home", label: "Home & Kitchen" },
    { id: "books", label: "Technical Books" },
    { id: "outdoor", label: "Outdoor Gear" },
  ];

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams();
    if (queryParam) params.set("q", queryParam);
    if (cat !== "all") params.set("category", cat);
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            {queryParam ? `Search results for "${queryParam}"` : "Product Catalogue"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {products.length} {products.length === 1 ? "product" : "products"} available
          </p>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Filter by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <SlidersHorizontal className="w-4 h-4 text-neutral-400 mr-1 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">No matching products found</h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Try checking for spelling errors or searching for a broader term like &quot;shoes&quot;, &quot;keyboard&quot;, or &quot;tent&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              router.push("/search");
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-500">Loading products...</div>}>
      <SearchContent />
    </Suspense>
  );
}
