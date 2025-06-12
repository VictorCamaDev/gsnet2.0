"use client"

import { motion } from "framer-motion"
import { Loader2, CheckCircle, LogOut } from 'lucide-react'
import { useCompanyTheme } from "@/contexts/company-theme-context"

interface LogoutScreenProps {
  companyName?: string
  userName?: string
}

export function LogoutScreen({ companyName, userName }: LogoutScreenProps) {
  const { theme } = useCompanyTheme()

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: theme?.backgroundImageUrl
          ? `url(${theme.backgroundImageUrl}) center/cover no-repeat`
          : `linear-gradient(to bottom right, ${theme?.backgroundColor || "#f8fafc"}, ${theme?.backgroundColor + "90" || "#f1f5f9"})`,
      }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-lg shadow-xl border-0 p-8 text-center"
          style={{
            backgroundColor: theme?.backgroundColor || "white",
            borderLeft: `4px solid ${theme?.accentColor || "#3b82f6"}`,
          }}
        >
          {/* Icono animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div
              className="h-16 w-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme?.accentColor + "15" || "#3b82f615" }}
            >
              <LogOut className="h-8 w-8" style={{ color: theme?.accentColor || "#3b82f6" }} />
            </div>
          </motion.div>

          {/* Mensaje principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme?.primaryColor || "#0f172a" }}>
              Cerrando sesión
            </h2>
            <p className="text-sm mb-6" style={{ color: theme?.secondaryColor || "#64748b" }}>
              {userName ? `Hasta pronto, ${userName}` : "Finalizando tu sesión"}
              {companyName && (
                <>
                  <br />
                  <span className="text-xs">de {companyName}</span>
                </>
              )}
            </p>
          </motion.div>

          {/* Loader animado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-3"
          >
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: theme?.accentColor || "#3b82f6" }} />
            <span className="text-sm" style={{ color: theme?.secondaryColor || "#64748b" }}>
              Limpiando datos de sesión...
            </span>
          </motion.div>

          {/* Puntos de progreso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center space-x-2 mt-6"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 1 + index * 0.2,
                  duration: 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 0.6,
                }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: theme?.accentColor || "#3b82f6" }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
