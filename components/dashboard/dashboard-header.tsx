"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Settings, LogOut, User, Menu, MapPin, BadgeIcon as IdCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCompanyTheme } from "@/contexts/company-theme-context"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const { company, theme } = useCompanyTheme()
  const { user } = useAuth()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const router = useRouter()

  const handleMenuClick = () => {
    console.log("Menu clicked") // Debug
    onMobileMenuToggle()
  }

  const handleLogout = () => {
    router.push("/logout")
  }

  const userInfoHeaderStyle = {
    backgroundColor: theme?.primaryColor || "#16a34a",
    color: "white",
  }

  return (
    <>
      {/* Header de navegación (cleaned up, no user info bar) */}
      <header
        className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4"
        style={{
          backgroundColor: theme?.backgroundColor || "white",
          borderColor: theme?.secondaryColor + "20" || "#e2e8f0",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Contenedor para menú, logo y búsqueda. El logo se centra en móvil */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 relative w-full">

            {/* Botón de menú móvil integrado en el header */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 p-0 hover:bg-slate-100"
              onClick={handleMenuClick}
              style={{ color: theme?.primaryColor }}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo siempre visible, centrado en móvil, a la izquierda en escritorio */}
            <div className="flex-1 flex justify-center sm:justify-start">
              {company?.logo && (
                <img
                  src={company.logo || "/placeholder.svg"}
                  alt={company.name}
                  className="h-14 w-auto sm:h-14 flex-shrink-0"
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Búsqueda - Desktop */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                className="pl-10 w-48 xl:w-64"
                style={{
                  borderColor: theme?.secondaryColor + "30" || "#e2e8f0",
                  backgroundColor: theme?.backgroundColor || "white",
                }}
              />
            </div>

            {/* Bloque resumen usuario, solo visible en md+ */}
            <div
              className="hidden md:flex items-center gap-4 text-sm text-slate-700"
              style={{ width: "auto" }}
            >
              <span>{user?.nombres}</span>
              <span className="text-slate-400">|</span>
              <span>Usuario: {user?.loginUsuario || user?.codigoUsuario}</span>
              <span className="text-slate-400">|</span>
              <span>Doc: {user?.nroDocumento}</span>
            </div>

            {/* Búsqueda - Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 p-0 hover:bg-slate-100"
              style={{ color: theme?.secondaryColor || "#64748b" }}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>

            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"/placeholder.svg?height=32&width=32"} alt="Usuario" />
                      <AvatarFallback className="text-xs">
                        {user?.nombres
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-auto p-3 rounded-xl shadow-lg border border-slate-100"
                  align="end"
                  forceMount
                  style={{
                    backgroundColor: theme?.backgroundColor || "white",
                    borderColor: theme?.secondaryColor + "30" || "#e2e8f0",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt="Usuario" />
                      <AvatarFallback className="text-sm">
                        {user?.nombres?.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 truncate">{user?.correo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Cod. Usuario: {user?.idUsuario}
                    </span>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-100">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"/placeholder.svg?height=32&width=32"} alt="Usuario" />
                      <AvatarFallback className="text-xs">
                        {user?.nombres
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-auto p-3 rounded-xl shadow-lg border border-slate-100"
                  align="end"
                  forceMount
                  style={{
                    backgroundColor: theme?.backgroundColor || "white",
                    borderColor: theme?.secondaryColor + "30" || "#e2e8f0",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={"/placeholder.svg?height=40&width=40"} alt="Usuario" />
                      <AvatarFallback className="text-sm">
                        {user?.nombres?.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 truncate">{user?.correo}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      Cod. Usuario: {user?.idUsuario}
                    </span>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Búsqueda móvil expandida */}
        {showMobileSearch && (
          <div className="mt-3 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar..."
                className="pl-10 w-full"
                style={{
                  borderColor: theme?.secondaryColor + "30" || "#e2e8f0",
                  backgroundColor: theme?.backgroundColor || "white",
                }}
                autoFocus
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}
