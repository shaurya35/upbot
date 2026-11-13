"use client"

import { useCallback, useEffect, useState } from "react"
import { isAxiosError } from "axios"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, BarChart3, CheckCircle, Clock, ExternalLink, HelpCircle, Pencil, Trash2, TrendingUp, XCircle } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/contexts/AuthProvider"
import { WebsiteFormDialog } from "@/components/website-form-dialog"
import { IncidentHistory } from "@/components/incident-history"
import { getErrorMessage, websiteApi, type Check, type Incident, type StatsRange, type Website, type WebsiteStats } from "@/lib/api"
import { formatInterval, formatMs, formatUptime, STATUS_STYLES, timeAgo } from "@/lib/format"

const RANGES: StatsRange[] = ["24h", "7d", "30d"]
const RANGE_LABELS: Record<StatsRange, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" }
const REFRESH_INTERVAL = 60_000

const bucketLabel = (iso: string, range: StatsRange) => format(new Date(iso), range === "24h" ? "HH:mm" : "MMM d, HH:mm")

const fillBuckets = (stats: WebsiteStats) => {
  const step = stats.bucketSeconds * 1000
  const byTime = new Map(stats.buckets.map((bucket) => [new Date(bucket.time).getTime(), bucket]))
  const rangeMs = { "24h": 86_400_000, "7d": 7 * 86_400_000, "30d": 30 * 86_400_000 }[stats.range]
  const end = Math.floor(Date.now() / step) * step
  const slots = []
  for (let time = end - Math.ceil(rangeMs / step - 1) * step; time <= end; time += step) {
    slots.push({ time: new Date(time).toISOString(), bucket: byTime.get(time) ?? null })
  }
  return slots
}

function SummaryCard({ label, children, icon }: { label: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">{label}</p>
            <div className="mt-1">{children}</div>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

export default function WebsiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const websiteId = params.websiteId as string

  const [range, setRange] = useState<StatsRange>("24h")
  const [website, setWebsite] = useState<Website | null>(null)
  const [stats, setStats] = useState<WebsiteStats | null>(null)
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [site, siteStats, recentChecks, incidentHistory] = await Promise.all([
        websiteApi.get(websiteId),
        websiteApi.stats(websiteId, range),
        websiteApi.checks(websiteId, 20),
        websiteApi.incidents(websiteId),
      ])
      setWebsite(site)
      setStats(siteStats)
      setChecks(recentChecks)
      setIncidents(incidentHistory)
      setError(null)
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) setNotFound(true)
      else setError(getErrorMessage(err))
    }
  }, [websiteId, range])

  useEffect(() => {
    if (!user) return
    load()
    const timer = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [user, load])

  const handleDelete = async () => {
    try {
      await websiteApi.remove(websiteId)
      router.push("/dashboard")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (notFound) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600 mb-4">The website you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </AppShell>
    )
  }

  const status = STATUS_STYLES[website?.status ?? "UNKNOWN"]
  const slots = stats ? fillBuckets(stats) : []
  const chartData = slots.map((slot) => ({
    time: bucketLabel(slot.time, range),
    responseTime: slot.bucket?.avgResponseTime ?? null,
  }))

  return (
    <TooltipProvider>
      <AppShell
        header={
          <>
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8 px-2 gap-1"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="text-xs hidden sm:inline">Websites</span>
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                <h1 className="text-lg font-semibold text-gray-900 truncate">{website?.name ?? "Loading..."}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs bg-transparent"
                onClick={() => setEditOpen(true)}
                disabled={!website}
              >
                <Pencil className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
                disabled={!website}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        }
      >
        {error && <p className="text-sm text-red-600">{error}</p>}

        {website && (
          <a
            href={website.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-600"
          >
            {website.url}
            <ExternalLink className="w-3 h-3" />
            <span className="text-gray-400 ml-2">· checked every {formatInterval(website.monitorInterval)}</span>
          </a>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <SummaryCard label="Current Status" icon={null}>
            <div className="flex items-center gap-2">
              {website?.status === "UP" ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : website?.status === "DOWN" ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <HelpCircle className="w-4 h-4 text-gray-400" />
              )}
              <p className="text-sm font-semibold">{status.label}</p>
            </div>
          </SummaryCard>
          <SummaryCard label="Last Checked" icon={<Clock className="w-4 h-4 text-gray-400" />}>
            <p className="text-sm font-semibold text-gray-900">{timeAgo(website?.lastCheckedAt)}</p>
          </SummaryCard>
          <SummaryCard label="7-Day Observed Uptime" icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}>
            <p className="text-sm font-semibold text-emerald-600">{formatUptime(stats?.uptime["7d"])}</p>
          </SummaryCard>
          <SummaryCard label="30-Day Observed Uptime" icon={<BarChart3 className="w-4 h-4 text-emerald-500" />}>
            <p className="text-sm font-semibold text-emerald-600">{formatUptime(stats?.uptime["30d"])}</p>
          </SummaryCard>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold">Status Overview</CardTitle>
                <CardDescription className="text-sm">Last {RANGE_LABELS[range]}</CardDescription>
              </div>
              <div className="flex gap-1">
                {RANGES.map((option) => (
                  <Button
                    key={option}
                    variant={range === option ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setRange(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div>
                <p className="text-xs text-gray-500">Observed Uptime</p>
                <p className="text-sm font-semibold text-emerald-600">{formatUptime(stats?.summary.uptime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Checks</p>
                <p className="text-sm font-semibold text-gray-900">{stats?.summary.totalChecks ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Response</p>
                <p className="text-sm font-semibold text-blue-600">{formatMs(stats?.summary.avgResponseTime)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] flex items-center gap-1">
                  {slots.map(({ time, bucket }) => {
                    const color = !bucket
                      ? "bg-gray-200"
                      : bucket.down === 0
                        ? "bg-emerald-500"
                        : bucket.up === 0
                          ? "bg-red-500"
                          : "bg-amber-400"
                    return (
                      <Tooltip key={time}>
                        <TooltipTrigger asChild>
                          <div className={`h-10 flex-1 min-w-[4px] rounded-sm transition-opacity hover:opacity-80 ${color}`} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {bucketLabel(time, range)}:{" "}
                            {bucket ? `${bucket.up}/${bucket.total} checks up` : "No data"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{RANGE_LABELS[range]} ago</span>
                <span>Now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-gray-200 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Response Time</CardTitle>
              <CardDescription className="text-xs">Average response time of successful checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={40} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={50} tickFormatter={(value) => `${value}ms`} />
                    <ChartTooltip formatter={(value) => [`${value}ms`, "Response time"]} contentStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="responseTime" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Response Time Stats</CardTitle>
              <CardDescription className="text-xs">Last {RANGE_LABELS[range]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Average</span>
                <span className="text-sm font-semibold">{formatMs(stats?.summary.avgResponseTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Minimum</span>
                <span className="text-sm font-semibold text-emerald-600">{formatMs(stats?.summary.minResponseTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Maximum</span>
                <span className="text-sm font-semibold text-red-600">{formatMs(stats?.summary.maxResponseTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">24h Observed Uptime</span>
                <span className="text-sm font-semibold">{formatUptime(stats?.uptime["24h"])}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Incident history</CardTitle></CardHeader>
          <CardContent><IncidentHistory incidents={incidents} /></CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Checks</CardTitle>
            <CardDescription className="text-xs">The latest results from the monitoring workers</CardDescription>
          </CardHeader>
          <CardContent>
            {checks === null ? (
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
            ) : checks.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                No checks yet. The first one runs within {website ? formatInterval(website.monitorInterval) : "a minute"}.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {checks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_STYLES[check.status].dot}`} />
                      <span className="text-gray-600 whitespace-nowrap">{format(new Date(check.createdAt), "MMM d, HH:mm:ss")}</span>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        {check.region.code}
                      </Badge>
                      {check.error && <span className="text-xs text-red-600 truncate">{check.error}</span>}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-600">
                      <span>{check.statusCode ?? "-"}</span>
                      <span className="w-14 text-right">{formatMs(check.responseTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <WebsiteFormDialog open={editOpen} onOpenChange={setEditOpen} website={website ?? undefined} onSaved={load} />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {website?.name}?</AlertDialogTitle>
              <AlertDialogDescription>Monitoring stops and the website is removed from your dashboard.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppShell>
    </TooltipProvider>
  )
}
