"use client";

import React from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, ShieldCheck, QrCode } from "lucide-react";

interface QrPassModalProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: string;
    bookingCode: string;
    qrToken: string;
    status: string;
    rentalType?: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    listing: {
      id: string;
      title: string;
      images: string[];
      pickupLocation?: string;
    };
    lender?: {
      name: string;
      collegeId?: string;
      avatarUrl?: string;
    };
  } | null;
}

export function QrPassModal({ open, onClose, booking }: QrPassModalProps) {
  if (!booking) return null;

  const images = Array.isArray(booking.listing.images) ? booking.listing.images : [];
  const thumbnail = images[0] || "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 text-center">
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <QrCode className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Campus Rental Pass</span>
          </div>
          <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">
            Pickup Verification QR
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Show this to the clothing owner during handover.
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Container */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-800/70 rounded-3xl border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex flex-col items-center my-2 space-y-3">
          <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <QRCodeSVG
              value={JSON.stringify({
                bookingCode: booking.bookingCode,
                qrToken: booking.qrToken,
                bookingId: booking.id,
              })}
              size={180}
              level="H"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Pass ID Code
            </span>
            <p className="text-base font-mono font-black text-indigo-600 dark:text-indigo-400">
              {booking.bookingCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(booking.status)} text-[11px] font-bold px-2.5 py-0.5 rounded-md`}>
              {booking.status}
            </Badge>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
              {booking.rentalType || "DAY"} RENTAL
            </span>
          </div>
        </div>

        {/* Outfit & Handover Details */}
        <div className="p-3 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 text-left">
          <div className="w-12 h-14 relative rounded-xl overflow-hidden bg-zinc-200 shrink-0">
            <Image src={thumbnail} alt={booking.listing.title} fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">
              {booking.listing.title}
            </h4>
            <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
              <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">{booking.listing.pickupLocation || "Campus Handover Spot"}</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
              <User className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">
                Owner: <strong>{booking.lender?.name || "Student"}</strong> {booking.lender?.collegeId ? `(${booking.lender.collegeId})` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Protected by Campus Escrow Deposit
        </div>

        <Button onClick={onClose} className="w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold h-10 mt-2">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
