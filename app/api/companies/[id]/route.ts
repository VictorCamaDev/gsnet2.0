import { NextResponse } from "next/server"
import { mockCompanies } from "@/data/companies"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Simular una pequeña latencia para que parezca una API real
  await new Promise((resolve) => setTimeout(resolve, 200))

  const company = mockCompanies.find((c) => c.id === params.id)

  if (!company) {
    return NextResponse.json({ success: false, error: "Empresa no encontrada" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      company,
    },
  })
}
