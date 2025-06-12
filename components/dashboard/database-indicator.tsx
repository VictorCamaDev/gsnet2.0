"use client"

import { useCompanyTheme } from "@/contexts/company-theme-context"
import { Database, Server, ChevronDown, Circle } from "lucide-react"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export function DatabaseIndicator() {
  const { company, theme } = useCompanyTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Si no hay información de base de datos, no mostramos nada
  if (!company?.databaseName && !company?.databaseInfo?.name) {
    return null
  }

  const dbName = company?.databaseInfo?.name || company?.databaseName || "DB"
  const dbType = company?.databaseInfo?.type || "other"
  const dbStatus = company?.databaseInfo?.status || "online"
  const dbServer = company?.databaseInfo?.server || "Server"

  // Colores según el estado de la base de datos
  const getStatusColor = () => {
    switch (dbStatus) {
      case "online":
        return "text-green-500"
      case "offline":
        return "text-red-500"
      case "maintenance":
        return "text-amber-500"
      default:
        return "text-slate-400"
    }
  }

  // Icono según el tipo de base de datos
  const getDbIcon = () => {
    return <Database className="h-4 w-4 mr-1.5" />
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center space-x-1 rounded-full bg-white px-3 py-1.5 shadow-md border transition-all hover:shadow-lg"
                  style={{
                    borderColor: theme?.secondaryColor + "40" || "#e2e8f0",
                    backgroundColor: theme?.backgroundColor || "white",
                  }}
                >
                  <div className="flex items-center">
                    {getDbIcon()}
                    <span className="text-sm font-medium mr-1" style={{ color: theme?.primaryColor || "#0f172a" }}>
                      {dbName}
                    </span>
                    <Circle className={`h-2 w-2 ${getStatusColor()}`} fill="currentColor" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Información de Base de Datos</h3>
                    <Badge
                      variant={
                        dbStatus === "online" ? "default" : dbStatus === "maintenance" ? "outline" : "destructive"
                      }
                      className="capitalize"
                    >
                      {dbStatus}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Nombre:</span>
                      <span className="text-sm font-medium">{dbName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Tipo:</span>
                      <span className="text-sm font-medium capitalize">{dbType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Servidor:</span>
                      <div className="flex items-center">
                        <Server className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        <span className="text-sm font-medium">{dbServer}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Empresa:</span>
                      <span className="text-sm font-medium">{company?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t p-3 bg-slate-50 rounded-b-lg">
                  <div className="text-xs text-slate-500">
                    Esta información se carga automáticamente desde la configuración de la empresa.
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Base de datos actual</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
