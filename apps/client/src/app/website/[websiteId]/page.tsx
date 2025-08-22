"use client"

import { useState } from "react"
import {
  Activity,
  ArrowLeft,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  MapPin,
  Plus,
  AlertTriangle,
  Globe,
  Users,
  User,
  ChevronDown,
  Zap,
  Power,
  PowerOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRouter, useParams } from "next/navigation"

// Mock data for detailed analysis
const generateResponseTimeData = (days = 1) => {
  const data = []
  const now = new Date()
  const points = days === 1 ? 24 : 7
  const interval = days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

  for (let i = points - 1; i >= 0; i--) {
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
    const time = new Date(now.getTime() - i * 16 * 60 * 1000)
    const status = Math.random() > 0.05 ? "up" : "down"
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
    id: "1",
    name: "example.com",
    url: "https://example.com",
    status: "online",
    uptime: "99.9%",
    responseTime: "245ms",
    createdAt: "2024-01-15",
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
    id: "2",
    name: "api.example.com",
    url: "https://api.example.com",
    status: "online",
    uptime: "99.8%",
    responseTime: "180ms",
    createdAt: "2024-01-10",
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
    id: "3",
    name: "blog.example.com",
    url: "https://blog.example.com",
    status: "offline",
    uptime: "98.2%",
    responseTime: "N/A",
    createdAt: "2024-01-20",
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
    id: "4",
    name: "shop.example.com",
    url: "https://shop.example.com",
    status: "online",
    uptime: "99.9%",
    responseTime: "320ms",
    createdAt: "2024-01-05",
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

function AppSidebar() {
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const handleNavigation = (path: string) => {
    router.push(path)
    setOpenMobile(false)
  }

  return (
    <Sidebar className="border-r border-gray-200/60">
      <SidebarHeader className="border-b border-gray-200/60 p-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation("/dashboard")}>
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Activity className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm hover:text-emerald-600 transition-colors">Upbot</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/dashboard")}
                  className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>Websites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/incidents")}
                  className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Incidents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/team")}
                  className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigation("/integrations")}
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs" onClick={() => (window.location.href = "/profile")}>
                  <Settings className="w-3 h-3 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={() => (window.location.href = "/profile")}>
                  <User className="w-3 h-3 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function WebsiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [responseTimeView, setResponseTimeView] = useState<"24h" | "7d">("24h")
  const [globalMonitoringEnabled, setGlobalMonitoringEnabled] = useState(true)

  const websiteId = params.websiteId as string
  const selectedWebsite = websitesData.find((w) => w.id === websiteId)

  if (!selectedWebsite) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600 mb-4">The website you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const responseTimeData = generateResponseTimeData(responseTimeView === "24h" ? 1 : 7)
  const uptimeData = generateUptimeData()
  const websiteIncidents = incidents.filter((inc) => inc.website === selectedWebsite.name)

  const handleUpgradeClick = () => {
    router.push("/profile?tab=billing")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50/50">
          <AppSidebar />

          <SidebarInset className="flex-1 overflow-hidden">
            <header className="flex h-14 items-center justify-between border-b border-gray-200/60 bg-white px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-gray-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 h-8 px-2 gap-1"
                  onClick={() => router.push("/dashboard")}
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
                      <CardDescription className="text-sm">Real-time monitoring with detailed insights</CardDescription>
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
                                className={`h-12 flex-1 min-w-[6px] rounded-sm cursor-pointer transition-opacity hover:opacity-80 ${
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Global Monitoring Network
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Monitoring from {monitoringRegions.length} locations worldwide
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{globalMonitoringEnabled ? "Enabled" : "Disabled"}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs ${
                          globalMonitoringEnabled
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                        onClick={() => setGlobalMonitoringEnabled(!globalMonitoringEnabled)}
                      >
                        {globalMonitoringEnabled ? (
                          <Power className="w-3 h-3 mr-1" />
                        ) : (
                          <PowerOff className="w-3 h-3 mr-1" />
                        )}
                        {globalMonitoringEnabled ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {globalMonitoringEnabled ? (
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
                      <div className="flex justify-center mt-2 sm:hidden">
                        <p className="text-xs text-gray-500">← Scroll to view all regions →</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Monitoring Disabled</h3>
                      <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                        Upgrade to Pro or Agency plan to monitor your websites from multiple global locations for better
                        reliability and performance insights.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          onClick={handleUpgradeClick}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                        >
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          className="px-6 bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  )}
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
