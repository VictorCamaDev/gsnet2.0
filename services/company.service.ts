import { ApiService } from "./api.service"
import type { Company } from "@/types/company"

export class CompanyService {
  private apiService: ApiService

  constructor() {
    this.apiService = new ApiService()
  }

  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.apiService.post<{ companies: Company[] }>("/auth/obtenerEmpresas")

      if (response.success && response.data?.companies) {
        return response.data.companies
      }

      return []
    } catch (error) {
      console.error("Error fetching companies:", error)
      return []
    }
  }

  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const response = await this.apiService.get<{ company: Company }>(`/companies/${id}`)

      if (response.success && response.data?.company) {
        return response.data.company
      }

      return null
    } catch (error) {
      console.error(`Error fetching company with id ${id}:`, error)
      return null
    }
  }

  async getCompanyTheme(id: string): Promise<Company | null> {
    try {
      const response = await this.apiService.get<{ company: Company }>(`/companies/${id}/theme`)

      if (response.success && response.data?.company) {

        return response.data.company
      }

      return null
    } catch (error) {
      console.error(`Error fetching company theme for id ${id}:`, error)
      return null
    }
  }

  async updateCompanyTheme(id: string, theme: Company["theme"]): Promise<boolean> {
    try {
      const response = await this.apiService.put<{ success: boolean }>(`/companies/${id}/theme`, { theme })

      return response.success || false
    } catch (error) {
      console.error(`Error updating company theme for id ${id}:`, error)
      return false
    }
  }
}
