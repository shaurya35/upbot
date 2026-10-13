"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { FullPageSpinner } from "@/components/app-shell"
import { useAuth } from "@/contexts/AuthProvider"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) router.replace(user ? "/dashboard" : "/signin")
  }, [loading, user, router])

  return <FullPageSpinner />
}
