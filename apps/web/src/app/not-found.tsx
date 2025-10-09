import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-emerald-600" />
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
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            If you believe this is an error, please{" "}
            <Link 
              href="https://x.com/_shaurya35" 
              className="text-emerald-600 hover:text-emerald-700 underline"
              target="_blank"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}