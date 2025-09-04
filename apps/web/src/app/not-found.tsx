"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a minimal fallback during SSR
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="mb-4">Page Not Found</p>
          <a href="/" className="text-blue-600 hover:underline">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-emerald-600 text-2xl">⚠️</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to monitoring your websites.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2"
          >
            🏠 Go Home
          </Link>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 h-10 px-4 py-2"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            If you believe this is an error, please{" "}
            <Link 
              href="https://x.com/_shaurya35" 
              className="text-emerald-600 hover:text-emerald-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}