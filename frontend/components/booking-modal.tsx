"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { bookingApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import {
  Sun,
  Moon,
  Calendar as CalendarIcon,
  Shield,
  Loader2,
  CheckCircle2,
  MapPin,
  QrCode,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    dailyPrice: number;
    nightPrice?: number;
    securityDeposit: number;
    pickupLocation?: string;
    availableFrom?: string;
    availableTo?: string;
    owner?: {
      id: string;
      name: string;
      collegeId?: string;
    };
    bookings?: {
      startDate: string;
      endDate: string;
    }[];
  };
}

export function BookingModal({ open, onClose, listing }: BookingModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [rentalType, setRentalType] = useState<"DAY" | "NIGHT">("DAY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const nightPrice = listing.nightPrice || Math.round(listing.dailyPrice * 2.2);
  const unitPrice = rentalType === "DAY" ? listing.dailyPrice : nightPrice;

  const calculateCost = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);
    const rentalAmount = totalDays * unitPrice;
    const depositAmount = listing.securityDeposit || 0;
    const totalAmount = rentalAmount + depositAmount;

    return { totalDays, rentalAmount, depositAmount, totalAmount };
  };

  const cost = calculateCost();

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end rental dates.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await bookingApi.create({
        listingId: listing.id,
        startDate,
        endDate,
        rentalType,
      });
      setConfirmedBooking(res.data.booking);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create booking. Please try another date range.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setError("");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  // Today's minimum date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 overflow-hidden">
        {!confirmedBooking ? (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                Book Campus Outfit
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Rent &ldquo;{listing.title}&rdquo; from {listing.owner?.name || "Student Owner"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Rental Type Switcher (Day vs Night) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Choose Rental Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRentalType("DAY")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    rentalType === "DAY"
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Day Rental
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Classes & Events</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(listing.dailyPrice)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">/day</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRentalType("NIGHT")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    rentalType === "NIGHT"
                      ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Moon className="w-4 h-4 text-purple-500" />
                      Night Rental
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Fests & Parties</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      {formatPrice(nightPrice)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">/night</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <Label htmlFor="start-date" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Rental Start
                </Label>
                <input
                  id="start-date"
                  type="date"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <Label htmlFor="end-date" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Rental Return
                </Label>
                <input
                  id="end-date"
                  type="date"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Pickup Location Preview */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-600 dark:text-zinc-300">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-zinc-900 dark:text-white">Pickup Location: </span>
                <span>{listing.pickupLocation || "Near Kundan Chaiwala Stall"}</span>
              </div>
            </div>

            {/* Pricing Calculation Breakdown */}
            {cost ? (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span>
                    {formatPrice(unitPrice)} × {cost.totalDays} {rentalType === "DAY" ? "day(s)" : "night(s)"}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(cost.rentalAmount)}</span>
                </div>

                {cost.depositAmount > 0 && (
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      Refundable Security Deposit
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(cost.depositAmount)}</span>
                  </div>
                )}

                <Separator className="bg-indigo-100 dark:bg-indigo-900/50" />

                <div className="flex justify-between items-center text-sm font-bold text-zinc-900 dark:text-white pt-1">
                  <span>Total Amount</span>
                  <span className="text-base text-indigo-600 dark:text-indigo-400">
                    {formatPrice(cost.totalAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-center text-xs text-zinc-400">
                Select your start and return dates to calculate total rental price.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleBookingSubmit}
                disabled={!cost || loading}
                className="flex-1 rounded-xl text-xs h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    Proceed to Book
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Confirmation & QR Pass Screen */
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                Booking Confirmed! 🎉
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Show this unique QR code to <strong className="text-zinc-800 dark:text-zinc-200">{listing.owner?.name}</strong> at the pickup spot.
              </p>
            </div>

            {/* QR Pass Card */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-3xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col items-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100">
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingCode: confirmedBooking.bookingCode,
                    qrToken: confirmedBooking.qrToken,
                    listingId: listing.id,
                  })}
                  size={160}
                  level="H"
                />
              </div>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Booking Pass ID
                </span>
                <p className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {confirmedBooking.bookingCode}
                </p>
              </div>

              <div className="w-full text-xs space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-left text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pickup Spot:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[60%]">
                    {listing.pickupLocation || "Campus Spot"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rental Period:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {confirmedBooking.totalDays} {confirmedBooking.rentalType === "DAY" ? "Day(s)" : "Night(s)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Amount:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(confirmedBooking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/dashboard/bookings" className="flex-1" onClick={handleClose}>
                <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-10 font-semibold">
                  View My Bookings
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

