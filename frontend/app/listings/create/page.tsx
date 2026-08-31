"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { listingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  MapPin,
  ImagePlus,
  Loader2,
  X,
  Plus,
  Tag,
  Building2,
} from "lucide-react";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Ethnic & Traditional");
  const [size, setSize] = useState("M");
  const [gender, setGender] = useState("UNISEX");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("Like New");
  const [color, setColor] = useState("");
  const [dailyPrice, setDailyPrice] = useState<number | string>(300);
  const [nightPrice, setNightPrice] = useState<number | string>(750);
  const [securityDeposit, setSecurityDeposit] = useState<number | string>(500);
  const [pickupLocation, setPickupLocation] = useState(
    "Near Kundan Chaiwala Stall / KIET Main Gate"
  );
  const [notes, setNotes] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const campusPickupPresets = [
    "Near Kundan Chaiwala Stall / KIET Main Gate",
    "Boys Hostel 3 Gate",
    "Girls Hostel 1 Gate",
    "Central Library Portico",
    "Main Campus Cafeteria / Canteen",
    "Academic Block A Reception",
  ];

  const categories = [
    "Ethnic & Traditional",
    "Formal & Suits",
    "Party & Fest",
    "Jackets & Hoodies",
    "Shirts & T-Shirts",
    "Accessories",
  ];

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDailyPriceChange = (val: string) => {
    setDailyPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setNightPrice(Math.round(num * 2.2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !description.trim() || !dailyPrice) {
      setError("Please provide a title, description, and daily rental price.");
      return;
    }

    if (imageUrls.length === 0) {
      setError("Please provide at least one outfit image URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await listingApi.create({
        title: title.trim(),
        description: description.trim(),
        category,
        size,
        gender,
        brand: brand.trim() || undefined,
        condition,
        color: color.trim() || undefined,
        dailyPrice: parseFloat(String(dailyPrice)),
        nightPrice: nightPrice ? parseFloat(String(nightPrice)) : undefined,
        securityDeposit: securityDeposit ? parseFloat(String(securityDeposit)) : 0,
        pickupLocation,
        notes: notes.trim() || undefined,
        images: imageUrls,
      });

      const newId = res.data.listing?.id;
      if (newId) router.push(`/listings/${newId}`);
      else router.push("/dashboard/listings");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              List Your Outfit
            </h1>
            <Sparkles className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span>Visible strictly to verified students of <strong>{user?.college || "KIET"}</strong></span>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {/* Images Section */}
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Outfit Photos (Image URLs)
            </Label>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-28 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 group"
                >
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image URL (e.g. from Unsplash or image host)"
                className="text-xs rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
              />
              <Button
                type="button"
                onClick={handleAddImageUrl}
                className="rounded-xl text-xs h-10 px-4 font-semibold shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Image
              </Button>
            </div>
          </div>

          {/* Outfit Name */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Outfit Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Manyavar Royal Silk Kurta Set / Zara Slim Suit"
              className="text-xs rounded-xl h-11 bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 font-medium"
              required
            />
          </div>

          {/* Category, Size, Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Size</Label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              >
                {["XS", "S", "M", "L", "XL", "XXL", "FREE"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              >
                {["UNISEX", "MALE", "FEMALE"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand, Condition, Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Brand / Designer</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Manyavar, Zara, Raymond"
                className="text-xs rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Condition</Label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
              >
                {["Brand New with Tags", "Like New", "Excellent", "Good"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Color</Label>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Navy Blue, Maroon"
                className="text-xs rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
              />
            </div>
          </div>

          {/* Day / Night Pricing Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Rental Pricing Structure
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Day Rental Rate (₹)
                </Label>
                <Input
                  type="number"
                  min={50}
                  value={dailyPrice}
                  onChange={(e) => handleDailyPriceChange(e.target.value)}
                  className="text-xs rounded-xl h-10 bg-white dark:bg-zinc-900 font-bold text-indigo-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-purple-500" />
                  Night Rental Rate (₹)
                </Label>
                <Input
                  type="number"
                  min={50}
                  value={nightPrice}
                  onChange={(e) => setNightPrice(e.target.value)}
                  className="text-xs rounded-xl h-10 bg-white dark:bg-zinc-900 font-bold text-purple-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Security Deposit (₹)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="text-xs rounded-xl h-10 bg-white dark:bg-zinc-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Campus Handover Spot Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              Campus Handover &amp; Pickup Spot
            </Label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
            >
              {campusPickupPresets.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Description & Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Outfit Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe fabric, fitting, best occasions, etc."
              rows={3}
              className="text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
              required
            />
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing to Campus...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                List Outfit on CampusWardrobe
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

