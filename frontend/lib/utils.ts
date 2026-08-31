import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    READY_FOR_PICKUP: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    PICKED_UP: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    RETURNED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    COMPLETED: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    CANCELLED: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    DISPUTED: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  };
  return colors[status] || "bg-zinc-100 text-zinc-800 border-zinc-200";
}

export function getCategoryIcon(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("shirt") && !cat.includes("t-shirt")) return "👔";
  if (cat.includes("t-shirt") || cat.includes("tee")) return "👕";
  if (cat.includes("hoodie") || cat.includes("sweat")) return "🧥";
  if (cat.includes("jacket") || cat.includes("coat") || cat.includes("blazer")) return "🧥";
  if (cat.includes("jean") || cat.includes("trouser") || cat.includes("pant")) return "👖";
  if (cat.includes("formal") || cat.includes("suit")) return "🤵";
  if (cat.includes("ethnic") || cat.includes("lehenga") || cat.includes("saree") || cat.includes("anarkali")) return "🥻";
  if (cat.includes("traditional") || cat.includes("kurta") || cat.includes("sherwani")) return "🪔";
  if (cat.includes("party")) return "✨";
  if (cat.includes("sport") || cat.includes("track")) return "👟";
  if (cat.includes("access")) return "👜";
  return "👗";
}

