import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
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
  title: {
    default: "Upbot - Uptime Monitoring Platform",
    template: "%s | Upbot",
  },
  description: "Monitor websites from 7+ global locations with instant alerts, detailed analytics, and comprehensive downtime reporting. Free for hobbyists.",
  keywords: [
    "uptime monitoring", "website monitoring", "server monitoring", 
    "free uptime monitoring", "status page", "alerting", "downtime detection",
    "SSL monitoring", "performance analytics", "website health"
  ],
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
  openGraph: {
    title: "Upbot · Uptime Monitoring Made Simple",
    description: "Monitor websites from 7+ global locations with instant alerts. Always free for hobbyists.",
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
    site: "@_shaurya35",
  },
  manifest: "/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Upbot",
  "description": "Comprehensive uptime monitoring platform with global coverage and instant alerts",
  "url": "https://upbot.space",
  "applicationCategory": "Developer Tools",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "500"
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
        
        <meta name="theme-color" content="#059669" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
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
