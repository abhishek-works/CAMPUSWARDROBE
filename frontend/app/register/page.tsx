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
  User,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    email: "",
    password: "",
    phone: "",
    college: "KIET Group of Institutions",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeId || !formData.email || !formData.password) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        collegeId: formData.collegeId.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        college: formData.college,
        phone: formData.phone.trim() || undefined,
      });
      router.push("/listings");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Registration failed. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#0C0D0F] overflow-hidden font-sans">
      {/* Left Visual Column (Kundan Chaiwala KIET Background) */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 text-[#F4EFE6] overflow-hidden">
        <Image
          src="/auth-bg.jpg"
          alt="KIET Campus Life - Kundan Chaiwala Landmark"
          fill
          priority
          className="object-cover object-center brightness-[0.4] scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D0F] via-[#0C0D0F]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0D0F] via-[#0C0D0F]/50 to-transparent" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo size="lg" href="/" />

          <div className="flex items-center gap-2 bg-[#F4EFE6]/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#F4EFE6]/15 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-[#1E3A2F] dark:bg-[#589E83]" />
            <span>JOIN 500+ KIET STUDENTS</span>
          </div>
        </div>

        {/* Center Tagline with Single-Tone Committed Headline */}
        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#F4EFE6]/10 border border-[#F4EFE6]/20 text-[#F4EFE6] text-xs font-mono">
            <span>[ VERIFIED COLLEGE-ONLY WARDROBE ]</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-display font-extrabold tracking-tight leading-tight text-[#F4EFE6]">
            Turn Your Closet Into Campus Income.
          </h2>

          <p className="text-[#C8C0AF] text-sm xl:text-base leading-relaxed font-sans">
            List your ethnic wear, formals, and party fits. Earn passive income while helping your
            college batchmates look their best.
          </p>

          <div className="space-y-3 pt-2 font-sans">
            <div className="flex items-center gap-3 text-sm text-[#F4EFE6]">
              <div className="w-5 h-5 rounded-sm bg-[#1E3A2F] text-[#A8C7B8] flex items-center justify-center font-bold text-xs font-mono">
                ✓
              </div>
              <span>Keep 90% of every rental directly in your campus wallet</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F4EFE6]">
              <div className="w-5 h-5 rounded-sm bg-[#1E3A2F] text-[#A8C7B8] flex items-center justify-center font-bold text-xs font-mono">
                ✓
              </div>
              <span>Day &amp; Night rate flexibility with escrow security deposits</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F4EFE6]">
              <div className="w-5 h-5 rounded-sm bg-[#1E3A2F] text-[#A8C7B8] flex items-center justify-center font-bold text-xs font-mono">
                ✓
              </div>
              <span>Meet peers at Kundan Chaiwala or hostel gates with encrypted QR scan</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs font-mono text-[#8C867A] flex items-center justify-between">
          <span>📍 Handover Spot: Kundan Chaiwala / Hostel Gate</span>
          <span>© 2026 CampusWardrobe</span>
        </div>
      </div>

      {/* Right Form Column (Sign Up Form) */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-10 bg-[#FAF7F2] dark:bg-[#0C0D0F] overflow-y-auto">
        <div className="w-full max-w-md space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex lg:hidden justify-center mb-2">
              <Logo size="md" href="/" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-[#111215] dark:text-[#F4EFE6] tracking-tight">
              Create Student Pass
            </h2>
            <p className="text-xs text-[#6D6B65] dark:text-[#9A968D]">
              Join your campus fashion exchange with verified student credentials.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#FAF0ED] dark:bg-[#2B1510] border border-[#F2C3B8] dark:border-[#63291D] text-[#C64324] dark:text-[#F0775A] text-xs font-mono font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* College Selection */}
            <div className="space-y-1">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                College Campus
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
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

            {/* Full Name */}
            <div className="space-y-1">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <Input
                  type="text"
                  name="name"
                  placeholder="e.g. Abhishek Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-9 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-sans"
                />
              </div>
            </div>

            {/* College Roll ID & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                  College Roll ID *
                </Label>
                <Input
                  type="text"
                  name="collegeId"
                  placeholder="2327CS1190"
                  value={formData.collegeId}
                  onChange={handleChange}
                  className="h-9 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                  Phone (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C867A]" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-9 h-9 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                Student Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <Input
                  type="email"
                  name="email"
                  placeholder="2327cs1190@kiet.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-9 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="text-xs font-mono font-bold text-[#4A4741] dark:text-[#BBB4A6]">
                Password *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867A]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-9 text-xs rounded-sm bg-[#ECE6DA] dark:bg-[#15171C] border-[#D4CCBC] dark:border-[#22262F] font-mono"
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
              className="w-full h-11 mt-2 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] hover:bg-[#E85938] dark:hover:bg-[#E85938] hover:text-white dark:hover:text-white font-display font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating student pass...</span>
                </>
              ) : (
                <>
                  <span>Create Student Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-xs text-[#6D6B65] dark:text-[#9A968D]">
            Already have a student pass?{" "}
            <Link href="/login" className="font-mono font-bold text-[#E85938] hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
