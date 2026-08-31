"use client";

import React, { useState, useRef } from "react";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/lib/auth-context";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Building2,
  CheckCircle,
  Loader2,
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&fit=crop&q=80",
];

export default function ProfilePage() {
  const { user, refreshUser, quickLogin } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
      setSuccess("Profile photo selected from device! Click Save to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput("");
      setSuccess("Custom image URL applied! Click Save to persist.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await userApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl || undefined,
      });
      await refreshUser();
      setSuccess("Profile & photo updated successfully across campus!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Student Identity &amp; Profile
            </h1>
            <ShieldCheck className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span>Verified Campus ID profile for <strong>{user?.college || "KIET"}</strong></span>
          </p>
        </div>

        {/* Digital Student Identity Card (Aesthetic Red & Black Theme) */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 text-white shadow-2xl border border-red-900/40 overflow-hidden">
          {/* Watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none pr-4 text-red-500">
            CW
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="w-20 h-20 rounded-2xl border-2 border-red-500/50 shadow-xl">
                  <AvatarImage src={avatarUrl || user?.avatarUrl} />
                  <AvatarFallback className="text-2xl font-black bg-red-600 text-white">
                    {user?.name?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="Change photo"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black">{user?.name}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-rose-300 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-red-400" /> Verified Student
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-red-500" />
                  {user?.college || "KIET Group of Institutions"}
                </p>
                <p className="text-xs font-mono text-rose-300 mt-1">
                  Roll / College ID: <strong>{user?.collegeId || "2327CS1190"}</strong>
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-white/5 backdrop-blur-md p-3 px-4 rounded-2xl border border-white/10">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">Trust Rating</span>
                <div className="flex items-center gap-1 text-amber-400 font-black text-lg">
                  <span>★</span>
                  <span>{user?.rating ? user.rating.toFixed(1) : "5.0"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Profile Photo Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-red-600" />
                Change Profile Photo
              </h3>
              <p className="text-xs text-zinc-500">
                Choose a preset avatar, upload from device, or paste an image URL.
              </p>
            </div>

            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAvatarUrl("")}
                className="text-xs text-zinc-500 hover:text-red-600"
              >
                Reset to Default
              </Button>
            )}
          </div>

          {/* Preset Avatars */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Choose Preset Aesthetic Avatar:
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset);
                    setSuccess("Avatar selected! Click Save to apply.");
                  }}
                  className={`relative w-12 h-12 rounded-2xl overflow-hidden border-2 transition-transform active:scale-95 ${
                    avatarUrl === preset
                      ? "border-red-600 ring-2 ring-red-500/30 scale-105"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* File Upload & URL inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10 rounded-xl text-xs font-bold border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-red-600" />
                Upload Photo from Device
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className="text-xs rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800"
              />
              <Button
                type="button"
                onClick={handleApplyCustomUrl}
                className="rounded-xl text-xs h-10 px-3 shrink-0 bg-zinc-900 dark:bg-zinc-800 text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Fast Switcher */}
        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-rose-400">
            <Sparkles className="w-3.5 h-3.5" />
            Switch Demo Student Account
          </div>
          <p className="text-[11px] text-zinc-500">
            Simulate renter and lender flows between enrolled KIET batchmates:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickLogin("abhishek@kiet.edu")}
              className="text-xs h-8 rounded-xl"
            >
              Abhishek (2327CS1190)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickLogin("priyanshu@kiet.edu")}
              className="text-xs h-8 rounded-xl"
            >
              Priyanshu (2327CS1185)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => quickLogin("sneha@kiet.edu")}
              className="text-xs h-8 rounded-xl"
            >
              Sneha (2327CS1178)
            </Button>
          </div>
        </div>

        {/* Edit Details Form */}
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5"
        >
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            Edit Profile &amp; Contact Details
          </h3>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">College Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">College ID</Label>
              <Input
                value={user?.collegeId || "2327CS1190"}
                disabled
                className="text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl text-xs h-11 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-md shadow-red-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile & Photos"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}


