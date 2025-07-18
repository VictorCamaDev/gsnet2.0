"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Building, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoginForm } from "@/components/auth/login-form"
import { mockCompanies } from "@/data/companies"
import { useCompanyTheme } from "@/contexts/company-theme-context"
import type { Company } from "@/types/company"

export function CompanySelector() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const { setCompany } = useCompanyTheme()

  // Filtrar empresas basado en el término de búsqueda
  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setCompany(company) // Actualizar el tema de la empresa en el contexto
  }

  const handleBackToCompanies = () => {
    setSelectedCompany(null)
  }
  console.log("Cargaron las compañias:", companies)

  return (
    <AnimatePresence mode="wait">
      {!selectedCompany ? (
        <motion.div
          key="company-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-xl border-0 mx-4 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">Selecciona tu empresa</h2>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar empresa..."
                  className="pl-10 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <motion.div
                      key={company.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectCompany(company)}
                      style={{
                        borderColor: company.theme?.accentColor + "40", // Color de acento con opacidad
                        borderLeftWidth: "3px",
                        borderLeftColor: company.theme?.accentColor,
                      }}
                    >
                      <div
                        className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-md flex items-center justify-center mr-3"
                        style={{ backgroundColor: company.theme?.backgroundColor || "#f1f5f9" }}
                      >
                        {company.logo ? (
                          <img
                            src={company.logo || "/placeholder.svg"}
                            alt={company.name}
                            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                          />
                        ) : (
                          <Building className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: company.theme?.primaryColor }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: company.theme?.primaryColor }}>
                          {company.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{company.domain}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">No se encontraron empresas</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={
            {
              // Aplicar colores del tema de la empresa seleccionada
              "--card-bg": selectedCompany.theme?.backgroundColor || "#ffffff",
              "--card-text": selectedCompany.theme?.textColor || "#0f172a",
            } as React.CSSProperties
          }
        >
          <Card
            className="shadow-xl border-0 mx-4 sm:mx-0"
            style={{
              backgroundColor: "var(--card-bg)",
              color: "var(--card-text)",
              borderLeft: `4px solid ${selectedCompany.theme?.accentColor || "#3b82f6"}`,
            }}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center mb-6">
                <button
                  onClick={handleBackToCompanies}
                  className="flex items-center text-xs sm:text-sm hover:text-slate-900 transition-colors"
                  style={{ color: selectedCompany.theme?.secondaryColor }}
                >
                  <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                    <ChevronRight className="h-4 w-4 transform rotate-180 mr-1" />
                  </motion.div>
                  <span className="hidden sm:inline">Cambiar empresa</span>
                  <span className="sm:hidden">Cambiar</span>
                </button>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center">
                    <div
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-md flex items-center justify-center mr-2"
                      style={{ backgroundColor: selectedCompany.theme?.backgroundColor || "#f1f5f9" }}
                    >
                      {selectedCompany.logo ? (
                        <img
                          src={selectedCompany.logo || "/placeholder.svg"}
                          alt={selectedCompany.name}
                          className="h-4 w-4 sm:h-6 sm:w-6 object-contain"
                        />
                      ) : (
                        <Building
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          style={{ color: selectedCompany.theme?.primaryColor }}
                        />
                      )}
                    </div>
                    <span
                      className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none"
                      style={{ color: selectedCompany.theme?.primaryColor }}
                    >
                      {selectedCompany.name}
                    </span>
                  </div>
                </div>
                <div className="w-[40px] sm:w-[60px]"></div> {/* Espacio para equilibrar el diseño */}
              </div>

              <LoginForm company={selectedCompany} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
