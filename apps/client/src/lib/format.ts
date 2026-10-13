import { formatDistanceToNowStrict } from "date-fns"
import type { CheckStatus } from "@/lib/api"

export const formatUptime = (value: number | null | undefined) =>
  value == null ? "-" : `${value >= 99.995 ? "100" : value.toFixed(2)}%`

export const formatMs = (value: number | null | undefined) => (value == null ? "-" : `${value}ms`)

export const timeAgo = (iso: string | null | undefined) =>
  iso ? `${formatDistanceToNowStrict(new Date(iso))} ago` : "Never"

export const formatInterval = (seconds: number) =>
  seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds}s`

export const STATUS_STYLES: Record<CheckStatus, { label: string; dot: string; text: string }> = {
  UP: { label: "Up", dot: "bg-emerald-500", text: "text-emerald-600" },
  DOWN: { label: "Down", dot: "bg-red-500", text: "text-red-600" },
  UNKNOWN: { label: "Pending", dot: "bg-gray-300", text: "text-gray-500" },
}

export const INTERVAL_OPTIONS = [30, 60, 120, 300, 600, 1800, 3600]
