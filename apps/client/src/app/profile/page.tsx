"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  User,
  Settings,
  CreditCard,
  Bell,
  Mail,
  Smartphone,
  Webhook,
  Plus,
  Check,
  Crown,
  Download,
  Edit,
  Trash2,
  Eye,
  Users,
  UserPlus,
  Shield,
  X,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"

const billingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    features: ["Up to 1 website", "10-minute checks", "Email alerts", "7-day history"],
    current: true,
  },
  {
    name: "Starter",
    price: "$9",
    period: "month",
    features: ["Up to 5 websites", "5-minute checks", "Email alerts", "30-day history"],
    current: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    features: [
      "Up to 25 websites",
      "1-minute checks",
      "Email & SMS alerts",
      "90-day history",
      "Status pages",
      "API access",
    ],
    current: false,
  },
  {
    name: "Agency",
    price: "$99",
    period: "month",
    features: [
      "Unlimited websites",
      "30-second checks",
      "All alert types",
      "1-year history",
      "Custom status pages",
      "Priority support",
      "White-label options",
    ],
    current: false,
  },
]

const invoices = [
  {
    id: "INV-2024-001",
    date: "Jan 15, 2024",
    amount: "$0.00",
    status: "paid",
    plan: "Free",
  },
  {
    id: "INV-2023-012",
    date: "Dec 15, 2023",
    amount: "$0.00",
    status: "paid",
    plan: "Free",
  },
  {
    id: "INV-2023-011",
    date: "Nov 15, 2023",
    amount: "$0.00",
    status: "paid",
    plan: "Free",
  },
  {
    id: "INV-2023-010",
    date: "Oct 15, 2023",
    amount: "$0.00",
    status: "paid",
    plan: "Free",
  },
]

const alertChannels = [
  {
    id: 1,
    type: "email",
    name: "Primary Email",
    value: "john@example.com",
    enabled: true,
    verified: true,
  },
  {
    id: 2,
    type: "email",
    name: "Work Email",
    value: "john.doe@company.com",
    enabled: true,
    verified: true,
  },
  {
    id: 3,
    type: "sms",
    name: "Mobile Phone",
    value: "+1 (555) 123-4567",
    enabled: true,
    verified: true,
  },
  {
    id: 4,
    type: "webhook",
    name: "Slack Integration",
    value: "https://hooks.slack.com/services/...",
    enabled: false,
    verified: true,
  },
]

const websites = [
  { id: "1", name: "example.com", url: "https://example.com" },
  { id: "2", name: "api.example.com", url: "https://api.example.com" },
  { id: "3", name: "blog.example.com", url: "https://blog.example.com" },
  { id: "4", name: "shop.example.com", url: "https://shop.example.com" },
]

const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Owner",
    avatar: "JD",
    status: "active",
    joinedAt: "2024-01-01",
    websites: ["1", "2", "3", "4"], // All websites
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "Admin",
    avatar: "SW",
    status: "active",
    joinedAt: "2024-01-15",
    websites: ["1", "2"], // Only example.com and api.example.com
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@example.com",
    role: "Member",
    avatar: "MC",
    status: "pending",
    joinedAt: "2024-02-01",
    websites: ["3"], // Only blog.example.com
  },
]

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [newChannelOpen, setNewChannelOpen] = useState(false)
  const [newChannelType, setNewChannelType] = useState("")
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [inviteWebsites, setInviteWebsites] = useState<string[]>([])
  const [isInviting, setIsInviting] = useState(false)
  const [members, setMembers] = useState(teamMembers)

  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc",
    timezone: "America/New_York",
    avatar: "JD",
  })

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["profile", "billing", "alerts", "settings", "team"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleProfileSave = () => {
    setIsEditing(false)
    // In a real app, you'd save to your backend here
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || inviteWebsites.length === 0) return

    setIsInviting(true)
    // Simulate API call
    setTimeout(() => {
      const newMember = {
        id: Date.now(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.substring(0, 2).toUpperCase(),
        status: "pending" as const,
        joinedAt: new Date().toISOString().split("T")[0],
        websites: inviteWebsites,
      }
      setMembers((prev) => [...prev, newMember])
      setInviteEmail("")
      setInviteRole("member")
      setInviteWebsites([])
      setInviteMemberOpen(false)
      setIsInviting(false)
    }, 1000)
  }

  const handleUpdateMemberWebsites = (memberId: number, websiteIds: string[]) => {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, websites: websiteIds } : member)))
  }

  const handleRemoveMember = (memberId: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId))
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <Smartphone className="w-4 h-4" />
      case "webhook":
        return <Webhook className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getChannelColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-100 text-blue-700"
      case "sms":
        return "bg-green-100 text-green-700"
      case "webhook":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "admin":
        return <Shield className="w-4 h-4 text-emerald-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getWebsitesByIds = (websiteIds: string[]) => {
    return websites.filter((website) => websiteIds.includes(website.id))
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-600">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === "profile"
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("billing")}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === "billing"
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing & Plans
                  </button>
                  <button
                    onClick={() => setActiveTab("alerts")}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === "alerts"
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    Alert Channels
                  </button>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === "team"
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Team
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === "settings"
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                      <CardDescription>Update your personal information and preferences</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                      onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700">
                        {profileData.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                        <p className="text-sm text-gray-600">{profileData.email}</p>
                        <p className="text-sm text-gray-500">{profileData.company}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={profileData.timezone}
                          onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Account Security</CardTitle>
                    <CardDescription>Manage your password and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Current Plan</CardTitle>
                    <CardDescription>You're currently on the Free plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-emerald-900">Free Plan</p>
                          <p className="text-sm text-emerald-700">$0/month • No expiration</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                        Current
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Available Plans</CardTitle>
                    <CardDescription>Choose the plan that best fits your monitoring needs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {billingPlans.map((plan, index) => (
                        <div
                          key={index}
                          className={`relative p-4 rounded-lg border-2 transition-colors ${
                            plan.current ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {plan.current && (
                            <Badge className="absolute -top-2 left-4 bg-emerald-500">Current Plan</Badge>
                          )}
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                            <div className="mt-2">
                              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                              <span className="text-gray-600">/{plan.period}</span>
                            </div>
                          </div>
                          <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto">
                            <Button
                              className="w-full"
                              variant={plan.current ? "outline" : "default"}
                              disabled={plan.current}
                            >
                              {plan.current ? "Current Plan" : "Upgrade"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Billing History</CardTitle>
                    <CardDescription>Download your invoices and view payment history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invoices.map((invoice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{invoice.id}</p>
                              <p className="text-sm text-gray-600">
                                {invoice.date} • {invoice.plan}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{invoice.amount}</p>
                              <Badge variant="default" className="text-xs">
                                {invoice.status}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Alert Channels Tab */}
            {activeTab === "alerts" && (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Alert Channels</CardTitle>
                      <CardDescription>Configure how you want to receive notifications</CardDescription>
                    </div>
                    <Dialog open={newChannelOpen} onOpenChange={setNewChannelOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-500 hover:bg-emerald-600">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Channel
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Alert Channel</DialogTitle>
                          <DialogDescription>Choose how you want to receive notifications</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Channel Type</Label>
                            <Select value={newChannelType} onValueChange={setNewChannelType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select channel type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="webhook">Webhook</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newChannelType === "email" && (
                            <div className="space-y-2">
                              <Label>Email Address</Label>
                              <Input placeholder="Enter email address" />
                            </div>
                          )}
                          {newChannelType === "sms" && (
                            <div className="space-y-2">
                              <Label>Phone Number</Label>
                              <Input placeholder="Enter phone number" />
                            </div>
                          )}
                          {newChannelType === "webhook" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <Input placeholder="https://your-webhook-url.com" />
                              </div>
                              <div className="space-y-2">
                                <Label>Custom Headers (Optional)</Label>
                                <Textarea placeholder="Authorization: Bearer token" />
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setNewChannelOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setNewChannelOpen(false)}>Add Channel</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alertChannels.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${getChannelColor(channel.type)}`}
                            >
                              {getChannelIcon(channel.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{channel.name}</p>
                                {channel.verified && (
                                  <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{channel.value}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={channel.enabled} />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Alert Channel</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this alert channel? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                    <CardDescription>Choose when and how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Website Down Alerts</p>
                        <p className="text-sm text-gray-600">Get notified immediately when a website goes down</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Website Recovery Alerts</p>
                        <p className="text-sm text-gray-600">Get notified when a website comes back online</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Weekly Reports</p>
                        <p className="text-sm text-gray-600">Receive weekly uptime summary reports</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Maintenance Reminders</p>
                        <p className="text-sm text-gray-600">Get reminded about scheduled maintenance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
                      <CardDescription>Manage team access to specific websites</CardDescription>
                    </div>
                    <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-500 hover:bg-emerald-600">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>Send an invitation to join your team</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="invite-email">Email Address</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="Enter email address"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                              {inviteRole === "admin"
                                ? "Can manage websites, team members, and billing"
                                : "Can view assigned websites and receive notifications"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Website Access</Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {websites.map((website) => (
                                <div key={website.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`website-${website.id}`}
                                    checked={inviteWebsites.includes(website.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setInviteWebsites([...inviteWebsites, website.id])
                                      } else {
                                        setInviteWebsites(inviteWebsites.filter((id) => id !== website.id))
                                      }
                                    }}
                                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <label htmlFor={`website-${website.id}`} className="text-sm text-gray-700">
                                    {website.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">Select which websites this member can access</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setInviteMemberOpen(false)
                              setInviteEmail("")
                              setInviteRole("member")
                              setInviteWebsites([])
                            }}
                            disabled={isInviting}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleInviteMember}
                            disabled={!inviteEmail.trim() || inviteWebsites.length === 0 || isInviting}
                            className="bg-emerald-500 hover:bg-emerald-600"
                          >
                            {isInviting ? "Sending..." : "Send Invitation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-700">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{member.name}</p>
                                {member.status === "pending" && (
                                  <Badge variant="outline" className="text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  Access to:{" "}
                                  {getWebsitesByIds(member.websites)
                                    .map((w) => w.name)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getRoleIcon(member.role)}
                              <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            {member.role !== "Owner" && (
                              <>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <div className="p-2">
                                      <p className="text-xs font-medium text-gray-500 mb-2">Website Access</p>
                                      <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {websites.map((website) => (
                                          <div key={website.id} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`member-${member.id}-website-${website.id}`}
                                              checked={member.websites.includes(website.id)}
                                              onChange={(e) => {
                                                const newWebsites = e.target.checked
                                                  ? [...member.websites, website.id]
                                                  : member.websites.filter((id) => id !== website.id)
                                                handleUpdateMemberWebsites(member.id, newWebsites)
                                              }}
                                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <label
                                              htmlFor={`member-${member.id}-website-${website.id}`}
                                              className="text-xs text-gray-700"
                                            >
                                              {website.name}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove {member.name} from your team? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() => handleRemoveMember(member.id)}
                                      >
                                        Remove Member
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Team Permissions</CardTitle>
                    <CardDescription>Understand what each role can do</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            <h4 className="font-medium text-yellow-900">Owner</h4>
                          </div>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Full access to everything</li>
                            <li>• Manage billing and plans</li>
                            <li>• Delete team and data</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <h4 className="font-medium text-emerald-900">Admin</h4>
                          </div>
                          <ul className="text-sm text-emerald-800 space-y-1">
                            <li>• Manage websites</li>
                            <li>• Invite/remove members</li>
                            <li>• Configure alerts</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900">Member</h4>
                          </div>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• View assigned websites</li>
                            <li>• Receive notifications</li>
                            <li>• View incidents</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
                    <CardDescription>Configure your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email updates about your account</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Receive updates about new features and tips</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Data Export</p>
                        <p className="text-sm text-gray-600">Download all your monitoring data</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-700">Danger Zone</CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-700">Delete Account</p>
                        <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove all
                              your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                              Yes, delete my account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
