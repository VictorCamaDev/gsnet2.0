"use client";

import type React from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/msalConfig";
import { CompanyThemeProvider } from "@/contexts/company-theme-context";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <MsalProvider instance={msalInstance}>
          <CompanyThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </CompanyThemeProvider>
        </MsalProvider>
      </ThemeProvider>
    </body>
  );
}
