"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import { AppLayout } from "@/components/app-layout";
import { bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldCheck,
  Building2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  SwitchCamera,
  VideoOff,
  Flashlight,
  Volume2,
} from "lucide-react";

export default function QrScannerPage() {
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifiedBooking, setVerifiedBooking] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"pickup" | "return">("pickup");

  // Camera Scanner States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanningStatus, setScanningStatus] = useState<string>("Initializing camera...");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);

  // Play audio beep on successful QR scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch {
      // AudioContext not allowed before user interaction
    }
  };

  const startCamera = useCallback(async () => {
    stopCamera();
    setError("");
    setScanningStatus("Requesting device camera permission...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraPermission("granted");
      setCameraActive(true);
      setScanningStatus("Camera active. Align Student QR Pass in frame.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        startScanLoop();
      }
    } catch (err: any) {
      setCameraPermission("denied");
      setCameraActive(false);
      setScanningStatus("Camera permission denied or camera unavailable.");
      setError("Please allow camera access in your browser, or enter the booking code manually.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback(
    async (code: string) => {
      if (loading || lastScannedCodeRef.current === code) return;
      lastScannedCodeRef.current = code;
      setTokenInput(code);
      playBeep();

      // Trigger automatic verification
      await submitVerification(code);

      // Reset last scanned code after 3 seconds
      setTimeout(() => {
        lastScannedCodeRef.current = null;
      }, 3000);
    },
    [loading, mode]
  );

  const startScanLoop = () => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (qrCode && qrCode.data) {
              handleScanSuccess(qrCode.data);
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const submitVerification = async (val: string) => {
    const cleanVal = val.trim();
    if (!cleanVal) return;

    setError("");
    setLoading(true);
    setVerifiedBooking(null);

    try {
      if (mode === "pickup") {
        const res = await bookingApi.verifyPickup({
          bookingCode: cleanVal.startsWith("CW-") ? cleanVal : undefined,
          qrToken: !cleanVal.startsWith("CW-") ? cleanVal : undefined,
        });
        setVerifiedBooking(res.data.booking);
      } else {
        const res = await bookingApi.verifyReturn(cleanVal);
        setVerifiedBooking(res.data.booking);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed. Check the pass code.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification(tokenInput);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Campus Handover Scanner
            </h1>
            <QrCode className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            <span>Encrypted Live QR pass verification for <strong>{user?.college || "KIET"}</strong></span>
          </p>
        </div>

        {/* Mode Selector (Pickup vs Return) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => {
              setMode("pickup");
              setVerifiedBooking(null);
              setError("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "pickup"
                ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Outfit Pickup
          </button>
          <button
            onClick={() => {
              setMode("return");
              setVerifiedBooking(null);
              setError("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "return"
                ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Verify Return &amp; Release
          </button>
        </div>

        {/* Scanner Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl space-y-6">
          {/* Live Camera Viewport with Aesthetic Red Laser */}
          <div className="relative aspect-[4/3] rounded-3xl bg-black flex flex-col items-center justify-center overflow-hidden border-2 border-red-600/40 shadow-inner">
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover ${
                !cameraActive ? "hidden" : "block"
              }`}
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="text-center p-6 space-y-3 z-10">
                <Camera className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  {scanningStatus}
                </p>
                <Button
                  type="button"
                  onClick={startCamera}
                  className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-1.5" /> Start Camera
                </Button>
              </div>
            )}

            {/* Futuristic Red Scanning Laser & Viewfinder */}
            {cameraActive && (
              <>
                <div className="relative w-56 h-56 border-2 border-red-500/80 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
                  {/* Glowing corner brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-lg" />

                  {/* Animated Red Laser Scan Line */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-[0_0_15px_#ef4444]" />
                </div>

                {/* Top Controls on Camera Feed */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                  <span className="text-[10px] font-mono font-bold text-red-400 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-red-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE SCANNER
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleFacingMode}
                    className="text-xs text-white bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-xl h-8 px-2.5"
                    title="Flip camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </Button>
                </div>

                {/* Bottom Tip */}
                <div className="absolute bottom-3 inset-x-0 text-center">
                  <span className="text-[11px] font-semibold text-white bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                    Point camera at Student&apos;s QR Pass
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Or Type Booking Pass Code / QR Token:
              </label>
              <div className="flex gap-2">
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. CW-2327CS1190-1025 or paste token"
                  className="font-mono text-xs h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 shadow-md shadow-red-500/20"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Successful Live Confirmation Modal View */}
          {verifiedBooking && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    {mode === "pickup" ? "Outfit Handover Confirmed! 🎉" : "Outfit Return Confirmed! ✅"}
                  </h3>
                  <p className="text-xs opacity-90">
                    Status updated to <strong>{verifiedBooking.status}</strong>
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs space-y-1.5">
                <p className="font-bold text-zinc-900 dark:text-white">
                  {verifiedBooking.listing?.title || "Campus Outfit"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-zinc-500 pt-1">
                  <div>
                    <span>Renter: </span>
                    <strong className="text-zinc-900 dark:text-white">
                      {verifiedBooking.renter?.name || "Student"}
                    </strong>{" "}
                    ({verifiedBooking.renter?.collegeId || "CS"})
                  </div>
                  <div>
                    <span>Rental: </span>
                    <strong className="text-zinc-900 dark:text-white">
                      {formatPrice(verifiedBooking.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/dashboard/bookings">
                  <Button size="sm" className="rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white">
                    View All Bookings <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

