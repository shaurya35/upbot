"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Activity, ChevronDown, Globe, LogOut, Settings, User, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthProvider"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Websites", icon: Globe, matches: ["/dashboard", "/website"] },
  { href: "/integrations", label: "Integrations", icon: Zap, matches: ["/integrations"] },
  { href: "/profile", label: "Settings", icon: Settings, matches: ["/profile"] },
]

function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { user, logout } = useAuth()

  const navigate = (path: string) => {
    router.push(path)
    setOpenMobile(false)
  }

  const handleSignOut = async () => {
    await logout()
    router.replace("/signin")
  }

  return (
    <Sidebar className="border-r border-gray-200/60">
      <SidebarHeader className="border-b border-gray-200/60 p-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
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
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.href)}
                    isActive={item.matches.some((prefix) => pathname.startsWith(prefix))}
                    className="w-full justify-start gap-2 h-9 px-3 text-sm font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                    <div className="text-xs font-medium text-gray-900 truncate">{user?.name || "Account"}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs" onClick={() => navigate("/profile")}>
                  <Settings className="w-3 h-3 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs" onClick={handleSignOut}>
                  <LogOut className="w-3 h-3 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function AppShell({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin")
    }
  }, [loading, user, router])

  if (loading || !user) {
    return <FullPageSpinner />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-3 border-b border-gray-200/60 bg-white px-4">
            <SidebarTrigger className="text-gray-500" />
            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">{header}</div>
          </header>
          <main className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto overflow-x-hidden">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
