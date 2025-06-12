"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react"
import { sidebarMenu, type MenuItem } from "@/data/sidebar-menu"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useCompanyTheme } from "@/contexts/company-theme-context"

interface DashboardSidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

export function DashboardSidebar({ isMobileOpen, onMobileClose }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const { company, theme } = useCompanyTheme()

  // Debug
  useEffect(() => {
    console.log("Sidebar isMobileOpen:", isMobileOpen)
  }, [isMobileOpen])

  // Cerrar sidebar móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobileOpen) {
      onMobileClose()
    }
  }, [pathname])

  // Detectar tamaño de pantalla para auto-colapsar en tablets
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleClose = () => {
    console.log("Closing sidebar") // Debug
    onMobileClose()
  }

  // Animaciones para elementos del menú
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  }

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

    return (
      <li key={item.id} className="group/menu-item relative">
        {hasSubmenu ? (
          <Collapsible open={openSubmenus[item.id]} onOpenChange={() => toggleSubmenu(item.id)} className="w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start mb-1 h-10 sm:h-9", isCollapsed ? "px-2" : "px-3 sm:px-4")}
                style={{
                  backgroundColor: isActive ? theme?.accentColor + "15" || "#f1f5f9" : "transparent",
                  color: isActive ? theme?.primaryColor : theme?.secondaryColor,
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left text-sm sm:text-base">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-2 text-xs"
                        style={{
                          backgroundColor: theme?.accentColor + "20",
                          color: theme?.accentColor,
                        }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform flex-shrink-0",
                        openSubmenus[item.id] ? "transform rotate-180" : "",
                      )}
                    />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            {!isCollapsed && (
              <CollapsibleContent>
                <ul className="pl-6 sm:pl-9 space-y-1 mt-1">
                  {item.submenu?.map((subItem, subIndex) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <motion.li
                        key={subItem.id}
                        custom={subIndex}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start h-8 text-sm"
                          style={{
                            backgroundColor: isSubActive ? theme?.accentColor + "15" || "#f1f5f9" : "transparent",
                            color: isSubActive ? theme?.primaryColor : theme?.secondaryColor,
                          }}
                          asChild
                        >
                          <Link href={subItem.href}>
                            <subItem.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="ml-2 truncate">{subItem.label}</span>
                          </Link>
                        </Button>
                      </motion.li>
                    )
                  })}
                </ul>
              </CollapsibleContent>
            )}
          </Collapsible>
        ) : (
          <motion.div custom={index} variants={itemVariants} initial="hidden" animate="visible">
            <Button
              variant="ghost"
              className={cn("w-full justify-start h-10 sm:h-9", isCollapsed ? "px-2" : "px-3 sm:px-4")}
              style={{
                backgroundColor: isActive ? theme?.accentColor + "15" || "#f1f5f9" : "transparent",
                color: isActive ? theme?.primaryColor : theme?.secondaryColor,
              }}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 text-sm sm:text-base truncate">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs flex-shrink-0"
                        style={{
                          backgroundColor: theme?.accentColor + "20",
                          color: theme?.accentColor,
                        }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            </Button>
          </motion.div>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={handleClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "border-r transition-all duration-300 ease-in-out h-screen flex-shrink-0",
          "fixed lg:relative z-50 lg:z-auto",
          isCollapsed ? "w-16" : "w-64 sm:w-72",
          // Cambio importante: usar transform para la animación
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{
          backgroundColor: theme?.backgroundColor || "white",
          borderColor: theme?.secondaryColor + "20" || "#e2e8f0",
        }}
      >
        <div className="p-3 sm:p-4 flex justify-between items-center">
          {/* Botón cerrar móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 p-0 hover:bg-slate-100"
            onClick={handleClose}
            style={{ color: theme?.secondaryColor }}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Botón colapsar desktop */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="hidden lg:block ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-slate-100 h-9 w-9 p-0"
              style={{ color: theme?.secondaryColor }}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>

        <nav className="px-2 pb-4 overflow-y-auto flex-1">
          <AnimatePresence>
            <ul className="space-y-1">{sidebarMenu.map((item, index) => renderMenuItem(item, index))}</ul>
          </AnimatePresence>
        </nav>
      </aside>
    </>
  )
}
