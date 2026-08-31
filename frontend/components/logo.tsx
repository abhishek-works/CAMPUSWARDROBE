"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showSubtitle?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  href = "/",
  showSubtitle = true,
  className = "",
}: LogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const badgeClasses = isSm
    ? "w-7 h-7 rounded-sm text-[10px]"
    : isLg
    ? "w-11 h-11 rounded-md text-base"
    : "w-8 h-8 rounded-sm text-xs";

  const titleClasses = isSm
    ? "text-xs leading-none font-display font-bold"
    : isLg
    ? "text-xl leading-none font-display font-bold"
    : "text-sm leading-none font-display font-bold";

  const subtitleClasses = isSm
    ? "text-[7px] tracking-widest"
    : isLg
    ? "text-[9px] tracking-widest"
    : "text-[8px] tracking-widest";

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* CW Architectural Badge */}
      <div
        className={`${badgeClasses} bg-[#111215] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#111215] font-mono font-bold flex items-center justify-center border border-white/10 dark:border-black/10 shrink-0 transition-transform group-hover:scale-105 duration-200`}
      >
        <span className="tracking-tight">CW</span>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <div className={`tracking-tight ${titleClasses}`}>
          <span className="text-[#111215] dark:text-[#F4EFE6]">CAMPUS</span>
          <span className="text-[#E85938] ml-1">WARDROBE</span>
        </div>
        {showSubtitle && (
          <span
            className={`font-mono uppercase text-[#8C867A] dark:text-[#7A756C] mt-0.5 ${subtitleClasses}`}
          >
            PEER CLOTHING GUILD
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
