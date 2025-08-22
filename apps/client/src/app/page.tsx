"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  Globe,
  Settings,
  Plus,
  Search,
  Bell,
  User,
  ChevronDown,
  Monitor,
  TrendingUp,
  Clock,
  Zap,
  Trash2,
  Filter,
  Command,
  ArrowLeft,
  CheckCircle,
  XCircle,
  BarChart3,
  MapPin,
  LogOut,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRouter } from "next/navigation"

// Mock data for detailed analysis
const generateResponseTimeData = (days = 1) => {
  const data = []
  const now = new Date()
  const hours = days === 1 ? 24 : days * 24
  const interval = days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 1 hour for 24h, 1 day for 7d

  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval)
    const label =
      days === 1
        ? time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
        : time.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    data.push({
      time: label,
      responseTime: Math.floor(Math.random() * 200) + 150,
      timestamp: time.getTime(),
    })
  }
  return data
}

const generateUptimeData = () => {
  const data = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    // 90 data points for finer resolution
    const time = new Date(now.getTime() - i * 16 * 60 * 1000) // 16-minute intervals
    const status = Math.random() > 0.05 ? "up" : "down" // 95% uptime
    data.push({
      time: time.getTime(),
      status,
      timeString: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    })
  }
  return data
}

const monitoringRegions = [
  { name: "US East", location: "New York", status: "active", responseTime: "12ms", flag: "🇺🇸" },
  { name: "US West", location: "San Francisco", status: "active", responseTime: "8ms", flag: "🇺🇸" },
  { name: "Europe", location: "London", status: "active", responseTime: "45ms", flag: "🇬🇧" },
  { name: "Asia", location: "Singapore", status: "active", responseTime: "78ms", flag: "🇸🇬" },
  { name: "Australia", location: "Sydney", status: "active", responseTime: "92ms", flag: "🇦🇺" },
]

const notificationUsers = [
  { name: "John Doe", avatar: "JD", email: "john@example.com" },
  { name: "Sarah Wilson", avatar: "SW", email: "sarah@example.com" },
  { name: "Mike Chen", avatar: "MC", email: "mike@example.com" },
  { name: "Emma Davis", avatar: "ED", email: "emma@example.com" },
]

const websitesData = [
  {
    name: "example.com",
    status: "online",
    uptime: "99.9%",
    responseTime: "245ms",
    createdAt: "2024-01-15",
    url: "https://example.com",
    lastChecked: "2 minutes ago",
    avgResponseTime: 245,
    minResponseTime: 180,
    maxResponseTime: 320,
    uptime7d: 99.8,
    uptime30d: 99.5,
    incidents7d: 0,
    incidents30d: 1,
  },
  {
    name: "api.example.com",
    status: "online",
    uptime: "99.8%",
    responseTime: "180ms",
    createdAt: "2024-01-10",
    url: "https://api.example.com",
    lastChecked: "1 minute ago",
    avgResponseTime: 180,
    minResponseTime: 150,
    maxResponseTime: 250,
    uptime7d: 99.9,
    uptime30d: 99.7,
    incidents7d: 0,
    incidents30d: 0,
  },
  {
    name: "blog.example.com",
    status: "offline",
    uptime: "98.2%",
    responseTime: "N/A",
    createdAt: "2024-01-20",
    url: "https://blog.example.com",
    lastChecked: "5 minutes ago",
    avgResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    uptime7d: 95.2,
    uptime30d: 98.1,
    incidents7d: 2,
    incidents30d: 3,
  },
  {
    name: "shop.example.com",
    status: "online",
    uptime: "99.9%",
    responseTime: "320ms",
    createdAt: "2024-01-05",
    url: "https://shop.example.com",
    lastChecked: "3 minutes ago",
    avgResponseTime: 320,
    minResponseTime: 280,
    maxResponseTime: 400,
    uptime7d: 99.9,
    uptime30d: 99.8,
    incidents7d: 0,
    incidents30d: 0,
  },
]

const incidents = [
  {
    title: "API Gateway Timeout",
    status: "resolved",
    time: "2 hours ago",
    severity: "high",
    website: "api.example.com",
  },
  {
    title: "Database Connection Issues",
    status: "investigating",
    time: "30 minutes ago",
    severity: "critical",
    website: "blog.example.com",
  },
  {
    title: "CDN Performance Degradation",
    status: "monitoring",
    time: "1 hour ago",
    severity: "medium",
    website: "example.com",
  },
  { title: "Server Maintenance", status: "resolved", time: "1 day ago", severity: "low", website: "blog.example.com" },
]

type FilterType = "down-first" | "up-first" | "a-z" | "newest-first"

function UptimeDashboard() {
  const [activePanel, setActivePanel] = useState("websites")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [websites, setWebsites] = useState(websitesData)
  const [filter, setFilter] = useState<FilterType>("down-first")
  const [selectedWebsite, setSelectedWebsite] = useState<(typeof websitesData)[0] | null>(null)
  const [responseTimeView, setResponseTimeView] = useState<"24h" | "7d">("24h")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard by default
    router.push("/dashboard")
  }, [router])

  // Error handling for the ethereum property issue
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("ethereum")) {
        event.preventDefault()
        console.warn("Ethereum property conflict detected and handled")
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape" && selectedWebsite) {
        setSelectedWebsite(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedWebsite])

  // Filter websites based on selected filter
  useEffect(() => {
    const filtered = [...websitesData]

    switch (filter) {
      case "down-first":
        filtered.sort((a, b) => {
          if (a.status === "offline" && b.status === "online") return -1
          if (a.status === "online" && b.status === "offline") return 1
          return 0
        })
        break
      case "up-first":
        filtered.sort((a, b) => {
          if (a.status === "online" && b.status === "offline") return -1
          if (a.status === "offline" && b.status === "online") return 1
          return 0
        })
        break
      case "a-z":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest-first":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setWebsites(filtered)
  }, [filter])

  const handleDeleteWebsite = (websiteName: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setWebsites((prev) => prev.filter((site) => site.name !== websiteName))
      setIsLoading(false)
    }, 500)
  }

  const handleWebsiteClick = (website: (typeof websitesData)[0]) => {
    setSelectedWebsite(website)
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  const filteredSearchResults = websites.filter((site) => site.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "down-first":
        return "Down First"
      case "up-first":
        return "Up First"
      case "a-z":
        return "A-Z"
      case "newest-first":
        return "Newest First"
    }
  }

  const responseTimeData = generateResponseTimeData(responseTimeView === "24h" ? 1 : 7)
  const uptimeData = generateUptimeData()
  const websiteIncidents = selectedWebsite ? incidents.filter((inc) => inc.website === selectedWebsite.name) : []

  // Detailed Website Analysis View
  if (selectedWebsite) {
    return (
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-gray-50/50">
            <Sidebar className="border-r border-gray-200/60">
              <SidebarHeader className="border-b border-gray-200/60 p-4">
                <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={handleGoHome}>
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm hover:text-emerald-600 transition-colors">
                    Upbot
                  </span>
                </div>
              </SidebarHeader>

              <SidebarContent className="p-3">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => {
                            setActivePanel("websites")
                            setSelectedWebsite(null)
                          }}
                          isActive={activePanel === "websites"}
                          className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Websites</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => {
                            setActivePanel("incidents")
                            setSelectedWebsite(null)
                          }}
                          isActive={activePanel === "incidents"}
                          className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Incidents</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => {
                            setActivePanel("integrations")
                            setSelectedWebsite(null)
                          }}
                          isActive={activePanel === "integrations"}
                          className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Integrations</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-gray-200/60 p-3">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-start gap-2 h-9 px-3">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">John Doe</div>
                            <div className="text-xs text-gray-500 truncate">john@example.com</div>
                          </div>
                          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-2">
                        <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">John Doe</div>
                            <div className="text-xs text-gray-500 truncate">john@example.com</div>
                            <div className="text-xs text-emerald-600 font-medium">Free Plan</div>
                          </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-sm p-2" onClick={() => (window.location.href = "/profile")}>
                          <User className="w-4 h-4 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium">Profile</div>
                            <div className="text-xs text-gray-500">Manage your account</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm p-2"
                          onClick={() => (window.location.href = "/profile?tab=billing")}
                        >
                          <CreditCard className="w-4 h-4 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium">Billing</div>
                            <div className="text-xs text-gray-500">Plans and invoices</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm p-2"
                          onClick={() => (window.location.href = "/profile?tab=settings")}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium">Settings</div>
                            <div className="text-xs text-gray-500">Account preferences</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-sm p-2 text-red-600 focus:text-red-600">
                          <LogOut className="w-4 h-4 mr-3" />
                          <div className="font-medium">Sign out</div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="flex-1 overflow-hidden">
              <header className="flex h-14 items-center justify-between border-b border-gray-200/60 bg-white px-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-gray-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 h-8 px-2 gap-1"
                    onClick={() => setSelectedWebsite(null)}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="text-xs">Back to Websites</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${selectedWebsite.status === "online" ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <h1 className="text-lg font-semibold text-gray-900">{selectedWebsite.name}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs bg-transparent">
                    <Settings className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Configure</span>
                  </Button>
                </div>
              </header>

              <main className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto overflow-x-hidden">
                {/* Status Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Current Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            {selectedWebsite.status === "online" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <p className="text-sm font-semibold capitalize">{selectedWebsite.status}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Last Checked</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{selectedWebsite.lastChecked}</p>
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">7-Day Uptime</p>
                          <p className="text-sm font-semibold text-emerald-600 mt-1">{selectedWebsite.uptime7d}%</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">30-Day Uptime</p>
                          <p className="text-sm font-semibold text-emerald-600 mt-1">{selectedWebsite.uptime30d}%</p>
                        </div>
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 24-Hour Status Timeline */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3">
                      <div>
                        <CardTitle className="text-lg font-semibold">24-Hour Status Overview</CardTitle>
                        <CardDescription className="text-sm">
                          Real-time monitoring with detailed insights
                        </CardDescription>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Uptime</p>
                          <p className="text-sm font-semibold text-emerald-600">99.2%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Incidents</p>
                          <p className="text-sm font-semibold text-red-600">2</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Response</p>
                          <p className="text-sm font-semibold text-blue-600">245ms</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[600px] flex items-center gap-1">
                          {uptimeData.map((point, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-12 flex-1 min-w-[6px] rounded-sm cursor-pointer transition-all hover:opacity-80 hover:scale-y-110 ${
                                    point.status === "up" ? "bg-emerald-500" : "bg-red-500"
                                  }`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {point.timeString}: {point.status === "up" ? "Online" : "Offline"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>24 hours ago</span>
                        <span className="text-emerald-600 font-medium">● Live</span>
                        <span>Now</span>
                      </div>
                      <div className="flex justify-center md:hidden">
                        <p className="text-xs text-gray-500">← Scroll horizontally to view full timeline →</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Width Response Time Chart */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold">Response Time</CardTitle>
                        <CardDescription className="text-xs">
                          Average response time over the selected period
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant={responseTimeView === "24h" ? "default" : "outline"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setResponseTimeView("24h")}
                        >
                          24h
                        </Button>
                        <Button
                          variant={responseTimeView === "7d" ? "default" : "outline"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setResponseTimeView("7d")}
                        >
                          7d
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[600px] lg:min-w-full">
                        <ChartContainer
                          config={{
                            responseTime: {
                              label: "Response Time (ms)",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[200px] sm:h-[250px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={responseTimeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                              <XAxis
                                dataKey="time"
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                              />
                              <YAxis
                                fontSize={9}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}ms`}
                              />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                                formatter={(value) => [`${value}ms`, "Response Time"]}
                              />
                              <Line
                                type="monotone"
                                dataKey="responseTime"
                                stroke="var(--color-responseTime)"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                    <div className="flex justify-center mt-2 lg:hidden">
                      <p className="text-xs text-gray-500">← Scroll horizontally to view full chart →</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Global Monitoring Regions */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Global Monitoring Network
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Monitoring from {monitoringRegions.length} locations worldwide
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-x-auto">
                      <div className="flex gap-3 min-w-max sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-4">
                        {monitoringRegions.map((region, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all min-w-[120px] sm:min-w-0"
                          >
                            <div className="text-2xl mb-2">{region.flag}</div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-900">{region.name}</p>
                              <p className="text-xs text-gray-600 mb-2">{region.location}</p>
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-xs font-medium text-gray-700">{region.responseTime}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center mt-2 sm:hidden">
                      <p className="text-xs text-gray-500">← Scroll to view all regions →</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Time Stats, Incidents, and Notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Response Time Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Average</span>
                        <span className="text-sm font-semibold">{selectedWebsite.avgResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Minimum</span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {selectedWebsite.minResponseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Maximum</span>
                        <span className="text-sm font-semibold text-red-600">{selectedWebsite.maxResponseTime}ms</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Incidents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Last 7 days</span>
                        <Badge
                          variant={selectedWebsite.incidents7d === 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {selectedWebsite.incidents7d}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Last 30 days</span>
                        <Badge
                          variant={selectedWebsite.incidents30d === 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {selectedWebsite.incidents30d}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                      <CardDescription className="text-xs">People to be notified</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {notificationUsers.map((user, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-medium text-emerald-700 cursor-pointer hover:bg-emerald-200 transition-colors">
                                {user.avatar}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 rounded-full border-dashed bg-transparent hover:bg-emerald-50"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Incidents */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Recent Incidents</CardTitle>
                    <CardDescription className="text-xs">Incidents related to {selectedWebsite.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {websiteIncidents.length > 0 ? (
                      <div className="space-y-2">
                        {websiteIncidents.map((incident, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  incident.severity === "critical"
                                    ? "bg-red-500"
                                    : incident.severity === "high"
                                      ? "bg-orange-500"
                                      : "bg-yellow-500"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
                                <p className="text-xs text-gray-500">{incident.time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant={
                                  incident.status === "resolved"
                                    ? "default"
                                    : incident.status === "investigating"
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="text-xs h-5 px-2 hidden sm:inline-flex"
                              >
                                {incident.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs h-5 px-2 hidden md:inline-flex">
                                {incident.severity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No recent incidents</p>
                        <p className="text-xs text-gray-500 mt-1">This website has been running smoothly</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    )
  }

  // Main Dashboard View
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <Sidebar className="border-r border-gray-200/60">
          <SidebarHeader className="border-b border-gray-200/60 p-4">
            <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={handleGoHome}>
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <Activity className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm hover:text-emerald-600 transition-colors">
                Upbot
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActivePanel("websites")}
                      isActive={activePanel === "websites"}
                      className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Websites</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActivePanel("incidents")}
                      isActive={activePanel === "incidents"}
                      className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Incidents</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActivePanel("integrations")}
                      isActive={activePanel === "integrations"}
                      className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Integrations</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200/60 p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full justify-start gap-2 h-9 px-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">John Doe</div>
                        <div className="text-xs text-gray-500 truncate">john@example.com</div>
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">John Doe</div>
                        <div className="text-xs text-gray-500 truncate">john@example.com</div>
                        <div className="text-xs text-emerald-600 font-medium">Free Plan</div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm p-2" onClick={() => (window.location.href = "/profile")}>
                      <User className="w-4 h-4 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Profile</div>
                        <div className="text-xs text-gray-500">Manage your account</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-sm p-2"
                      onClick={() => (window.location.href = "/profile?tab=billing")}
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Billing</div>
                        <div className="text-xs text-gray-500">Plans and invoices</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-sm p-2"
                      onClick={() => (window.location.href = "/profile?tab=settings")}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-gray-500">Account preferences</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-sm p-2 text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-3" />
                      <div className="font-medium">Sign out</div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-gray-200/60 bg-white px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-gray-500" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8 px-2 gap-1 hidden sm:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-3 h-3" />
                <span className="text-xs">Search</span>
                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                  <Command className="w-2 h-2" />K
                </kbd>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0 sm:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto overflow-x-hidden">
            {activePanel === "websites" && (
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
                          <span className="hidden sm:inline">{getFilterLabel(filter)}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilter("down-first")}>Down First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter("up-first")}>Up First</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter("a-z")}>A-Z</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter("newest-first")}>Newest First</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Add Website</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Total</p>
                          <p className="text-xl font-bold text-gray-900">{websites.length}</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Online</p>
                          <p className="text-xl font-bold text-emerald-600">
                            {websites.filter((w) => w.status === "online").length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Offline</p>
                          <p className="text-xl font-bold text-red-600">
                            {websites.filter((w) => w.status === "offline").length}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Avg Response</p>
                          <p className="text-xl font-bold text-gray-900">248ms</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Website Status</CardTitle>
                    <CardDescription className="text-xs">Monitor the status of all your websites</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-1"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-5 w-16 bg-gray-300 rounded"></div>
                                <div className="h-7 w-7 bg-gray-300 rounded"></div>
                                <div className="h-7 w-7 bg-gray-300 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {websites.map((website, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-100/50 cursor-pointer transition-all hover:shadow-sm"
                            onClick={() => handleWebsiteClick(website)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${website.status === "online" ? "bg-emerald-500" : "bg-red-500"}`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{website.name}</p>
                                <p className="text-xs text-gray-500">Uptime: {website.uptime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant={website.status === "online" ? "default" : "destructive"}
                                className="text-xs h-5 px-2 hidden sm:inline-flex"
                              >
                                {website.status}
                              </Badge>
                              <span className="text-xs text-gray-600 min-w-[60px] hidden md:inline">
                                {website.responseTime}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700 h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleWebsiteClick(website)
                                }}
                              >
                                <Monitor className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteWebsite(website.name)
                                }}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activePanel === "incidents" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Incidents</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Track and manage service incidents</p>
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Create Incident</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Recent Incidents</CardTitle>
                    <CardDescription className="text-xs">Latest incidents and their current status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {incidents.map((incident, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                incident.severity === "critical"
                                  ? "bg-red-500"
                                  : incident.severity === "high"
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
                              <p className="text-xs text-gray-500">{incident.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant={
                                incident.status === "resolved"
                                  ? "default"
                                  : incident.status === "investigating"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-xs h-5 px-2 hidden sm:inline-flex"
                            >
                              {incident.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs h-5 px-2 hidden md:inline-flex">
                              {incident.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activePanel === "integrations" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
                    <p className="text-sm text-gray-600 mt-0.5">Connect with your favorite tools and services</p>
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Add Integration</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Available Integrations</CardTitle>
                    <CardDescription className="text-xs">
                      Connect your monitoring with external services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Zap className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Integration options coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Search Command Palette */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-sm font-medium">Search</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search websites, incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {searchQuery && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 px-2">Websites</p>
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((website, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        handleWebsiteClick(website)
                        setSearchOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${website.status === "online" ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{website.name}</p>
                        <p className="text-xs text-gray-500">
                          {website.status} • {website.uptime}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 px-2">No websites found</p>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 px-2 mb-2">Navigation</p>
                  <div className="space-y-1">
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setActivePanel("websites")
                        setSearchOpen(false)
                      }}
                    >
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Websites</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setActivePanel("incidents")
                        setSearchOpen(false)
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Incidents</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setActivePanel("integrations")
                        setSearchOpen(false)
                      }}
                    >
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Integrations</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        window.location.href = "/profile"
                        setSearchOpen(false)
                      }}
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Profile</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 px-2 mb-2">Quick Actions</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-gray-900">Add New Website</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard by default
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
