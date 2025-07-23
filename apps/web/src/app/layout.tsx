import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Upbot",
  description: "The most comprehensive Uptime Monitoring Platform",
  openGraph: {
    title: "Upbot · Uptime Monitoring Made Simple",
    description:
      "Go live in under 30s. Always free for hobbyists— no fees, ever.",
    url: "https://upbot.space",
    siteName: "Upbot",
    images: [
      {
        url: "https://res.cloudinary.com/dkjsi6iwm/image/upload/v1753265738/1200x630_yuxhnq.png",
        width: 1200,
        height: 630,
        alt: "Upbot — Uptime monitoring",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Upbot · Uptime Monitoring Made Simple",
    description:
      "Go live in under 30s. Always free for hobbyists—no fees, ever.",
    images: [
      "https://res.cloudinary.com/dkjsi6iwm/image/upload/c_fill,w_600,h_600/v1753263957/OpenGraph-embed-white-864x864_ydbsnk.png",
    ],
    creator: "@_shaurya35",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
