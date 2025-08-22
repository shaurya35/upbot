"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  AlertTriangle,
  Globe,
  Users,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
import { useRouter } from "next/navigation"

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
  },
]

type FilterType = "down-first" | "up-first" | "a-z" | "newest-first"

function AppSidebar() {
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  const handleNavigation = (path: string) => {
    router.push(path)
    // Close sidebar on mobile after navigation
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
                  isActive={true}
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

export default function DashboardPage() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [websites, setWebsites] = useState(websitesData)
  const [filter, setFilter] = useState<FilterType>("down-first")
  const [isLoading, setIsLoading] = useState(false)
  const [addWebsiteOpen, setAddWebsiteOpen] = useState(false)
  const [newWebsiteName, setNewWebsiteName] = useState("")
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const router = useRouter()

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
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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
    router.push(`/website/${website.id}`)
  }

  const handleAddWebsite = async () => {
    if (!newWebsiteName.trim() || !newWebsiteUrl.trim()) return

    setIsAddingWebsite(true)

    // Simulate API call
    setTimeout(() => {
      const newWebsite = {
        id: String(Date.now()),
        name: newWebsiteName.trim(),
        url: newWebsiteUrl.trim(),
        status: "online" as const,
        uptime: "100%",
        responseTime: "0ms",
        createdAt: new Date().toISOString().split("T")[0],
        lastChecked: "Just now",
      }

      setWebsites((prev) => [newWebsite, ...prev])
      setNewWebsiteName("")
      setNewWebsiteUrl("")
      setAddWebsiteOpen(false)
      setIsAddingWebsite(false)
    }, 1000)
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AppSidebar />

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
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs"
                    onClick={() => setAddWebsiteOpen(true)}
                  >
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
                              <p className="text-xs text-gray-500 truncate">{website.url}</p>
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
          </main>
        </SidebarInset>
      </div>

      {/* Add Website Modal */}
      <Dialog open={addWebsiteOpen} onOpenChange={setAddWebsiteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add New Website</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="website-name" className="text-sm font-medium">
                Website Name
              </Label>
              <Input
                id="website-name"
                placeholder="e.g., example.com"
                value={newWebsiteName}
                onChange={(e) => setNewWebsiteName(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website-url" className="text-sm font-medium">
                Website URL
              </Label>
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddWebsiteOpen(false)
                setNewWebsiteName("")
                setNewWebsiteUrl("")
              }}
              disabled={isAddingWebsite}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWebsite}
              disabled={!newWebsiteName.trim() || !newWebsiteUrl.trim() || isAddingWebsite}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isAddingWebsite ? "Adding..." : "Add Website"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        router.push("/dashboard")
                        setSearchOpen(false)
                      }}
                    >
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Websites</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/incidents")
                        setSearchOpen(false)
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Incidents</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/team")
                        setSearchOpen(false)
                      }}
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">Go to Team</span>
                    </div>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/integrations")
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
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setAddWebsiteOpen(true)
                        setSearchOpen(false)
                      }}
                    >
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
