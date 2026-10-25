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

// Link previews (X, Telegram) need an absolute URL for the share image. Vercel provides the production domain;
// set NEXT_PUBLIC_SITE_URL if the site uses a custom domain.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const DESCRIPTION =
  "A community AI guide for BOT Chain developers. Answers come from the official developer docs, with sources, on-chain ratings and community tips.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "BOTGuide",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "BOTGuide",
    title: "BOTGuide: an AI guide for BOT Chain developers",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "BOTGuide: an AI guide for BOT Chain developers",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
