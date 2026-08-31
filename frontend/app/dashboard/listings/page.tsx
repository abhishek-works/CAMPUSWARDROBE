"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { listingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  PlusCircle,
  Eye,
  Trash2,
  Edit,
  Building2,
  MapPin,
  Sun,
  Moon,
  AlertCircle,
  QrCode,
} from "lucide-react";

export default function MyListingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchListings();
    else setLoading(false);
  }, [isAuthenticated]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await listingApi.getMine();
      setListings(res.data.listings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this outfit from your campus closet?")) return;
    try {
      await listingApi.delete(id);
      fetchListings();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete listing.");
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
                My Campus Closet
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                {listings.length} Listed Outfits
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Available for peer rental at <strong>{user?.college || "KIET Group of Institutions"}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/scan">
              <Button
                variant="outline"
                className="rounded-xl text-xs h-9 font-semibold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30 flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                Scan Handover QR
              </Button>
            </Link>
            <Link href="/listings/create">
              <Button className="rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-sm">
                <PlusCircle className="w-4 h-4" />
                List New Outfit
              </Button>
            </Link>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl">
              👗
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Your closet is empty
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Monetize suits, traditional kurtas, jackets, and party wear by sharing them with batchmates.
            </p>
            <Link href="/listings/create">
              <Button className="rounded-xl text-xs h-9 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                <PlusCircle className="w-4 h-4 mr-1.5" /> List Your First Outfit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>
                    )}
                    <Badge
                      variant={item.status === "ACTIVE" ? "default" : "secondary"}
                      className="absolute top-3 right-3 text-[10px] font-bold"
                    >
                      {item.status}
                    </Badge>
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-bold text-xs">
                      {item.size} • {item.gender}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <Link
                      href={`/listings/${item.id}`}
                      className="font-bold text-sm text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        {formatPrice(item.dailyPrice)}/day
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                        <Moon className="w-3.5 h-3.5 text-purple-500" />
                        {formatPrice(item.nightPrice || Math.round(item.dailyPrice * 2.2))}/night
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 truncate pt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{item.pickupLocation || "Near Kundan Chaiwala"}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Link href={`/listings/${item.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-zinc-600 dark:text-zinc-300">
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                  </Link>

                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
