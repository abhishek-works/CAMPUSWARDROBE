"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/lib/auth-context";
import { bookingApi, listingApi, userApi } from "@/lib/api";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShoppingBag,
  Wallet,
  Star,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Building2,
  MapPin,
  TrendingUp,
  Layers,
  Award,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchData();
    else setLoading(false);
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [walletRes, listingsRes, bookingsRes] = await Promise.all([
        userApi.getWallet(),
        listingApi.getMine(),
        bookingApi.getMy(),
      ]);
      setWallet(walletRes.data);
      setMyListings(listingsRes.data.listings || []);
      setMyBookings(bookingsRes.data.bookings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                Welcome back, {user?.name || "Student"}
              </h1>
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span className="font-bold text-zinc-700 dark:text-zinc-300">{user?.college || "KIET Group of Institutions"}</span>
              <span className="font-mono text-zinc-400">({user?.collegeId || "CS"})</span>
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
            <Link href="/listings/create">
              <Button className="rounded-xl text-xs h-9 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                List Outfit
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
              <span>Wallet Balance</span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {formatPrice(wallet?.wallet?.balance || 500)}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">Available for rentals</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
              <span>My Closet</span>
              <Layers className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {myListings.length}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium">Outfits listed</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
              <span>Bookings Made</span>
              <ShoppingBag className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {myBookings.length}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium">Active &amp; past rentals</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
              <span>Student Rating</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {user?.rating ? user.rating.toFixed(1) : "5.0"}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium">From peer reviews</span>
          </div>
        </div>

        {/* 2-Column Split: Active Rentals & Listed Clothes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active / Recent Bookings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-600 dark:text-rose-400" />
                Recent Rental Passes
              </h3>
              <Link
                href="/dashboard/bookings"
                className="text-xs font-bold text-red-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl">
                No active bookings yet.{" "}
                <Link href="/listings" className="text-red-600 dark:text-rose-400 font-bold underline">
                  Explore campus clothes
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myBookings.slice(0, 4).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-900 dark:text-white truncate">
                        {booking.listing?.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.rentalType || "DAY"})
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-red-600 dark:text-rose-400 block">
                        {formatPrice(booking.totalAmount)}
                      </span>
                      <Badge className={`${getStatusColor(booking.status)} text-[10px] px-2 py-0.5 mt-0.5`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Listed Items */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600 dark:text-rose-400" />
                My Closet Listings
              </h3>
              <Link
                href="/dashboard/listings"
                className="text-xs font-bold text-red-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl">
                You haven&apos;t listed any outfits yet.{" "}
                <Link href="/listings/create" className="text-red-600 dark:text-rose-400 font-bold underline">
                  List your first outfit
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myListings.slice(0, 4).map((listing) => (
                  <div
                    key={listing.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-900 dark:text-white truncate">
                        {listing.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {formatPrice(listing.dailyPrice)}/day • {formatPrice(listing.nightPrice || listing.dailyPrice * 2.2)}/night
                      </p>
                    </div>

                    <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                      {listing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

