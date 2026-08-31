"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { listingApi, favoriteApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/category-icon";
import {
  Search,
  SlidersHorizontal,
  X,
  Building2,
  ArrowUpDown,
} from "lucide-react";

function ListingsContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All Fits");
  const [gender, setGender] = useState("ALL");
  const [size, setSize] = useState("ALL");
  const [condition, setCondition] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { label: "All Fits", category: "all" },
    { label: "Ethnic & Fest", category: "ethnic" },
    { label: "Suits & Formals", category: "formal" },
    { label: "Party & Club", category: "party" },
    { label: "Jackets & Denim", category: "jacket" },
    { label: "Streetwear & Hoodies", category: "hoodie" },
    { label: "Shirts & Tops", category: "shirt" },
  ];

  const sizes = ["ALL", "XS", "S", "M", "L", "XL", "XXL", "FREE"];
  const conditions = ["ALL", "Brand New", "Like New", "Excellent", "Good"];

  useEffect(() => {
    fetchListings();
    if (isAuthenticated) fetchFavorites();
  }, [category, gender, size, condition, sort, isAuthenticated]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (category !== "All" && category !== "All Fits") params.category = category;
      if (gender !== "ALL") params.gender = gender;
      if (size !== "ALL") params.size = size;
      if (condition !== "ALL") params.condition = condition;
      if (search.trim()) params.search = search.trim();
      if (sort) params.sort = sort;

      const res = await listingApi.getAll(params);
      setListings(res.data.listings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await favoriteApi.getMy();
      const favs = res.data.listings || [];
      setFavorites(new Set(favs.map((l: any) => l.id)));
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All Fits");
    setGender("ALL");
    setSize("ALL");
    setCondition("ALL");
    setSort("newest");
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-14">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111215] dark:text-[#F4EFE6] tracking-tight">
                Campus Closet Lookbook
              </h1>
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-sm bg-[#ECE6DA] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#D4CCBC] dark:border-[#2D3340]">
                {listings.length} FITS ON CAMPUS
              </span>
            </div>
            <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] mt-1 flex items-center gap-1.5 font-sans">
              <Building2 className="w-3.5 h-3.5 text-[#E85938]" />
              <span>
                Browsing wardrobes in:{" "}
                <strong className="text-[#111215] dark:text-[#F4EFE6] font-semibold">
                  {user?.college || "KIET Group of Institutions"}
                </strong>
              </span>
            </p>
          </div>

          {/* Search + Mobile Filter Toggle */}
          <div className="flex items-center gap-2 max-w-md w-full">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
              <Input
                placeholder="Search fits, brands, colors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-xs rounded-sm bg-[#FAF7F2] dark:bg-[#15171C] border-[#DCD5C6] dark:border-[#22262F] font-sans"
              />
            </form>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-10 px-3 rounded-sm border-[#DCD5C6] dark:border-[#22262F] text-xs font-mono font-bold flex items-center gap-1.5 md:hidden"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E85938]" />
              Filters
            </Button>
          </div>
        </div>

        {/* The Campus Rack — Category Horizontal Tag Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                category === cat.label
                  ? "bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] border-[#111215] dark:border-[#F4EFE6] shadow-xs scale-105"
                  : "bg-[#FAF7F2] dark:bg-[#15171C] text-[#4A4741] dark:text-[#BBB4A6] border-[#DCD5C6] dark:border-[#22262F] hover:border-[#111215] dark:hover:border-[#E85938]"
              }`}
            >
              <CategoryIcon category={cat.category} className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls Panel */}
        <div
          className={`p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F] space-y-3 ${
            showFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-[#8C867A] uppercase">Gender:</span>
              <div className="flex gap-1">
                {["ALL", "MALE", "FEMALE", "UNISEX"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold transition-colors ${
                      gender === g
                        ? "bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215]"
                        : "bg-[#ECE6DA] dark:bg-[#1E222A] text-[#4A4741] dark:text-[#BBB4A6] hover:bg-[#DCD5C6] dark:hover:bg-[#282D38]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-[#8C867A] uppercase">Size:</span>
              <div className="flex gap-1 overflow-x-auto">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold transition-colors ${
                      size === s
                        ? "bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215]"
                        : "bg-[#ECE6DA] dark:bg-[#1E222A] text-[#4A4741] dark:text-[#BBB4A6] hover:bg-[#DCD5C6] dark:hover:bg-[#282D38]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-[#E85938]" />
              <span className="font-mono text-[9px] font-bold text-[#8C867A] uppercase">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-7 px-2 text-[11px] rounded-sm bg-[#ECE6DA] dark:bg-[#1E222A] border-none text-[#111215] dark:text-[#F4EFE6] font-mono font-bold focus:ring-1 focus:ring-[#E85938]"
              >
                <option value="newest">Fresh Drops (Newest)</option>
                <option value="price-low">Day Rate: Low to High</option>
                <option value="price-high">Day Rate: High to Low</option>
                <option value="night-price-low">Night Rate: Low to High</option>
                <option value="rating">Top Rated Students</option>
              </select>
            </div>

            {(category !== "All Fits" ||
              gender !== "ALL" ||
              size !== "ALL" ||
              condition !== "ALL" ||
              search) && (
              <button
                onClick={clearFilters}
                className="font-mono text-[10px] font-bold text-[#E85938] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Lookbook Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-[#ECE6DA] dark:bg-[#15171C] aspect-[3/4.2] animate-pulse"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-14 text-center bg-[#FAF7F2] dark:bg-[#15171C] rounded-xl border border-[#DCD5C6] dark:border-[#22262F] space-y-3">
            <div className="w-9 h-9 bg-[#ECE6DA] dark:bg-[#1E222A] text-[#8C867A] rounded-full flex items-center justify-center mx-auto text-base">
              🏷️
            </div>
            <h3 className="font-display font-bold text-base text-[#111215] dark:text-[#F4EFE6]">
              No campus fits found
            </h3>
            <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] max-w-sm mx-auto font-sans">
              We couldn&apos;t find any outfits matching your active search and filters.
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-sm text-xs h-8 font-mono font-bold"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavoritedInitially={favorites.has(listing.id)}
                onFavoriteChange={(fav) => {
                  setFavorites((prev) => {
                    const copy = new Set(prev);
                    if (fav) copy.add(listing.id);
                    else copy.delete(listing.id);
                    return copy;
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-[#8C867A]">
          Loading Campus Closet...
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
