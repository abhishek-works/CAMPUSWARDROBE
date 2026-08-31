"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { listingApi, favoriteApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CategoryIcon } from "@/components/category-icon";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  Tag,
  PlusCircle,
  Compass,
  GraduationCap,
  PartyPopper,
  Flame,
  Coffee,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Fits");
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const categories = [
    { label: "All Fits", category: "all" },
    { label: "Ethnic & Fest", category: "ethnic" },
    { label: "Suits & Formals", category: "formal" },
    { label: "Party & Club", category: "party" },
    { label: "Jackets & Denim", category: "jacket" },
    { label: "Streetwear & Hoodies", category: "hoodie" },
    { label: "Shirts & Tops", category: "shirt" },
  ];

  const campusOccasions = [
    {
      id: "placements",
      title: "Placement Drive Tomorrow",
      subtitle: "Tailored Raymond suits & non-iron shirts",
      category: "formal",
      icon: GraduationCap,
      accent: "bg-[#1E3A2F]/10 border-[#1E3A2F]/30 text-[#1E3A2F] dark:bg-[#1E3A2F]/30 dark:border-[#1E3A2F]/50 dark:text-[#A8C7B8]",
    },
    {
      id: "fest",
      title: "Diwali & Epoque Fest",
      subtitle: "Chikankari kurtas & velvet lehengas",
      category: "ethnic",
      icon: PartyPopper,
      accent: "bg-[#D4A373]/15 border-[#D4A373]/35 text-[#8C6030] dark:bg-[#D4A373]/20 dark:border-[#D4A373]/40 dark:text-[#E5BE97]",
    },
    {
      id: "djnight",
      title: "Celebrity / DJ Night",
      subtitle: "Velvet tuxedos & statement fits",
      category: "party",
      icon: Flame,
      accent: "bg-[#5C204B]/10 border-[#5C204B]/30 text-[#5C204B] dark:bg-[#5C204B]/30 dark:border-[#5C204B]/50 dark:text-[#D489BF]",
    },
    {
      id: "chill",
      title: "Chai & Chill at Kundan",
      subtitle: "Heavyweight hoodies & washed denim",
      category: "jacket",
      icon: Coffee,
      accent: "bg-[#E85938]/10 border-[#E85938]/30 text-[#C64324] dark:bg-[#E85938]/25 dark:border-[#E85938]/40 dark:text-[#F0775A]",
    },
  ];

  const liveTickers = [
    { text: "Abhishek handed over Raymond Tux at BH-3 Gate", time: "8m ago" },
    { text: "Sneha verified Mohey Lehenga pickup at GH-1 Lounge", time: "24m ago" },
    { text: "Priyanshu returned H&M Hoodie at Kundan Chaiwala", time: "1h ago" },
    { text: "Aman listed Zara Slim Black Jeans in CS Dept", time: "2h ago" },
  ];

  useEffect(() => {
    fetchListings();
    if (isAuthenticated) {
      fetchUserFavorites();
    }
  }, [activeCategory, selectedOccasion, isAuthenticated]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 12 };
      if (selectedOccasion) {
        const occ = campusOccasions.find((o) => o.id === selectedOccasion);
        if (occ) params.category = occ.category;
      } else if (activeCategory !== "All Fits" && activeCategory !== "All") {
        params.category = activeCategory;
      }
      const res = await listingApi.getAll(params);
      setListings(res.data.listings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const res = await favoriteApi.getMy();
      const favListings = res.data.listings || [];
      setFavorites(new Set(favListings.map((l: any) => l.id)));
    } catch {
      // ignore
    }
  };

  return (
    <AppLayout>
      <div className="space-y-10 pb-16">
        {/* Live Campus Handover Ticker */}
        <div className="rounded-lg bg-[#ECE6DA] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F] p-2 flex items-center gap-3 overflow-hidden text-xs">
          <div className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] px-2 py-0.5 rounded-sm shrink-0">
            <Zap className="w-2.5 h-2.5 fill-[#E85938] text-[#E85938]" />
            <span>CAMPUS LIVE</span>
          </div>

          <div className="flex gap-6 overflow-x-auto whitespace-nowrap scrollbar-none font-mono text-[11px] text-[#4A4741] dark:text-[#BBB4A6]">
            {liveTickers.map((tick, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A2F] dark:bg-[#589E83]" />
                <span className="font-medium text-[#111215] dark:text-[#F4EFE6]">{tick.text}</span>
                <span className="text-[#8C867A] text-[10px]">({tick.time})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Hero Lookbook */}
        <div className="relative rounded-2xl overflow-hidden bg-[#111215] text-[#F4EFE6] p-6 sm:p-10 lg:p-12 border border-[#2B2F38] shadow-md">
          {/* Subtle background photo */}
          <Image
            src="/auth-bg.jpg"
            alt="KIET Campus Life - Kundan Chaiwala Landmark"
            fill
            priority
            className="object-cover object-center opacity-20 scale-105 transition-transform duration-1000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-[#111215]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111215] via-[#111215]/60 to-transparent" />

          {/* Top Campus Stamp */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-[#F4EFE6]/10 backdrop-blur-md border border-[#F4EFE6]/15 px-3 py-1 rounded-full font-mono text-xs text-[#F4EFE6]">
              <Building2 className="w-3.5 h-3.5 text-[#E85938]" />
              <span>{user?.college || "KIET Group of Institutions"}</span>
              <span className="text-[#8C867A]">• Wardrobe Guild</span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C867A]">
              [ ZERO-COMMUTE // HOSTEL &amp; GATE HANDOVER ]
            </span>
          </div>

          {/* Editorial Committed Headline (Single Tone) */}
          <div className="relative z-10 my-6 sm:my-8 max-w-3xl space-y-3">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-[#F4EFE6]">
              5,000 Closets on Campus. Yours Between Classes.
            </h1>
            <p className="text-xs sm:text-sm text-[#C8C0AF] max-w-xl leading-relaxed font-sans">
              Peer-to-peer wardrobe sharing across KIET hostels and lecture halls. Borrow placement
              suits, festival lehengas, and oversized streetwear right next door with flexible{" "}
              <strong className="text-[#F4EFE6]">Day &amp; Night rental rates</strong>.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link href="/listings">
              <button className="h-10 px-5 rounded-sm bg-[#F4EFE6] text-[#111215] hover:bg-white font-display font-bold text-xs tracking-wide flex items-center gap-2 transition-all active:scale-95">
                <Compass className="w-4 h-4 text-[#E85938]" />
                Browse Campus Closet
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link href="/listings/create">
              <button className="h-10 px-5 rounded-sm bg-[#F4EFE6]/10 hover:bg-[#F4EFE6]/20 border border-[#F4EFE6]/20 text-[#F4EFE6] font-display font-bold text-xs tracking-wide backdrop-blur-md flex items-center gap-2 transition-all active:scale-95">
                <PlusCircle className="w-4 h-4 text-[#D4A373]" />
                List Your Outfit
              </button>
            </Link>
          </div>
        </div>

        {/* Campus Occasion Quick-Jump Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] font-bold text-[#E85938] uppercase tracking-wider">
                CURATED OCCASIONS
              </span>
              <h2 className="font-display font-bold text-xl text-[#111215] dark:text-[#F4EFE6]">
                What Are You Dressing For?
              </h2>
            </div>
            {selectedOccasion && (
              <button
                onClick={() => setSelectedOccasion(null)}
                className="text-xs font-mono font-bold text-[#E85938] hover:underline"
              >
                Clear occasion ×
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {campusOccasions.map((occ) => {
              const Icon = occ.icon;
              const isSelected = selectedOccasion === occ.id;
              return (
                <div
                  key={occ.id}
                  onClick={() =>
                    setSelectedOccasion(selectedOccasion === occ.id ? null : occ.id)
                  }
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    occ.accent
                  } ${
                    isSelected
                      ? "ring-2 ring-[#111215] dark:ring-[#E85938] scale-[1.01]"
                      : "hover:scale-[1.005]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="font-mono text-[8px] uppercase tracking-widest opacity-75">
                      CAMPUS SPOT
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm leading-snug">{occ.title}</h4>
                  <p className="text-[11px] opacity-85 mt-1 leading-tight">{occ.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Campus Rack — Tactile Garment Tag Category Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#111215] dark:text-[#F4EFE6] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#E85938]" />
              The Campus Rack
            </h2>
            <Link
              href="/listings"
              className="font-mono text-xs font-bold text-[#111215] dark:text-[#F4EFE6] hover:text-[#E85938] flex items-center gap-1"
            >
              All Listings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.label && !selectedOccasion;
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSelectedOccasion(null);
                    setActiveCategory(cat.label);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] border-[#111215] dark:border-[#F4EFE6] shadow-xs"
                      : "bg-[#FAF7F2] dark:bg-[#15171C] text-[#4A4741] dark:text-[#BBB4A6] border-[#DCD5C6] dark:border-[#22262F] hover:border-[#111215] dark:hover:border-[#E85938]"
                  }`}
                >
                  <CategoryIcon category={cat.category} className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campus Feed: Lookbook Outfits Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-[#111215] dark:text-[#F4EFE6]">
                Fresh Outfits on Campus
              </h2>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] mt-0.5 font-sans">
                Ready for handover at Kundan Chaiwala, BH-3 Gate, or GH-1 Lounge
              </p>
            </div>
            <Link
              href="/listings"
              className="font-mono text-xs font-bold text-[#E85938] hover:underline"
            >
              View catalog ({listings.length}) →
            </Link>
          </div>

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
            <div className="p-12 text-center rounded-xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F] space-y-3">
              <Tag className="w-8 h-8 text-[#8C867A] mx-auto" />
              <h3 className="font-display font-bold text-base text-[#111215] dark:text-[#F4EFE6]">
                No outfits found in this rack
              </h3>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] max-w-sm mx-auto font-sans">
                Be the first student to list an outfit in this category and start earning!
              </p>
              <Link href="/listings/create">
                <button className="h-8 px-4 rounded-sm text-xs font-display font-bold bg-[#E85938] hover:bg-[#C64324] text-white">
                  <PlusCircle className="w-3.5 h-3.5 mr-1 inline" /> List an Outfit
                </button>
              </Link>
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

        {/* How It Works: Zero-Commute Protocol */}
        <div className="p-7 bg-[#FAF7F2] dark:bg-[#15171C] text-[#111215] dark:text-[#F4EFE6] rounded-2xl border border-[#DCD5C6] dark:border-[#22262F] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[9px] font-bold text-[#E85938] uppercase tracking-widest font-mono">
              ZERO-COMMUTE PROTOCOL
            </span>
            <h3 className="text-2xl font-display font-extrabold text-[#111215] dark:text-[#F4EFE6] tracking-tight">
              How CampusWardrobe Works
            </h3>
            <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] font-sans">
              Student-verified garment exchanges right on your campus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] space-y-1.5">
              <div className="w-7 h-7 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-mono font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h4 className="font-display font-bold text-sm text-[#111215] dark:text-[#F4EFE6]">
                Choose Outfit
              </h4>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] leading-relaxed font-sans">
                Book for Day rate (classes &amp; placements) or Night rate (festivals &amp; DJ nights).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] space-y-1.5">
              <div className="w-7 h-7 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-mono font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h4 className="font-display font-bold text-sm text-[#111215] dark:text-[#F4EFE6]">
                Get QR Pass
              </h4>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] leading-relaxed font-sans">
                Encrypted QR booking pass generated with escrow-secured student deposit.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] space-y-1.5">
              <div className="w-7 h-7 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-mono font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h4 className="font-display font-bold text-sm text-[#111215] dark:text-[#F4EFE6]">
                Meet &amp; Scan
              </h4>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] leading-relaxed font-sans">
                Meet at Kundan Chaiwala stall or BH-3 Gate; owner camera-scans your QR pass.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] space-y-1.5">
              <div className="w-7 h-7 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-mono font-bold flex items-center justify-center text-xs">
                04
              </div>
              <h4 className="font-display font-bold text-sm text-[#111215] dark:text-[#F4EFE6]">
                Return &amp; Refund
              </h4>
              <p className="text-xs text-[#6D6B65] dark:text-[#9A968D] leading-relaxed font-sans">
                Hand the outfit back after your event, and your deposit is refunded instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
