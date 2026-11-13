"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BACKEND_URL } from "@/configs/env";
import { formatMs, formatUptime, timeAgo } from "@/lib/format";
import type { Website, WebsiteStats, Check, Incident } from "@/lib/api";
import { IncidentHistory } from "@/components/incident-history";

export default function DemoDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    site: Website;
    stats: WebsiteStats;
    checks: Check[];
    incidents: Incident[];
  } | null>(null);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const base = `${BACKEND_URL}/api/v1/demo/websites/${encodeURIComponent(id)}`;
      const responses = await Promise.all([
        fetch(base),
        fetch(`${base}/stats`),
        fetch(`${base}/checks`),
        fetch(`${base}/incidents`),
      ]);
      if (responses.some((r) => !r.ok)) throw new Error();
      const [site, stats, checks, incidents] = await Promise.all(
        responses.map((r) => r.json()),
      );
      setData({ site, stats, checks, incidents });
      setError(false);
    } catch {
      setError(true);
    }
  }, [id]);
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <Link href="/demo" className="text-sm text-emerald-700">
          ← All monitors
        </Link>
        {error && (
          <p className="mt-5 text-sm text-red-700">
            Unable to load monitoring data.{" "}
            <button className="underline" onClick={load}>
              Try again
            </button>
          </p>
        )}
        {!data && !error && (
          <p className="mt-5 text-slate-500">Loading monitor…</p>
        )}
        {data && (
          <>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{data.site.name}</h1>
                <p className="mt-1 text-sm text-slate-500">{data.site.url}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">
                {data.site.status === "UNKNOWN"
                  ? "Pending or stale"
                  : data.site.status}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Last checked", timeAgo(data.site.lastCheckedAt)],
                ["Observed uptime", formatUptime(data.stats.summary.uptime)],
                [
                  "Average response",
                  formatMs(data.stats.summary.avgResponseTime),
                ],
                ["Checks", String(data.stats.summary.totalChecks)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <section className="mt-5 rounded-xl border bg-white p-5">
              <h2 className="font-semibold">Response time · recent checks</h2>
              <p className="mt-1 text-xs text-slate-500">
                Observed successful checks
              </p>
              {data.checks.some((check) => check.status === "UP") ? (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...data.checks]
                        .reverse()
                        .filter((check) => check.status === "UP")
                        .map((check) => ({
                          time: new Date(check.createdAt).toLocaleTimeString(),
                          responseTime: check.responseTime,
                        }))}
                    >
                      <XAxis dataKey="time" hide />
                      <YAxis width={45} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#059669"
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-8 text-sm text-slate-500">No checks yet.</p>
              )}
            </section>
            <section className="mt-5 rounded-xl border bg-white p-5">
              <h2 className="font-semibold">Incident history</h2>
              <IncidentHistory incidents={data.incidents} />
            </section>
            <section className="mt-5 rounded-xl border bg-white p-5">
              <h2 className="font-semibold">Recent checks</h2>
              {data.checks.length ? (
                data.checks.slice(0, 15).map((check) => (
                  <div
                    key={check.id}
                    className="flex justify-between gap-3 border-t py-3 text-sm"
                  >
                    <span>
                      {check.status} ·{" "}
                      {new Date(check.createdAt).toLocaleString()}
                    </span>
                    <span className="text-slate-500">
                      {check.statusCode ?? "—"} · {formatMs(check.responseTime)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-5 text-sm text-slate-500">
                  Waiting for the first check.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
