"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Clock, Filter, Globe, Plus, Search, Trash2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { getErrorMessage, websiteApi, type Website } from "@/lib/api"
import { formatMs, formatUptime, STATUS_STYLES, timeAgo } from "@/lib/format"

type SortType = "down-first" | "up-first" | "a-z" | "newest-first"

const SORT_LABELS: Record<SortType, string> = {
  "down-first": "Down First",
  "up-first": "Up First",
  "a-z": "A-Z",
  "newest-first": "Newest First",
}

const STATUS_RANK = { DOWN: 0, UNKNOWN: 1, UP: 2 }
const REFRESH_INTERVAL = 30_000

const sortWebsites = (websites: Website[], sort: SortType) => {
  const sorted = [...websites]
  switch (sort) {
    case "down-first":
      return sorted.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
    case "up-first":
      return sorted.sort((a, b) => STATUS_RANK[b.status] - STATUS_RANK[a.status])
    case "a-z":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case "newest-first":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

function StatCard({ label, value, valueClass, icon: Icon, iconClass }: {
  label: string
  value: string | number
  valueClass?: string
  icon: typeof Globe
  iconClass: string
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">{label}</p>
            <p className={`text-xl font-bold ${valueClass ?? "text-gray-900"}`}>{value}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [websites, setWebsites] = useState<Website[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortType>("down-first")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Website | null>(null)

  const load = useCallback(async () => {
    try {
      setWebsites(await websiteApi.list())
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    if (!user) return
    load()
    const timer = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [user, load])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = (websites ?? []).filter(
      (site) => !query || site.name.toLowerCase().includes(query) || site.url.toLowerCase().includes(query)
    )
    return sortWebsites(filtered, sort)
  }, [websites, search, sort])

  const counts = useMemo(() => {
    const list = websites ?? []
    const responseTimes = list.map((w) => w.avgResponseTime24h).filter((v): v is number => v != null)
    return {
      total: list.length,
      up: list.filter((w) => w.status === "UP").length,
      down: list.filter((w) => w.status === "DOWN").length,
      avgResponse: responseTimes.length
        ? Math.round(responseTimes.reduce((sum, v) => sum + v, 0) / responseTimes.length)
        : null,
    }
  }, [websites])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await websiteApi.remove(pendingDelete.id)
      setWebsites((prev) => prev?.filter((site) => site.id !== pendingDelete.id) ?? null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <AppShell
      header={
        <div className="relative w-full max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="Search websites"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Websites</h1>
            <p className="text-sm text-gray-600 mt-0.5">Monitor and manage your website uptime</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1 bg-transparent">
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(SORT_LABELS) as SortType[]).map((key) => (
                  <DropdownMenuItem key={key} onClick={() => setSort(key)}>
                    {SORT_LABELS[key]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Add Website</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={counts.total} icon={Globe} iconClass="bg-emerald-100 text-emerald-600" />
          <StatCard
            label="Up"
            value={counts.up}
            valueClass="text-emerald-600"
            icon={TrendingUp}
            iconClass="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            label="Down"
            value={counts.down}
            valueClass="text-red-600"
            icon={AlertTriangle}
            iconClass="bg-red-100 text-red-600"
          />
          <StatCard
            label="Avg Response (24h)"
            value={formatMs(counts.avgResponse)}
            icon={Clock}
            iconClass="bg-blue-100 text-blue-600"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Website Status</CardTitle>
            <CardDescription className="text-xs">Status, observed 24h uptime and response time for each website</CardDescription>
          </CardHeader>
          <CardContent>
            {websites === null ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : websites.length === 0 ? (
              <div className="text-center py-10">
                <Globe className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900">No websites yet</p>
                <p className="text-sm text-gray-500 mb-4">Add your first website to start monitoring it.</p>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Website
                </Button>
              </div>
            ) : visible.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No websites match your search.</p>
            ) : (
              <div className="space-y-2">
                {visible.map((website) => {
                  const status = STATUS_STYLES[website.status]
                  return (
                    <div
                      key={website.id}
                      className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-100/50 cursor-pointer transition-all hover:shadow-sm"
                      onClick={() => router.push(`/website/${website.id}`)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{website.name}</p>
                          <p className="text-xs text-gray-500 truncate">{website.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge
                          variant={website.status === "DOWN" ? "destructive" : website.status === "UP" ? "default" : "secondary"}
                          className="text-xs h-5 px-2 hidden sm:inline-flex"
                        >
                          {status.label}
                        </Badge>
                        <span className="text-xs text-gray-600 w-16 text-right hidden md:inline" title="Observed 24h uptime">
                          {formatUptime(website.uptime24h)}
                        </span>
                        <span className="text-xs text-gray-600 w-14 text-right hidden md:inline" title="Avg response (24h)">
                          {formatMs(website.avgResponseTime24h)}
                        </span>
                        <span className="text-xs text-gray-400 w-24 text-right hidden lg:inline">
                          {timeAgo(website.lastCheckedAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPendingDelete(website)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WebsiteFormDialog open={addOpen} onOpenChange={setAddOpen} onSaved={load} />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Monitoring stops and the website is removed from your dashboard.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
