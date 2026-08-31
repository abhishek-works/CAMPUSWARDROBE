"use client";

import React from "react";
import {
  Sparkles,
  Briefcase,
  Shirt,
  Crown,
  Flame,
  Layers,
  ShoppingBag,
  Gem,
  Tag,
  Scissors,
} from "lucide-react";

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CategoryIcon({
  category,
  className = "w-3.5 h-3.5",
}: CategoryIconProps) {
  const cat = (category || "").toLowerCase();

  if (cat.includes("formal") || cat.includes("suit") || cat.includes("interview")) {
    return <Briefcase className={`${className} text-[#1E3A2F] dark:text-[#589E83]`} />;
  }
  if (cat.includes("ethnic") || cat.includes("lehenga") || cat.includes("saree")) {
    return <Crown className={`${className} text-[#B88654] dark:text-[#E5BE97]`} />;
  }
  if (cat.includes("traditional") || cat.includes("kurta") || cat.includes("sherwani")) {
    return <Gem className={`${className} text-[#B88654] dark:text-[#E5BE97]`} />;
  }
  if (cat.includes("party") || cat.includes("fest") || cat.includes("club")) {
    return <Sparkles className={`${className} text-[#7B3066] dark:text-[#D489BF]`} />;
  }
  if (cat.includes("hoodie") || cat.includes("sweat") || cat.includes("street")) {
    return <Flame className={`${className} text-[#E85938] dark:text-[#F0775A]`} />;
  }
  if (cat.includes("jacket") || cat.includes("blazer") || cat.includes("coat")) {
    return <Layers className={`${className} text-[#5C204B] dark:text-[#D489BF]`} />;
  }
  if (cat.includes("shirt") || cat.includes("tee") || cat.includes("top")) {
    return <Shirt className={`${className} text-[#1E3A2F] dark:text-[#589E83]`} />;
  }
  if (cat.includes("jean") || cat.includes("trouser") || cat.includes("pant") || cat.includes("denim")) {
    return <Scissors className={`${className} text-[#E85938] dark:text-[#F0775A]`} />;
  }
  if (cat.includes("access") || cat.includes("bag")) {
    return <ShoppingBag className={`${className} text-[#B88654] dark:text-[#E5BE97]`} />;
  }

  return <Tag className={`${className} text-[#E85938]`} />;
}
