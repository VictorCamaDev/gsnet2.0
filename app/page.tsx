"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import { CompanySelector } from "@/components/auth/company-selector"
import { useCompanyTheme } from "@/contexts/company-theme-context"

export default function HomePage() {
  const { theme } = useCompanyTheme()
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: theme?.backgroundImageUrl
            ? `url(${theme.backgroundImageUrl}) center/cover no-repeat`
            : `linear-gradient(to bottom right, ${theme?.backgroundColor || "#f8fafc"}, ${theme?.backgroundColor + "90" || "#f1f5f9"})`,
        }}
      >
        <Image
          src="/logos/gsi-logo.svg"
          alt="Logo Grupo Silvestre"
          width={120}
          height={120}
          className="mb-6 rounded-xl shadow-2xl animate-fade-in"
          priority
        />
        <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-sm text-gray-500">Cargando plataforma...</span>
      </div>
    );
  }


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
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Image
            src="/logos/gsi-logo.svg"
            alt="Logo Grupo Silvestre"
            width={240}
            height={240}
            className="mb-4"
            priority
          />
        </div>

        <CompanySelector />

        <div
          className="text-center mt-4 sm:mt-6 text-xs sm:text-sm"
          style={{ color: theme?.secondaryColor || "#64748b" }}
        >
          <p>© 2025 Grupo Silvestre Perú. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
