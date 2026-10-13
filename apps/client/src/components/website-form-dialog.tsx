"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getErrorMessage, websiteApi, type Website } from "@/lib/api"
import { formatInterval, INTERVAL_OPTIONS } from "@/lib/format"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  website?: Pick<Website, "id" | "name" | "url" | "monitorInterval">
  onSaved: () => void
}

export function WebsiteFormDialog({ open, onOpenChange, website, onSaved }: Props) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [monitorInterval, setMonitorInterval] = useState(60)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(website?.name ?? "")
      setUrl(website?.url ?? "")
      setMonitorInterval(website?.monitorInterval ?? 60)
      setError(null)
    }
  }, [open, website])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = { name: name.trim(), url: url.trim(), monitorInterval }
      if (website) await websiteApi.update(website.id, body)
      else await websiteApi.create(body)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{website ? "Edit Website" : "Add New Website"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="website-name" className="text-sm font-medium">
                Website Name
              </Label>
              <Input
                id="website-name"
                placeholder="e.g., Marketing site"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website-url" className="text-sm font-medium">
                Website URL
              </Label>
              <Input
                id="website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Check every</Label>
              <Select value={String(monitorInterval)} onValueChange={(value) => setMonitorInterval(Number(value))}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map((seconds) => (
                    <SelectItem key={seconds} value={String(seconds)}>
                      {formatInterval(seconds)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !url.trim() || saving}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {saving ? "Saving..." : website ? "Save Changes" : "Add Website"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
