"use client";

import React, { useState } from "react";
import { reviewApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  booking: {
    id: string;
    listing?: {
      title: string;
    };
    lender?: {
      name: string;
    };
  } | null;
  onSuccess?: () => void;
}

export function ReviewModal({ open, onClose, booking, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [clothingRating, setClothingRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await reviewApi.create({
        bookingId: booking.id,
        rating,
        clothingRating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError("");
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">
                Rate Your Campus Rental
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Share your experience renting &ldquo;{booking.listing?.title}&rdquo;
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Peer Student Rating */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Owner Experience Rating
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Outfit Condition Rating */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Clothing Quality & Cleanliness
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setClothingRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= clothingRating
                          ? "fill-indigo-500 text-indigo-500"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">
                  {clothingRating} / 5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label htmlFor="review-comment" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Your Review
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the fitting, handover experience, and garment condition?"
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Review"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Thank you for reviewing!
            </h3>
            <p className="text-xs text-zinc-500">
              Your feedback helps keep the campus wardrobe community trusted and reliable.
            </p>
            <Button onClick={handleClose} className="w-full rounded-xl text-xs h-9">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
