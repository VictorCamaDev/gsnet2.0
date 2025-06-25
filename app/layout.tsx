import type React from "react";
import type { Metadata } from "next";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "GSNET - Grupo Silvestre Intranet",
  description: "Plataforma interna para empleados",
  generator: "victor.cama",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logos/gslogo.png" type="image/png" />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}

