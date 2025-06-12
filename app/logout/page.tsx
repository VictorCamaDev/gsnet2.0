"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCompanyTheme } from "@/contexts/company-theme-context"
import { LogoutScreen } from "@/components/auth/logout-screen"
import { LogoutSuccess } from "@/components/auth/logout-success"

type LogoutState = "processing" | "success" | "error"

export default function LogoutPage() {
  const [logoutState, setLogoutState] = useState<LogoutState>("processing")
  const { user, logout } = useAuth()
  const { company } = useCompanyTheme()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        await logout()
        setLogoutState("success")

        setTimeout(() => {
          router.push("/")
        }, 3000)
      } catch (error) {
        console.error("Error during logout:", error)
        setLogoutState("error")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    }

    performLogout()
  }, [logout, router])

  const handleContinue = () => {
    router.push("/")
  }

  if (logoutState === "success") {
    return <LogoutSuccess companyName={company?.name} onContinue={handleContinue} />
  }

  return <LogoutScreen companyName={company?.name} userName={user?.nombres} />
}
