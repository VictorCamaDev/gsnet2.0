"use client"

import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useCompanyTheme } from "@/contexts/company-theme-context"
import { Button } from "@/components/ui/button"

interface LogoutSuccessProps {
  companyName?: string
  onContinue: () => void
}

export function LogoutSuccess({ companyName, onContinue }: LogoutSuccessProps) {
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
            borderLeft: `4px solid #22c55e`,
          }}
        >
          {/* Icono de éxito */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          </motion.div>

          {/* Mensaje de éxito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: theme?.primaryColor || "#0f172a" }}>
              ¡Sesión cerrada exitosamente!
            </h2>
            <p className="text-sm mb-6" style={{ color: theme?.secondaryColor || "#64748b" }}>
              Has cerrado sesión de forma segura
              {companyName && (
                <>
                  <br />
                  <span className="text-xs">de {companyName}</span>
                </>
              )}
            </p>
          </motion.div>

          {/* Botón de continuar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={onContinue}
              className="w-full h-11 text-white font-medium"
              style={{ backgroundColor: theme?.accentColor || "#3b82f6" }}
            >
              Iniciar nueva sesión
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Mensaje de seguridad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <p className="text-xs" style={{ color: theme?.secondaryColor || "#64748b" }}>
              Todos tus datos han sido limpiados de forma segura
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
