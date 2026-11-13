"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";
import { BACKEND_URL } from "@/configs/env";
import { formatMs, formatUptime, timeAgo } from "@/lib/format";
import type { Website } from "@/lib/api";

export default function DemoPage() {
  const [sites, setSites] = useState<Website[] | null>(null);
  const [error, setError] = useState(false);
  const load = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/v1/demo/websites`);
      if (!r.ok) throw new Error();
      setSites(await r.json());
      setError(false);
    } catch {
      setError(true);
    }
  };
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/demo" className="flex items-center gap-2 font-bold">
            <Activity className="text-emerald-600" />
            Upbot{" "}
            <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              Live demo
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/shaurya35/upbot/tree/main/docs/architecture"
              className="hidden text-sm font-medium text-slate-600 sm:inline"
              target="_blank"
              rel="noreferrer"
            >
              Architecture ↗
            </a>
            <a
              href="https://github.com/shaurya35/upbot"
              className="whitespace-nowrap text-sm font-medium text-slate-600"
              target="_blank"
              rel="noreferrer"
            >
              Source ↗
            </a>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Website monitoring</h1>
          <p className="mt-2 text-sm text-slate-600">
            Real checks from a single monitoring location. This demo is
            read-only.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load monitoring data.{" "}
            <button className="underline" onClick={load}>
              Try again
            </button>
          </div>
        )}
        {!sites && !error && (
          <p className="text-sm text-slate-500">Loading monitors…</p>
        )}
        {sites?.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            No demo monitors are configured yet.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {sites?.map((site) => (
            <Link
              key={site.id}
              href={`/demo/website/${site.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-emerald-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{site.name}</h2>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${site.status === "UP" ? "bg-emerald-50 text-emerald-700" : site.status === "DOWN" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {site.status === "UNKNOWN" ? "Pending or stale" : site.status}
                </span>
              </div>
              <p className="mt-2 truncate text-sm text-slate-500">{site.url}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Observed uptime</span>
                  <p className="mt-1 font-semibold">
                    {formatUptime(site.uptime24h)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Average response</span>
                  <p className="mt-1 font-semibold">
                    {formatMs(site.avgResponseTime24h)}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                <span>Last checked {timeAgo(site.lastCheckedAt)}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="h-3 w-3" />
          Refreshes every 30 seconds. Uptime reflects observed checks.
        </p>
      </div>
    </main>
  );
}
