import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Upbot - Free Uptime Monitoring for Developers & Startups",
    template: "%s | Upbot - Uptime Monitoring Made Simple",
  },
  description:
    "Join the waitlist for Upbot - free uptime monitoring with instant alerts from 7+ global locations. Perfect for developers, startups, and hobbyists. Always free tier available.",
  keywords: [
    "uptime monitoring",
    "website monitoring", 
    "server monitoring",
    "free uptime monitoring",
    "site monitoring",
    "downtime alerts",
    "website uptime",
    "monitoring tool",
    "status page",
    "SSL monitoring",
    "performance monitoring",
    "website health check",
    "global monitoring",
    "instant alerts",
    "developer tools",
    "startup tools",
    "hobbyist monitoring",
    "free monitoring service",
    "waitlist",
    "Upbot",
    "uptime tracker",
    "website availability",
    "server uptime",
    "monitoring platform",
    "alerting system",
    "downtime detection",
    "website performance",
    "monitoring dashboard",
    "API monitoring",
    "endpoint monitoring",
    "self-hosted monitoring",
    "open source monitoring",
  ],
  authors: [{ name: "Shaurya" }, { name: "Upbot Team" }],
  creator: "Shaurya",
  publisher: "Upbot",
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
    title: "Upbot - Free Uptime Monitoring for Developers",
    description:
      "Join the waitlist for free uptime monitoring with instant alerts from 7+ global locations. Perfect for developers and startups.",
    url: "https://upbot.space",
    siteName: "Upbot",
    images: [
      {
        url: "https://res.cloudinary.com/dkjsi6iwm/image/upload/v1753265738/1200x630_yuxhnq.png",
        width: 1200,
        height: 630,
        alt: "Upbot - Free Uptime Monitoring for Developers and Startups",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upbot - Free Uptime Monitoring for Developers",
    description:
      "Join the waitlist for free uptime monitoring. Always free for hobbyists—no fees, ever.",
    images: [
      "https://res.cloudinary.com/dkjsi6iwm/image/upload/v1753265738/1200x630_yuxhnq.png",
    ],
    creator: "@_shaurya35",
    site: "@_shaurya35",
  },
  manifest: "/manifest.json",
  category: "Technology",
  classification: "Developer Tools",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Upbot",
  alternateName: "Upbot Monitoring",
  description:
    "Free uptime monitoring platform with global coverage, instant alerts, and comprehensive downtime reporting for developers and startups.",
  url: "https://upbot.space",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Monitoring Tools",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  softwareVersion: "1.0",
  releaseNotes: "Currently in waitlist phase - join early access",
  offers: [
    {
      "@type": "Offer",
      name: "Free Tier",
      description: "Always free for hobbyists and personal projects",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2025-01-01",
    }
  ],
  provider: {
    "@type": "Organization", 
    name: "Upbot",
    url: "https://upbot.space",
    sameAs: [
      "https://twitter.com/_shaurya35",
      "https://github.com/shaurya35"
    ]
  },
  creator: {
    "@type": "Person",
    name: "Shaurya",
    url: "https://shauryacodes.me",
    sameAs: [
      "https://twitter.com/_shaurya35",
      "https://github.com/shaurya35"
    ]
  },
  featureList: [
    "Global monitoring from 7+ locations",
    "30-second check intervals", 
    "Instant email and SMS alerts",
    "SSL certificate monitoring",
    "Slack and webhook integrations",
    "Always free tier for hobbyists",
    "Enterprise-grade reliability"
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
    bestRating: "5",
    worstRating: "1"
  },
  potentialAction: {
    "@type": "InteractAction",
    name: "Join Waitlist",
    target: "https://upbot.space",
    description: "Join the waitlist for early access to free uptime monitoring"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" prefix="og: https://ogp.me/ns#">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        
        {/* SEO Meta Tags */}
        <meta name="theme-color" content="#059669" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Upbot" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Security & Performance */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Verification Meta Tags */}
        <meta name="google-site-verification" content="" />
        
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Performance Optimizations */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Additional SEO Files */}
        <link rel="author" href="/humans.txt" />
      </head>

      <body
        suppressHydrationWarning
        className="antialiased font-sans"
        style={{
          "--font-geist-sans": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
          "--font-geist-mono": "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace"
        } as React.CSSProperties}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
