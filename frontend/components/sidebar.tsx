"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/logo";
import {
  Home,
  Compass,
  ShoppingBag,
  Sparkles,
  QrCode,
  MessageSquare,
  Heart,
  User,
  PlusCircle,
  LogOut,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Browse Closet", href: "/listings", icon: Compass },
    { label: "My Bookings", href: "/dashboard/bookings", icon: ShoppingBag, authRequired: true },
    { label: "My Listings", href: "/dashboard/listings", icon: Sparkles, authRequired: true },
    { label: "Scan Pickup QR", href: "/dashboard/scan", icon: QrCode, authRequired: true },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, authRequired: true },
    { label: "Saved Items", href: "/dashboard/saved", icon: Heart, authRequired: true },
    { label: "Profile & ID", href: "/dashboard/profile", icon: User, authRequired: true },
  ];

  return (
    <aside className="w-64 h-full bg-[#FAF7F2] dark:bg-[#111215] border-r border-[#DCD5C6] dark:border-[#22262F] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#DCD5C6] dark:border-[#22262F] flex items-center justify-between">
          <Logo size="md" href="/" />

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#8C867A] hover:text-[#111215] dark:hover:text-white rounded hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Campus Verification Badge */}
        <div className="px-3.5 py-2.5 bg-[#ECE6DA] dark:bg-[#1E222A] mx-3 my-3 rounded-lg border border-[#D4CCBC] dark:border-[#2D3340] flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#1E3A2F] dark:bg-[#589E83] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#1E3A2F] dark:text-[#A8C7B8] uppercase tracking-wider">
              <Building2 className="w-3 h-3 text-[#1E3A2F] dark:text-[#A8C7B8]" />
              VERIFIED CAMPUS
            </div>
            <p className="text-xs font-display font-bold text-[#111215] dark:text-[#F4EFE6] truncate">
              {user?.college || "KIET Group of Institutions"}
            </p>
          </div>
        </div>

        {/* Post Listing CTA */}
        <div className="px-3 mb-2">
          <Link href="/listings/create" onClick={onCloseMobile}>
            <button className="w-full bg-[#111215] dark:bg-[#F4EFE6] hover:bg-[#E85938] dark:hover:bg-[#E85938] text-[#F4EFE6] dark:text-[#111215] hover:text-white dark:hover:text-white font-display font-bold text-xs py-2 h-9 rounded-sm flex items-center justify-center gap-2 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />
              List an Outfit
            </button>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-1 space-y-1">
          {navItems.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#ECE6DA] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] font-bold border border-[#D4CCBC] dark:border-[#2D3340]"
                    : "text-[#6D6B65] dark:text-[#9A968D] hover:bg-[#ECE6DA]/60 dark:hover:bg-[#1E222A]/60 hover:text-[#111215] dark:hover:text-[#F4EFE6]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-[#E85938]"
                      : "text-[#8C867A] dark:text-[#7A756C]"
                  }`}
                />
                <span className="flex-1 font-display">{item.label}</span>
                {item.href === "/dashboard/scan" && (
                  <span className="text-[8px] font-bold bg-[#E85938]/15 text-[#C64324] dark:text-[#F0775A] px-1 py-0.5 rounded-sm uppercase font-mono">
                    SCAN
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#DCD5C6] dark:border-[#22262F]">
        {isAuthenticated && user ? (
          <div className="p-2.5 rounded-lg bg-[#ECE6DA] dark:bg-[#1E222A] border border-[#D4CCBC] dark:border-[#2D3340] flex items-center justify-between">
            <Link
              href="/dashboard/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-7 h-7 rounded-lg border border-[#C8C0AF] dark:border-[#363C4A]">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-[#111215] text-[#F4EFE6] text-[10px] font-bold font-mono">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-display font-bold text-[#111215] dark:text-[#F4EFE6] truncate">
                    {user.name}
                  </p>
                  <ShieldCheck className="w-3 h-3 text-[#1E3A2F] dark:text-[#589E83] shrink-0" />
                </div>
                <p className="text-[10px] font-mono text-[#8C867A] truncate">
                  {user.collegeId || user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 text-[#8C867A] hover:text-[#E85938] rounded transition-colors ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login" onClick={onCloseMobile}>
              <button className="w-full bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] text-xs h-8 rounded-sm font-display font-bold">
                Sign In
              </button>
            </Link>
            <Link href="/register" onClick={onCloseMobile}>
              <button className="w-full text-xs h-8 rounded-sm font-display font-semibold border border-[#DCD5C6] dark:border-[#22262F] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A]">
                Join Marketplace
              </button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
