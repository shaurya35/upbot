import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Basic SEO Meta Tags
  title: {
    default: "Upbot · Free Uptime Monitoring Platform",
    template: "%s | Upbot",
  },
  description:
    "Monitor websites from 15+ global locations with instant alerts, detailed analytics, and comprehensive downtime reporting. Always free for hobbyists with zero configuration required.",
  keywords: [
    "Upbot",
    "uptime monitoring",
    "website monitoring", 
    "server monitoring",
    "downtime detection",
    "SSL monitoring",
    "performance analytics",
    "website health",
    "free uptime monitoring",
    "free status page",
    "free alerting",
    "alerting",
    "monitoring tool",
    "website uptime",
    "server uptime",
    "global monitoring",
    "instant alerts",
    "zero config",
    "hobbyist friendly",
    "developer tools",
    "web performance",
    "site reliability",
    "monitoring dashboard"
  ],
  authors: [{ name: "Shaurya Singh", url: "https://www.shauryacodes.me/" }],
  creator: "Shaurya Singh",
  publisher: "Upbot",
  category: "Developer Tools",
  
  // Technical SEO
  metadataBase: new URL("https://upbot.space"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph / Social Media
  openGraph: {
    title: "Upbot · Free Uptime Monitoring Made Simple",
    description:
      "Monitor websites from 15+ global locations with instant alerts. Zero configuration required. Always free for hobbyists.",
    url: "https://upbot.space",
    siteName: "Upbot",
    images: [
      {
        url: "https://res.cloudinary.com/dkjsi6iwm/image/upload/v1753265738/1200x630_yuxhnq.png",
        width: 1200,
        height: 630,
        alt: "Upbot — Free uptime monitoring platform with global coverage",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Upbot · Free Uptime Monitoring Made Simple",
    description:
      "Go live in under 30s. Monitor from 15+ global locations. Always free for hobbyists—no fees, ever.",
    images: [
      "https://res.cloudinary.com/dkjsi6iwm/image/upload/v1753265738/1200x630_yuxhnq.png",
    ],
    creator: "@_shaurya35",
    site: "@_shaurya35",
  },

  // PWA Manifest
  manifest: "/manifest.json",

  // Additional SEO
  applicationName: "Upbot",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Upbot",
  description:
    "Comprehensive uptime monitoring platform with global coverage and instant alerts",
  url: "https://upbot.space",
  applicationCategory: "Developer Tools",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* SEO Meta Tags */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <meta name="author" content="Shaurya Singh" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <link rel="canonical" href="https://upbot.space" />
        
        {/* Security & Performance */}
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Verification Meta Tags */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="android-chrome-192x192" href="/android-chrome-192x192.png" />
        <link rel="android-chrome-512x512" href="/android-chrome-512x512.png" />
        
        {/* PWA & Mobile */}
        <meta name="theme-color" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Upbot" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />

        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Humans.txt */}
        <link rel="author" href="/humans.txt" />
      </head>

      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
