"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export function SidebarProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar:state")
    setOpen(saved !== null ? saved === "true" : false)
    setIsInitialized(true)
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    localStorage.setItem("sidebar:state", String(newOpen))
  }

  if (!isInitialized) {
    return null
  }

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      {children}
    </SidebarProvider>
  )
}
