import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CampusWardrobe - Rent Clothes from Campus Peers",
  description:
    "A peer-to-peer clothing rental platform for college students in India. Rent formal wear, ethnic outfits, party dresses, and more from students near you.",
  keywords: [
    "campus",
    "wardrobe",
    "clothing rental",
    "college",
    "india",
    "peer to peer",
    "sustainable fashion",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${plusJakarta.className} ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#F4EFE6] dark:bg-[#0C0D0F] text-[#111215] dark:text-[#F4EFE6] selection:bg-[#E85938] selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
