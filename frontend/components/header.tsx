"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { notificationApi } from "@/lib/api";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Search,
  Bell,
  Menu,
  CheckCheck,
  Building2,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenMobile?: () => void;
}

export function Header({ onOpenMobile }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-[#FAF7F2]/95 dark:bg-[#111215]/95 backdrop-blur-md border-b border-[#DCD5C6] dark:border-[#22262F] px-4 lg:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile Menu Button + Campus Indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-sm text-[#4A4741] dark:text-[#BBB4A6] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" href="/" showSubtitle={false} />
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#ECE6DA] dark:bg-[#1E222A] text-[#111215] dark:text-[#F4EFE6] px-3 py-1 rounded-sm border border-[#D4CCBC] dark:border-[#2D3340] text-xs font-mono font-bold">
          <Building2 className="w-3.5 h-3.5 text-[#E85938]" />
          <span className="truncate max-w-[200px]">
            {user?.college || "KIET Group of Institutions"}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A2F] dark:bg-[#589E83]" />
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fits, brands, categories..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-sm bg-[#ECE6DA] dark:bg-[#1E222A] border border-transparent focus:border-[#111215] dark:focus:border-[#E85938] text-[#111215] dark:text-[#F4EFE6] placeholder:text-[#8C867A] focus:outline-none transition-all font-sans"
          />
        </form>
      </div>

      {/* Right Controls: Change Theme Icon + Notifications + Profile + Logout */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Button */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-sm text-[#4A4741] dark:text-[#BBB4A6] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A] relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E85938] text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF7F2] dark:bg-[#15171C] rounded-xl shadow-xl border border-[#DCD5C6] dark:border-[#22262F] p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCD5C6] dark:border-[#22262F]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm text-[#111215] dark:text-[#F4EFE6]">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#E85938]/15 text-[#C64324] dark:text-[#F0775A] rounded-sm">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-mono text-[#E85938] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#DCD5C6] dark:divide-[#262B34] mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-[#8C867A] text-xs font-mono">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.link) router.push(notif.link);
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-sm cursor-pointer transition-colors ${
                          notif.read
                            ? "hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A] opacity-75"
                            : "bg-[#ECE6DA]/60 dark:bg-[#1E222A]/60 hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A] font-medium"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-display font-bold text-[#111215] dark:text-[#F4EFE6]">
                            {notif.title}
                          </p>
                          <span className="text-[9px] font-mono text-[#8C867A] shrink-0">
                            {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4A4741] dark:text-[#BBB4A6] mt-0.5 line-clamp-2 font-sans">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile & Logout */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-8 h-8 rounded-lg border border-[#C8C0AF] dark:border-[#363C4A]">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-[#111215] text-[#F4EFE6] text-xs font-bold font-mono">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-xs font-display font-bold text-[#111215] dark:text-[#F4EFE6] max-w-[120px] truncate">
                {user.name}
              </span>
            </Link>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 px-2 rounded-sm text-xs font-mono font-bold text-[#6D6B65] dark:text-[#9A968D] hover:text-[#E85938] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A] transition-colors flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="text-xs font-mono font-bold h-8 px-3 rounded-sm text-[#111215] dark:text-[#F4EFE6] hover:bg-[#ECE6DA] dark:hover:bg-[#1E222A]">
                Log In
              </button>
            </Link>
            <Link href="/register">
              <button className="text-xs font-display font-bold h-8 px-3 rounded-sm bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] hover:bg-[#E85938] dark:hover:bg-[#E85938] hover:text-white dark:hover:text-white transition-colors">
                Sign Up
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
