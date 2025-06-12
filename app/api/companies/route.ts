import { NextResponse } from "next/server"
import { mockCompanies } from "@/data/companies"

export async function GET() {
  // Simular una pequeña latencia para que parezca una API real
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json({
    success: true,
    data: {
      companies: mockCompanies,
    },
  })
}
