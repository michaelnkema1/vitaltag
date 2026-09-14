import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces is self-hosted (see globals.css @font-face) rather than loaded
// via next/font/google -- Turbopack's Google Fonts fetch for this font's
// variable axes was intermittently failing with "Can't resolve
// '@vercel/turbopack-next/internal/font/google/font'".

export const metadata: Metadata = {
  title: "VitalTag — Emergency Medical Passport",
  description:
    "Dynamic emergency medical identity and automated triage infrastructure for the Golden Hour.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#217868",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
