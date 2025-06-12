"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Company, CompanyTheme } from "@/types/company"

interface CompanyThemeContextType {
  company: Company | null
  theme: CompanyTheme | null
  isLoading: boolean
  setCompany: (company: Company) => void
}

const defaultTheme: CompanyTheme = {
  primaryColor: "#0f172a", // slate-900
  secondaryColor: "#64748b", // slate-500
  accentColor: "#3b82f6", // blue-500
  backgroundColor: "#f8fafc", // slate-50
  textColor: "#0f172a", // slate-900
  logoUrl: "/placeholder.svg?height=40&width=40",
}

const CompanyThemeContext = createContext<CompanyThemeContextType>({
  company: null,
  theme: defaultTheme,
  isLoading: true,
  setCompany: () => {},
})

export function CompanyThemeProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompanyState] = useState<Company | null>(null)
  const [theme, setTheme] = useState<CompanyTheme | null>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedCompany = sessionStorage.getItem("selected_company")
    if (storedCompany) {
      try {
        const parsedCompany = JSON.parse(storedCompany)
        setCompanyState(parsedCompany)
        setTheme(parsedCompany.theme || defaultTheme)
      } catch (error) {
        console.error("Error parsing stored company:", error)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (theme) {
      document.documentElement.style.setProperty("--primary-color", theme.primaryColor)
      document.documentElement.style.setProperty("--secondary-color", theme.secondaryColor)
      document.documentElement.style.setProperty("--accent-color", theme.accentColor)
      document.documentElement.style.setProperty("--background-color", theme.backgroundColor)
      document.documentElement.style.setProperty("--text-color", theme.textColor)

      if (theme.fontFamily) {
        document.documentElement.style.setProperty("--font-family", theme.fontFamily)
      }

      if (theme.backgroundImageUrl) {
        document.body.style.backgroundImage = `url(${theme.backgroundImageUrl})`
        document.body.style.backgroundSize = "cover"
        document.body.style.backgroundPosition = "center"
        document.body.style.backgroundAttachment = "fixed"
      } else {
        document.body.style.backgroundImage = "url(/backgrounds/background.jpg)"
        document.body.style.backgroundSize = "cover"
        document.body.style.backgroundPosition = "center"
        document.body.style.backgroundAttachment = "fixed"
      }
    }
  }, [theme])

  const setCompany = (selectedCompany: Company) => {
    setIsLoading(true);
    if (selectedCompany.theme) {
      setCompanyState(selectedCompany);
      setTheme(selectedCompany.theme);
      sessionStorage.setItem("selected_company", JSON.stringify(selectedCompany));
    } else {
      const companyWithDefaultTheme = {
        ...selectedCompany,
        theme: defaultTheme,
      };
      setCompanyState(companyWithDefaultTheme);
      setTheme(defaultTheme);
      sessionStorage.setItem("selected_company", JSON.stringify(companyWithDefaultTheme));
    }
    setIsLoading(false);
  }

  return (
    <CompanyThemeContext.Provider value={{ company, theme, isLoading, setCompany }}>
      {children}
    </CompanyThemeContext.Provider>
  )
}

export const useCompanyTheme = () => useContext(CompanyThemeContext)
