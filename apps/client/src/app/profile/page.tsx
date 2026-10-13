"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/contexts/AuthProvider"
import { getErrorMessage, profileApi } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuth()
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    setName(user?.name ?? "")
    setCompany(user?.company ?? "")
  }, [user])

  const dirty = name.trim() !== (user?.name ?? "") || company.trim() !== (user?.company ?? "")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      setUser(await profileApi.update({ name: name.trim(), company: company.trim() || null }))
      setMessage({ type: "success", text: "Profile updated." })
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.replace("/signin")
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-0.5">Manage your account</p>
      </div>

      <Card className="border-gray-200 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
          <CardDescription>Your name and company appear on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input id="email" value={user?.email ?? ""} disabled className="border-gray-200 bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company <span className="text-gray-400">(optional)</span>
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>{message.text}</p>
            )}
            <Button
              type="submit"
              disabled={saving || !dirty || !name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-200 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Session</CardTitle>
          <CardDescription>Sign out of Upbot on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  )
}
