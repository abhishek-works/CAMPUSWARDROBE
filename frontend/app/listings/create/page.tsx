"use client";

import React, { useState, useRef } from "react";
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
  Upload,
  Camera,
  Star,
  Link as LinkIcon,
  Trash2,
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
  
  // Start with empty images so user uploads their own photos
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFiles = (files: FileList | File[]) => {
    setUploadError("");
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (imageUrls.length + fileArray.length > 5) {
      setUploadError("You can upload a maximum of 5 photos per outfit.");
      return;
    }

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload valid image files (PNG, JPG, JPEG, WebP).");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImageUrls((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, result];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImageUrls((prev) => {
      const selected = prev[index];
      const filtered = prev.filter((_, i) => i !== index);
      return [selected, ...filtered];
    });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      if (imageUrls.length >= 5) {
        setUploadError("You can upload a maximum of 5 photos.");
        return;
      }
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
      setUploadError("");
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
      setError("Please upload at least one photo of your outfit.");
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
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-600" />
                Outfit Photos ({imageUrls.length}/5)
              </Label>
              <span className="text-[11px] text-zinc-500">
                Max 5 photos • First photo is cover
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
            />

            {/* Upload Drag & Drop Area */}
            {imageUrls.length < 5 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-red-500 bg-red-50/50 dark:bg-red-950/30 scale-[1.01]"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/70"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Click to upload photos from your device
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      or drag and drop your outfit photos here (PNG, JPG, WebP up to 5MB)
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 h-8 rounded-xl text-xs font-semibold pointer-events-none"
                  >
                    <ImagePlus className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                    Browse Photos
                  </Button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {uploadError}
              </p>
            )}

            {/* Photo Previews Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative group aspect-[3/3.8] rounded-2xl overflow-hidden border-2 bg-zinc-100 dark:bg-zinc-800 shadow-xs transition-all ${
                      idx === 0
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Cover Photo Badge */}
                    {idx === 0 ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white font-mono text-[9px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1 z-10">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        Cover
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetCover(idx);
                        }}
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 hover:bg-black/90 text-white font-mono text-[9px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        Set Cover
                      </button>
                    )}

                    {/* Remove Photo Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Additional Add Tile */}
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/3.8] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-red-600 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[11px] font-bold">Add More</span>
                  </button>
                )}
              </div>
            )}

            {/* Optional URL input toggle */}
            <div className="pt-1">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 font-medium transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Or paste image URL instead</span>
                </button>
              ) : (
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Paste External Image URL
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="text-xs rounded-xl h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddImageUrl}
                      className="rounded-xl text-xs h-9 px-3 font-semibold shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
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

