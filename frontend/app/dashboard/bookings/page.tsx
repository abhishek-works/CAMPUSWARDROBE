"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { QrPassModal } from "@/components/qr-pass-modal";
import { ReviewModal } from "@/components/review-modal";
import { useAuth } from "@/lib/auth-context";
import { bookingApi } from "@/lib/api";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  QrCode,
  Star,
  MapPin,
  Calendar,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"renter" | "lender">("renter");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedPassBooking, setSelectedPassBooking] = useState<any | null>(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<any | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
    else setLoading(false);
  }, [isAuthenticated, role, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: any = { role };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await bookingApi.getMy(params);
      setBookings(res.data.bookings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking pass?")) return;
    try {
      await bookingApi.cancel(bookingId);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel booking.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Rental Bookings &amp; Passes
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-rose-300 border border-red-200/50 dark:border-red-900/40">
                {bookings.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Campus rentals within <strong>{user?.college || "KIET"}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/scan">
              <Button
                variant="outline"
                className="rounded-xl text-xs h-9 font-bold border-red-200 dark:border-red-900/60 text-red-700 dark:text-rose-300 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-red-600" />
                Scan Pickup QR
              </Button>
            </Link>
            <Link href="/listings">
              <Button className="rounded-xl text-xs h-9 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                Explore Outfits
              </Button>
            </Link>
          </div>
        </div>

        {/* Role Toggle & Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-3xl">
          <div className="flex gap-1">
            <button
              onClick={() => setRole("renter")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                role === "renter"
                  ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-rose-400 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-red-600" />
              <span>Outfits I Rented</span>
            </button>
            <button
              onClick={() => setRole("lender")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                role === "lender"
                  ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-rose-400 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-600" />
              <span>Rentals from My Closet</span>
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {["all", "CONFIRMED", "PICKED_UP", "RETURNED", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {st === "all" ? "All Statuses" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse h-40" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              No bookings found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You don&apos;t have any rental bookings under this filter right now.
            </p>
            <Link href="/listings">
              <Button className="rounded-xl text-xs h-9 font-semibold">
                Browse Campus Wardrobe
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const otherUser = role === "renter" ? booking.lender : booking.renter;
              const isNight = booking.rentalType === "NIGHT";

              return (
                <div
                  key={booking.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
                >
                  {/* Top Bar: Pass Code & Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md">
                        {booking.bookingCode || `PASS-${booking.id.slice(0, 8)}`}
                      </span>
                      <Badge variant="outline" className="text-[11px] font-semibold flex items-center gap-1">
                        {isNight ? (
                          <>
                            <Moon className="w-3 h-3 text-purple-500" />
                            Night Rental
                          </>
                        ) : (
                          <>
                            <Sun className="w-3 h-3 text-amber-500" />
                            Day Rental
                          </>
                        )}
                      </Badge>
                    </div>

                    <Badge className={`${getStatusColor(booking.status)} text-xs px-2.5 py-0.5 font-bold`}>
                      {booking.status}
                    </Badge>
                  </div>

                  {/* Main Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Item Thumbnail & Title (6 Cols) */}
                    <div className="md:col-span-6 flex items-center gap-3">
                      <div className="w-16 h-18 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {booking.listing?.images?.[0] ? (
                          <img
                            src={booking.listing.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👗</div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/listings/${booking.listingId}`}
                          className="font-bold text-sm text-zinc-900 dark:text-white hover:text-indigo-600 truncate block"
                        >
                          {booking.listing?.title || "Campus Outfit"}
                        </Link>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">
                            {booking.listing?.pickupLocation || "Near Kundan Chaiwala Stall / KIET Gate"}
                          </span>
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {role === "renter" ? "Owner:" : "Renter:"} <strong>{otherUser?.name}</strong> ({otherUser?.collegeId || "CS"})
                        </p>
                      </div>
                    </div>

                    {/* Rental Dates & Pricing (3 Cols) */}
                    <div className="md:col-span-3 space-y-1 text-xs">
                      <div className="text-zinc-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
                      </div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        Total: {formatPrice(booking.totalAmount)}
                        <span className="text-[10px] font-normal text-zinc-400 block">
                          (Includes {formatPrice(booking.depositAmount || 0)} deposit)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons (3 Cols) */}
                    <div className="md:col-span-3 flex flex-wrap md:flex-col gap-2 justify-end">
                      {role === "renter" && ["CONFIRMED", "READY_FOR_PICKUP", "PENDING"].includes(booking.status) && (
                        <Button
                          onClick={() => setSelectedPassBooking(booking)}
                          className="w-full rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR Pass
                        </Button>
                      )}

                      {role === "lender" && ["CONFIRMED", "READY_FOR_PICKUP"].includes(booking.status) && (
                        <Link href={`/dashboard/scan`}>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl text-xs h-9 font-bold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/50"
                          >
                            <QrCode className="w-4 h-4 mr-1 text-purple-600" />
                            Scan Student Pass
                          </Button>
                        </Link>
                      )}

                      {role === "renter" && ["RETURNED", "COMPLETED"].includes(booking.status) && (
                        <Button
                          onClick={() => setSelectedReviewBooking(booking)}
                          variant="outline"
                          className="w-full rounded-xl text-xs h-9 font-semibold flex items-center justify-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Write Review
                        </Button>
                      )}

                      {booking.status === "PENDING" && (
                        <Button
                          onClick={() => handleCancel(booking.id)}
                          variant="ghost"
                          className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8"
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QR Pass Modal for Renters */}
        <QrPassModal
          open={!!selectedPassBooking}
          onClose={() => setSelectedPassBooking(null)}
          booking={selectedPassBooking}
        />

        {/* Review Modal */}
        <ReviewModal
          open={!!selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          booking={selectedReviewBooking}
          onSuccess={() => {
            setSelectedReviewBooking(null);
            fetchBookings();
          }}
        />
      </div>
    </AppLayout>
  );
}

