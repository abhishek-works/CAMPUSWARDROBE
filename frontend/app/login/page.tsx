"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [college, setCollege] = useState("KIET Group of Institutions");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please provide your College ID / Email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(identifier.trim(), password, college);
      router.push("/listings");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError("");
    setLoading(true);
    try {
      await login(demoId, demoPass, college);
      router.push("/listings");
    } catch (err: any) {
      setError(err.response?.data?.error || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#0C0D0F] overflow-hidden font-sans">
      {/* Left Visual Column (Kundan Chaiwala KIET Campus Background) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 text-[#F4EFE6] overflow-hidden">
        {/* Background Image Asset */}
        <Image
          src="/auth-bg.jpg"
          alt="KIET Campus Life - Kundan Chaiwala Landmark"
          fill
          priority
          className="object-cover object-center brightness-[0.4] scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D0F] via-[#0C0D0F]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D0F] via-[#0C0D0F]/50 to-transparent" />

        {/* Top Logo & Campus Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo size="lg" href="/" />

          <div className="flex items-center gap-2 bg-[#F4EFE6]/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#F4EFE6]/15 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-[#1E3A2F] dark:bg-[#589E83]" />
            <span>KIET CAMPUS GUILD ACTIVE</span>
          </div>
        </div>

        {/* Center Tagline and Feature Badges */}
        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#F4EFE6]/10 border border-[#F4EFE6]/20 text-[#F4EFE6] text-xs font-mono">
            <span>[ ZERO-COMMUTE PEER RENTALS ]</span>
          </div>

          {/* Committed Single-Tone Headline */}
          <h2 className="text-4xl xl:text-5xl font-display font-extrabold tracking-tight leading-tight text-[#F4EFE6]">
            The Peer Wardrobe Guild for Campus Fashion.
          </h2>

          <p className="text-[#C8C0AF] text-sm xl:text-base leading-relaxed font-sans">
            Never repeat an outfit for fests, presentations, or campus parties.
            Rent premium clothes right from peers in your hostel and classes.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#111215]/80 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-5 h-5 text-[#1E3A2F] dark:text-[#589E83] mb-1" />
              <h4 className="font-display font-bold text-xs">Verified Peers</h4>
              <p className="text-[10px] font-mono text-[#8C867A] mt-0.5">College ID mandatory</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111215]/80 backdrop-blur-md border border-white/10">
              <QrCode className="w-5 h-5 text-[#E85938] mb-1" />
              <h4 className="font-display font-bold text-xs">QR Handover</h4>
              <p className="text-[10px] font-mono text-[#8C867A] mt-0.5">Instant scan at gate</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111215]/80 backdrop-blur-md border border-white/10">
              <Sparkles className="w-5 h-5 text-[#D4A373] mb-1" />
              <h4 className="font-display font-bold text-xs">Day / Night Rates</h4>
              <p className="text-[10px] font-mono text-[#8C867A] mt-0.5">Classes &amp; night fests</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs font-mono text-[#8C867A] flex items-center justify-between">
          <span>📍 Landmark: Kundan Chaiwala Stall / KIET Main Gate</span>
          <span>© 2026 CampusWardrobe</span>
        </div>
      </div>

      {/* Right Form Column (Student Pass Card) */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-10 bg-[#FAF7F2] dark:bg-[#0C0D0F] overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex lg:hidden justify-center mb-2">
              <Logo size="md" href="/" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-[#111215] dark:text-[#F4EFE6] tracking-tight">
              Student Wardrobe Pass
            </h2>
            <p className="text-xs sm:text-sm text-[#6D6B65] dark:text-[#9A968D]">
              Sign in with your College ID or student email to access campus closets.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#FAF0ED] dark:bg-[#2B1510] border border-[#F2C3B8] dark:border-[#63291D] text-[#C64324] dark:text-[#F0775A] text-xs font-mono font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Login Chips */}
          <div className="p-3.5 bg-[#ECE6DA] dark:bg-[#15171C] border border-[#D4CCBC] dark:border-[#22262F] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#111215] dark:text-[#F4EFE6] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#E85938]" /> 1-Click Demo Login
              </span>
              <span className="text-[10px] text-[#8C867A] font-mono">KIET CS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("2327CS1190", "Password123")}
                className="text-xs h-8 px-2 rounded-sm font-mono font-bold text-left bg-[#FAF7F2] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#DCD5C6] dark:border-[#2D3340] hover:border-[#111215]"
              >
                Abhishek (CS)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("2327CS1185", "Password123")}
                className="text-xs h-8 px-2 rounded-sm font-mono font-bold text-left bg-[#FAF7F2] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#DCD5C6] dark:border-[#2D3340] hover:border-[#111215]"
              >
                Priyanshu (CS)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("2327CS1178", "Password123")}
                className="text-xs h-8 px-2 rounded-sm font-mono font-bold text-left bg-[#FAF7F2] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#DCD5C6] dark:border-[#2D3340] hover:border-[#111215]"
              >
                Sneha (CS)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("2327CS1210", "Password123")}
                className="text-xs h-8 px-2 rounded-sm font-mono font-bold text-left bg-[#FAF7F2] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] border border-[#DCD5C6] dark:border-[#2D3340] hover:border-[#111215]"
              >
                Aman (CS)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* College Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                College Campus
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border border-[#D4CCBC] dark:border-[#22262F] text-[#111215] dark:text-[#F4EFE6] font-mono font-medium focus:outline-none focus:border-[#111215]"
                >
                  <option value="KIET Group of Institutions">
                    KIET Group of Institutions (Ghaziabad)
                  </option>
                  <option value="AKGEC Ghaziabad">AKGEC Ghaziabad</option>
                  <option value="ABES Engineering College">ABES Engineering College</option>
                </select>
              </div>
            </div>

            {/* College ID / Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                College Roll ID or Student Email
              </Label>
              <Input
                type="text"
                placeholder="e.g. 2327CS1190 or student@kiet.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-10 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-mono text-[#E85938] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867A] hover:text-[#111215]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] hover:bg-[#E85938] dark:hover:bg-[#E85938] hover:text-white dark:hover:text-white font-display font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Campus Closet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-xs text-[#6D6B65] dark:text-[#9A968D]">
            New to campus wardrobe?{" "}
            <Link href="/register" className="font-mono font-bold text-[#E85938] hover:underline">
              Create student pass →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
