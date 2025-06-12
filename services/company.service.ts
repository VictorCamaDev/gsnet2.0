import { ApiService } from "./api.service"
import type { Company } from "@/types/company"

export class CompanyService {
  private apiService: ApiService

  constructor() {
    this.apiService = new ApiService()
  }

  /**
   * Obtiene todas las empresas disponibles
   * En producción, esto vendría de tu API real
   */
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await this.apiService.get<{ companies: Company[] }>("/companies")

      if (response.success && response.data?.companies) {
        return response.data.companies
      }

      return []
    } catch (error) {
      console.error("Error fetching companies:", error)
      return []
    }
  }

  /**
   * Obtiene una empresa específica por ID
   * En producción, esto vendría de tu API real
   */
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

  /**
   * Obtiene el tema/configuración visual de una empresa y su información de base de datos
   * LISTO PARA API REAL - Solo cambia la URL del endpoint
   */
  async getCompanyTheme(id: string): Promise<Company | null> {
    try {
      // 🚀 AQUÍ ES DONDE CONECTARÍAS CON TU API REAL
      // Ejemplo: const response = await this.apiService.get<{ company: Company }>(`/api/companies/${id}/theme`)

      const response = await this.apiService.get<{ company: Company }>(`/companies/${id}/theme`)

      if (response.success && response.data?.company) {
        // Aquí tu API debería devolver tanto el tema como la información de la base de datos
        // {
        //   company: {
        //     id: "1",
        //     name: "Empresa",
        //     theme: { ... },
        //     databaseInfo: {
        //       name: "NOMBRE_DB",
        //       server: "servidor.db",
        //       type: "postgres",
        //       status: "online"
        //     }
        //   }
        // }

        return response.data.company
      }

      return null
    } catch (error) {
      console.error(`Error fetching company theme for id ${id}:`, error)
      return null
    }
  }

  /**
   * Actualiza el tema de una empresa (para administradores)
   * LISTO PARA API REAL
   */
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
