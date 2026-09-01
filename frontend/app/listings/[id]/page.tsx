"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { BookingModal } from "@/components/booking-modal";
import { listingApi, favoriteApi, reviewApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";
import {
  Heart,
  Star,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const id = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [detailImg, setDetailImg] = useState<string>("");

  const getFallback = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("jean") || c.includes("trouser") || c.includes("pant")) {
      return "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1000&fit=crop&q=85";
    }
    if (c.includes("formal") || c.includes("suit")) {
      return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&fit=crop&q=85";
    }
    if (c.includes("hoodie") || c.includes("sweat")) {
      return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&fit=crop&q=85";
    }
    if (c.includes("ethnic") || c.includes("lehenga") || c.includes("saree")) {
      return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&fit=crop&q=85";
    }
    if (c.includes("traditional") || c.includes("kurta")) {
      return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&fit=crop&q=85";
    }
    if (c.includes("jacket") || c.includes("denim")) {
      return "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1000&fit=crop&q=85";
    }
    if (c.includes("party") || c.includes("blazer")) {
      return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&fit=crop&q=85";
    }
    return "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&fit=crop&q=85";
  };

  useEffect(() => {
    if (listing) {
      const images = Array.isArray(listing.images) ? listing.images : [];
      setDetailImg(images[selectedImage] || getFallback(listing.category));
    }
  }, [listing, selectedImage]);

  useEffect(() => {
    if (id) {
      fetchListingDetails();
    }
  }, [id]);

  const fetchListingDetails = async () => {
    setLoading(true);
    try {
      const res = await listingApi.getById(id);
      const data = res.data.listing;
      setListing(data);
      setIsFavorited(res.data.isFavorited || false);

      // Fetch reviews
      try {
        const revRes = await reviewApi.getByListing(id);
        setReviews(revRes.data.reviews || []);
      } catch {
        // ignore
      }

      // Fetch similar listings
      if (data?.category) {
        try {
          const simRes = await listingApi.getAll({
            category: data.category,
            limit: 4,
          });
          const filtered = (simRes.data.listings || []).filter(
            (l: any) => l.id !== id
          );
          setSimilarListings(filtered);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      const res = await favoriteApi.toggle(id);
      setIsFavorited(res.data.favorited);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-[#ECE6DA] dark:bg-[#15171C] rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 aspect-[3/3.8] bg-[#ECE6DA] dark:bg-[#15171C] rounded-2xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-8 w-3/4 bg-[#ECE6DA] dark:bg-[#15171C] rounded" />
              <div className="h-24 bg-[#ECE6DA] dark:bg-[#15171C] rounded-xl" />
              <div className="h-32 bg-[#ECE6DA] dark:bg-[#15171C] rounded-xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!listing) {
    return (
      <AppLayout>
        <div className="p-16 text-center space-y-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F]">
          <ShoppingBag className="w-12 h-12 text-[#8C867A] mx-auto" />
          <h2 className="text-xl font-display font-bold text-[#111215] dark:text-[#F4EFE6]">
            Outfit not found
          </h2>
          <p className="text-xs text-[#6D6B65] dark:text-[#9A968D]">
            This outfit may have been archived or removed by the owner.
          </p>
          <Link href="/listings">
            <button className="h-9 px-4 rounded-sm text-xs font-mono font-bold bg-[#111215] text-[#F4EFE6]">
              Return to Campus Closet
            </button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const images = Array.isArray(listing.images) ? listing.images : [];
  const displayImage = detailImg || images[selectedImage] || getFallback(listing.category);
  const isOwner = user?.id === listing.ownerId;
  const nightPrice = listing.nightPrice || Math.round(listing.dailyPrice * 2.2);

  return (
    <AppLayout>
      <div className="space-y-8 pb-16">
        {/* Top Breadcrumb */}
        <div className="text-xs font-mono text-[#8C867A] flex items-center gap-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:underline">Closet</Link>
          <span>/</span>
          <span className="text-[#111215] dark:text-[#F4EFE6] font-bold truncate max-w-xs">{listing.title}</span>
        </div>

        {/* 2-Column Product Lookbook Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Showcase (6 Cols) */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="relative aspect-[3/3.8] rounded-2xl overflow-hidden bg-[#ECE6DA] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F]">
              <Image
                src={detailImg || getFallback(listing.category)}
                alt={listing.title}
                fill
                priority
                onError={() => setDetailImg(getFallback(listing.category))}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              <button
                onClick={handleFavorite}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#111215]/80 backdrop-blur-md flex items-center justify-center text-[#F4EFE6] hover:text-[#E85938] transition-transform active:scale-95 border border-white/10"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-[#E85938] text-[#E85938]" : ""}`} />
              </button>

              <div className="absolute bottom-3.5 left-3.5 flex gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#111215]/90 backdrop-blur-md text-[#F4EFE6] font-mono font-bold text-xs border border-white/10">
                  SZ: {listing.size}
                </span>
                {listing.condition && (
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#FAF7F2] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] font-mono font-bold text-xs border border-[#D4CCBC] dark:border-[#2D3340] uppercase">
                    {listing.condition}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === idx
                        ? "border-[#111215] dark:border-[#E85938] scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Booking Actions (6 Cols) */}
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Brand Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#ECE6DA] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#D4CCBC] dark:border-[#2D3340] text-xs font-mono font-bold">
                  <CategoryIcon category={listing.category} className="w-3.5 h-3.5" />
                  <span>{listing.category}</span>
                </div>
                {listing.brand && (
                  <span className="text-xs font-mono font-bold bg-[#ECE6DA] dark:bg-[#1E222A] px-2.5 py-1 rounded-sm text-[#111215] dark:text-[#F4EFE6] border border-[#D4CCBC] dark:border-[#2D3340]">
                    {listing.brand}
                  </span>
                )}
                {listing.color && (
                  <span className="text-xs text-[#6D6B65] dark:text-[#9A968D] font-mono">
                    COLOR: <strong className="text-[#111215] dark:text-[#F4EFE6] uppercase">{listing.color}</strong>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#111215] dark:text-[#F4EFE6] tracking-tight leading-snug">
                {listing.title}
              </h1>

              {/* Day Rate vs Night Rate Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                    <Sun className="w-3.5 h-3.5 text-[#D4A373]" />
                    DAY RENTAL
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-mono font-black text-[#111215] dark:text-[#F4EFE6]">
                      {formatPrice(listing.dailyPrice)}
                    </span>
                    <span className="text-xs font-mono text-[#8C867A]"> /day</span>
                  </div>
                  <p className="text-[10px] text-[#6D6B65] dark:text-[#9A968D] font-sans">For classes, exams &amp; placement drives</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#5C204B]/15 dark:bg-[#5C204B]/40 text-[#111215] dark:text-[#F4EFE6] border border-[#5C204B]/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#7B3066] dark:text-[#D489BF]">
                    <Moon className="w-3.5 h-3.5 text-[#7B3066] dark:text-[#D489BF]" />
                    NIGHT RENTAL
                  </div>
                  <div className="mt-1">
                    <span className="text-2xl font-mono font-black text-[#5C204B] dark:text-[#D489BF]">
                      {formatPrice(nightPrice)}
                    </span>
                    <span className="text-xs font-mono text-[#8C867A]"> /night</span>
                  </div>
                  <p className="text-[10px] text-[#7B3066] dark:text-[#D489BF]/80 font-sans">For fests, DJ nights &amp; farewells</p>
                </div>
              </div>

              {/* Security Deposit & Handover Spot */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#4A4741] dark:text-[#BBB4A6]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-[#1E3A2F] dark:text-[#589E83]" />
                    Refundable Security Deposit
                  </span>
                  <span className="font-mono font-bold text-[#111215] dark:text-[#F4EFE6]">
                    {formatPrice(listing.securityDeposit || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#4A4741] dark:text-[#BBB4A6] pt-2 border-t border-[#DCD5C6] dark:border-[#262B34]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-[#E85938]" />
                    Campus Handover Spot
                  </span>
                  <span className="font-medium text-[#111215] dark:text-[#F4EFE6] truncate max-w-[55%] font-mono text-[11px]">
                    {listing.pickupLocation || "Near Kundan Chaiwala Stall"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs text-[#4A4741] dark:text-[#BBB4A6] leading-relaxed font-sans">
                <h4 className="font-display font-bold text-[#111215] dark:text-[#F4EFE6]">About this Outfit:</h4>
                <p>{listing.description}</p>
                {listing.notes && (
                  <p className="italic text-[#8C867A] pt-1">
                    Note from owner: &ldquo;{listing.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Owner Card */}
              {listing.owner && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#15171C] border border-[#DCD5C6] dark:border-[#22262F] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 rounded-lg border border-[#C8C0AF] dark:border-[#363C4A]">
                      <AvatarImage src={listing.owner.avatarUrl} alt={listing.owner.name} />
                      <AvatarFallback className="bg-[#111215] text-[#F4EFE6] font-bold text-xs">
                        {listing.owner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-display font-bold text-[#111215] dark:text-[#F4EFE6] truncate">
                          {listing.owner.name}
                        </p>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1E3A2F] dark:text-[#589E83]" />
                      </div>
                      <p className="text-[10px] font-mono text-[#8C867A] truncate">
                        ROLL ID: {listing.owner.collegeId || "KIET CS"}
                      </p>
                      {listing.owner.rating ? (
                        <div className="flex items-center gap-1 text-[10px] text-[#D4A373] font-semibold font-mono">
                          <Star className="w-3 h-3 fill-[#D4A373] text-[#D4A373]" />
                          <span>{listing.owner.rating.toFixed(1)} rating</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {!isOwner && (
                    <Link href={`/dashboard/messages?user=${listing.owner.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-xs h-8 border-[#DCD5C6] dark:border-[#2D3340] text-[#111215] dark:text-[#F4EFE6] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A] font-mono font-bold"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        Chat
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Booking CTA Button */}
            <div className="pt-3 border-t border-[#DCD5C6] dark:border-[#262B34]">
              {isOwner ? (
                <Link href="/dashboard/listings">
                  <button className="w-full h-11 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-display font-bold text-xs">
                    Manage in My Closet
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) router.push("/login");
                    else setBookingOpen(true);
                  }}
                  className="w-full h-11 rounded-sm bg-[#E85938] hover:bg-[#C64324] text-white font-display font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  Reserve Outfit on Campus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Outfits Section */}
        {similarListings.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#DCD5C6] dark:border-[#22262F]">
            <h3 className="text-xl font-display font-bold text-[#111215] dark:text-[#F4EFE6]">
              Similar Outfits in {listing.college || "KIET"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          listing={listing}
        />
      </div>
    </AppLayout>
  );
}
