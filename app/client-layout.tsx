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

import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className={inter.className}>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#111827',
            color: '#fff',
            fontSize: '1rem',
            boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
            padding: '18px 24px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#0f5132',
              color: '#d1fae5',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#991b1b',
              color: '#fee2e2',
            },
          },
        }}
      />
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
