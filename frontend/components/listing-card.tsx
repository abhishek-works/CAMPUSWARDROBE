"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { favoriteApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CategoryIcon } from "@/components/category-icon";
import { Heart, Star, MapPin, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    images: string[];
    dailyPrice: number;
    nightPrice?: number;
    securityDeposit: number;
    category: string;
    size: string;
    gender?: string;
    brand?: string;
    condition?: string;
    color?: string;
    pickupLocation?: string;
    status?: string;
    owner?: {
      id: string;
      name: string;
      college: string;
      collegeId?: string;
      avatarUrl?: string;
      rating?: number;
    };
    _count?: {
      bookings?: number;
      favorites?: number;
    };
  };
  isFavoritedInitially?: boolean;
  onFavoriteChange?: (favorited: boolean) => void;
}

export function ListingCard({
  listing,
  isFavoritedInitially = false,
  onFavoriteChange,
}: ListingCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitially);
  const [loadingFav, setLoadingFav] = useState(false);

  const getFallback = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("jean") || c.includes("trouser") || c.includes("pant")) {
      return "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&fit=crop&q=80";
    }
    if (c.includes("formal") || c.includes("suit")) {
      return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&fit=crop&q=80";
    }
    if (c.includes("hoodie") || c.includes("sweat")) {
      return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&fit=crop&q=80";
    }
    if (c.includes("ethnic") || c.includes("lehenga") || c.includes("saree")) {
      return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&fit=crop&q=80";
    }
    if (c.includes("traditional") || c.includes("kurta")) {
      return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fit=crop&q=80";
    }
    if (c.includes("jacket") || c.includes("denim")) {
      return "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&fit=crop&q=80";
    }
    if (c.includes("party") || c.includes("blazer")) {
      return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&fit=crop&q=80";
    }
    return "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&fit=crop&q=80";
  };

  const getConditionStyle = (cond?: string) => {
    const c = (cond || "").toLowerCase();
    if (c.includes("brand")) {
      return "bg-[#FAF4EB] text-[#8C6030] border-[#E0CCA8] dark:bg-[#2B1F12] dark:text-[#E0CCA8] dark:border-[#63482A]";
    }
    if (c.includes("like")) {
      return "bg-[#EBF2EE] text-[#1E3A2F] border-[#A8C7B8] dark:bg-[#14271F] dark:text-[#A8C7B8] dark:border-[#2E5746]";
    }
    return "bg-[#FAF0ED] text-[#C64324] border-[#F2C3B8] dark:bg-[#2B1510] dark:text-[#F0775A] dark:border-[#63291D]";
  };

  const images = Array.isArray(listing.images) ? listing.images : [];
  const initialImg = images[0] || getFallback(listing.category);
  const [imgSrc, setImgSrc] = useState(initialImg);

  useEffect(() => {
    if (images[0]) {
      setImgSrc(images[0]);
    }
  }, [listing.id, images]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoadingFav(true);
    try {
      const res = await favoriteApi.toggle(listing.id);
      const newStatus = res.data.favorited;
      setIsFavorited(newStatus);
      if (onFavoriteChange) onFavoriteChange(newStatus);
    } catch {
      // ignore
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="group rounded-xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#E3DC CE] dark:border-[#22262F] hover:border-[#111215] dark:hover:border-[#E85938] transition-all duration-200 flex flex-col overflow-hidden">
      {/* Editorial Lookbook Photo Container */}
      <Link href={`/listings/${listing.id}`} className="relative block aspect-[3/3.8] overflow-hidden bg-[#ECE6DA] dark:bg-[#111215]">
        <Image
          src={imgSrc}
          alt={listing.title}
          fill
          unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("data:")}
          onError={() => setImgSrc(getFallback(listing.category))}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Tactile Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111215]/85 via-transparent to-[#111215]/20 opacity-80 group-hover:opacity-70 transition-opacity" />

        {/* Top Badges: Size Tag + Woven Condition Stamp */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-sm bg-[#111215]/90 backdrop-blur-md text-[#F4EFE6] font-mono text-[10px] font-bold tracking-wider border border-white/10">
            SZ: {listing.size}
          </span>
          {listing.condition && (
            <span
              className={`px-2 py-0.5 rounded-sm border text-[9px] font-mono font-bold uppercase tracking-wide backdrop-blur-md ${getConditionStyle(
                listing.condition
              )}`}
            >
              {listing.condition}
            </span>
          )}
        </div>

        {/* Save to Closet Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          aria-label="Save to closet"
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-10 ${
            isFavorited
              ? "bg-[#E85938] text-white shadow-sm"
              : "bg-[#111215]/70 text-[#F4EFE6]/90 hover:text-[#E85938] border border-white/10"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-white" : ""}`} />
        </button>

        {/* Bottom Image Snippet: Campus Landmark Handover Spot */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1 bg-[#111215]/80 backdrop-blur-md px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium truncate max-w-[72%] border border-white/10 text-[#F4EFE6]">
            <MapPin className="w-2.5 h-2.5 text-[#E85938] shrink-0" />
            <span className="truncate">{listing.pickupLocation || "Kundan Chaiwala"}</span>
          </div>
          {listing.owner?.rating ? (
            <div className="flex items-center gap-1 bg-[#111215]/80 backdrop-blur-md px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold text-[#D4A373] border border-white/10">
              <Star className="w-2.5 h-2.5 fill-[#D4A373] text-[#D4A373]" />
              <span>{listing.owner.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Outfit Information Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 bg-[#FAF7F2] dark:bg-[#15171C]">
        <div>
          {/* Category Tag & Brand */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#6D6B65] dark:text-[#9A968D] flex items-center gap-1">
              <CategoryIcon category={listing.category} className="w-3 h-3" />
              <span>{listing.category}</span>
            </span>
            {listing.brand && (
              <span className="font-mono text-[9px] font-bold text-[#111215] dark:text-[#F4EFE6] bg-[#ECE6DA] dark:bg-[#22262F] px-1.5 py-0.5 rounded-sm border border-[#DCD5C6] dark:border-[#313742]">
                {listing.brand}
              </span>
            )}
          </div>

          {/* Outfit Title */}
          <Link href={`/listings/${listing.id}`}>
            <h3 className="font-display font-bold text-[13px] sm:text-sm text-[#111215] dark:text-[#F4EFE6] line-clamp-1 group-hover:text-[#E85938] transition-colors leading-tight">
              {listing.title}
            </h3>
          </Link>

          {/* Student Lender Roll Slip */}
          {listing.owner && (
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed border-[#DCD5C6] dark:border-[#262B34]">
              <Avatar className="w-4 h-4 rounded-full border border-[#C8C0AF] dark:border-[#363C4A]">
                <AvatarImage src={listing.owner.avatarUrl} alt={listing.owner.name} />
                <AvatarFallback className="text-[8px] bg-[#111215] text-[#F4EFE6] font-bold">
                  {listing.owner.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 min-w-0 text-[11px]">
                <span className="font-medium text-[#4A4741] dark:text-[#BBB4A6] truncate">
                  {listing.owner.name}
                </span>
                {listing.owner.collegeId && (
                  <span className="text-[9px] font-mono text-[#8C867A] dark:text-[#7A756C] shrink-0">
                    // {listing.owner.collegeId}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Day / Night Split-Ticket Dual Pricing */}
        <div className="pt-2 border-t border-[#DCD5C6] dark:border-[#262B34] flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            {/* Day Rate Ticket Slip */}
            <div className="px-2 py-1 rounded-sm bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340]">
              <span className="text-[8px] font-mono uppercase text-[#6D6B65] dark:text-[#9A968D] block leading-none">DAY</span>
              <span className="text-xs font-mono font-bold text-[#111215] dark:text-[#F4EFE6]">
                {formatPrice(listing.dailyPrice)}
              </span>
            </div>

            {/* Night Rate Ticket Slip */}
            {listing.nightPrice ? (
              <div className="px-2 py-1 rounded-sm bg-[#5C204B]/10 dark:bg-[#5C204B]/40 border border-[#5C204B]/25 dark:border-[#5C204B]/50">
                <span className="text-[8px] font-mono uppercase text-[#7B3066] dark:text-[#D489BF] block leading-none">NIGHT</span>
                <span className="text-xs font-mono font-bold text-[#5C204B] dark:text-[#D489BF]">
                  {formatPrice(listing.nightPrice)}
                </span>
              </div>
            ) : null}
          </div>

          <Link href={`/listings/${listing.id}`}>
            <button
              className="h-7 px-2.5 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] hover:bg-[#E85938] dark:hover:bg-[#E85938] hover:text-white dark:hover:text-white text-[11px] font-display font-bold flex items-center gap-1 transition-all duration-150 active:scale-95"
            >
              <span>Rent</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
