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
  Zap,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
                  isActive={true}
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

export default function IntegrationsPage() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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
                  <CardDescription className="text-xs">Connect your monitoring with external services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Zap className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Integration options coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                autoFocus
              />
            </div>

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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
