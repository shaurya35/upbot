"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppShell } from "@/components/app-shell"
import { useAuth } from "@/contexts/AuthProvider"
import { alertApi, getErrorMessage, type AlertChannel, type AlertType } from "@/lib/api"

const CHANNEL_TYPES: { type: AlertType; label: string; field: "webhookUrl" | "email" | "phone"; placeholder: string }[] = [
  { type: "DISCORD", label: "Discord", field: "webhookUrl", placeholder: "https://discord.com/api/webhooks/..." },
  { type: "SLACK", label: "Slack", field: "webhookUrl", placeholder: "https://hooks.slack.com/services/..." },
  { type: "WEBHOOK", label: "Webhook", field: "webhookUrl", placeholder: "https://example.com/upbot-webhook" },
  { type: "TELEGRAM", label: "Telegram", field: "webhookUrl", placeholder: "https://api.telegram.org/bot.../sendMessage?chat_id=..." },
  { type: "EMAIL", label: "Email", field: "email", placeholder: "alerts@example.com" },
  { type: "SMS", label: "SMS", field: "phone", placeholder: "+1 555 123 4567" },
]

const channelTarget = (channel: AlertChannel) => channel.webhookUrl ?? channel.email ?? channel.phone ?? ""

export default function IntegrationsPage() {
  const { user } = useAuth()
  const [channels, setChannels] = useState<AlertChannel[] | null>(null)
  const [type, setType] = useState<AlertType>("DISCORD")
  const [target, setTarget] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setChannels(await alertApi.list())
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  const config = CHANNEL_TYPES.find((option) => option.type === type)!

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await alertApi.create({ type, [config.field]: target.trim() })
      setTarget("")
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await alertApi.remove(id)
      setChannels((prev) => prev?.filter((channel) => channel.id !== id) ?? null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-600 mt-0.5">Where Upbot should send alerts when a website goes down</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Alert delivery is not implemented yet. Channels you add here are saved and will be used once incident
        detection ships.
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Add Alert Channel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="space-y-2 sm:w-40">
              <Label className="text-sm font-medium">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as AlertType)
                  setTarget("")
                }}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_TYPES.map((option) => (
                    <SelectItem key={option.type} value={option.type}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="channel-target" className="text-sm font-medium">
                {config.field === "webhookUrl" ? "Webhook URL" : config.field === "email" ? "Email" : "Phone number"}
              </Label>
              <Input
                id="channel-target"
                type={config.field === "email" ? "email" : config.field === "webhookUrl" ? "url" : "tel"}
                placeholder={config.placeholder}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <Button type="submit" disabled={saving || !target.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1" />
              {saving ? "Adding..." : "Add"}
            </Button>
          </form>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Alert Channels</CardTitle>
          <CardDescription className="text-xs">Channels connected to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {channels === null ? (
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ) : channels.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No alert channels yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="text-xs">
                      {CHANNEL_TYPES.find((option) => option.type === channel.type)?.label ?? channel.type}
                    </Badge>
                    <span className="text-sm text-gray-700 truncate">{channelTarget(channel)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                    onClick={() => handleRemove(channel.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
