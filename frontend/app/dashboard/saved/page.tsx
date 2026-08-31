"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { ListingCard } from "@/components/listing-card";
import { favoriteApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Heart, Building2, ShoppingBag } from "lucide-react";

export default function SavedItemsPage() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
    else setLoading(false);
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getMy();
      setFavorites(res.data.listings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Saved Outfits
            </h1>
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Outfits bookmarked from students at <strong>{user?.college || "KIET"}</strong></span>
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl">
              ❤️
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              No saved outfits yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Tap the heart icon on any outfit while browsing to save it for your next fest, interview, or college night.
            </p>
            <Link href="/listings">
              <Button className="rounded-xl text-xs h-9 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> Explore Campus Closet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavoritedInitially={true}
                onFavoriteChange={(isFav) => {
                  if (!isFav) {
                    setFavorites((prev) => prev.filter((item) => item.id !== listing.id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
