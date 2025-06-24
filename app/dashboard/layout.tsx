"use client"

import type React from "react"
import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DatabaseIndicator } from "@/components/dashboard/database-indicator"



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen company-bg">
      <DashboardHeader onMobileMenuToggle={handleMobileMenuToggle} />
      <div className="flex">
        <DashboardSidebar isMobileOpen={isMobileMenuOpen} onMobileClose={handleMobileMenuClose} />
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <div className="max-w-full overflow-x-auto">{children}</div>
        </main>
      </div>
      {/* <DatabaseIndicator /> */}
    </div>
  )
}
