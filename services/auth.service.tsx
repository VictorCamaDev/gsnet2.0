import { ApiService } from "./api.service"
import type { User } from "@/types/user"

export interface LoginResult {
  success: boolean
  user?: User
  error?: string
}

export class AuthService {
  private apiService: ApiService

  constructor() {
    this.apiService = new ApiService()
  }

  async loginWithCredentials(usuario: string, password: string): Promise<LoginResult> {
    try {
      const response = await this.apiService.post<{ success: boolean; user?: User; token?: string; refreshToken?: string; error?: string }>(
        "/auth/login",
        { usuario, password }
      )

      if (!response.success || !response.data?.user || !response.data?.token) {
        return {
          success: false,
          error: response.data?.error || "Credenciales incorrectas",
        }
      }

      sessionStorage.setItem("auth_token", response.data.token)
      sessionStorage.setItem("current_user", JSON.stringify(response.data.user))
      if (response.data.refreshToken) {
        sessionStorage.setItem("refresh_token", response.data.refreshToken)
      }
      
      return {
        success: true,
        user: response.data.user,
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  async loginWithMicrosoft(msToken: string, email: string): Promise<LoginResult> {
    try {
      const response = await this.apiService.post<{ success: boolean; user?: User; token?: string; refreshToken?: string; error?: string }>(
        "/auth/microsoft",
        { msToken, email }
      )

      if (!response.success || !response.data?.user || !response.data?.token) {
        return {
          success: false,
          error: response.data?.error || "Error autenticando con Microsoft",
        }
      }

      sessionStorage.setItem("auth_token", response.data.token)
      sessionStorage.setItem("current_user", JSON.stringify(response.data.user))
      if (response.data.refreshToken) {
        sessionStorage.setItem("refresh_token", response.data.refreshToken)
      }

      return {
        success: true,
        user: response.data.user,
      }
    } catch (error) {
      console.error("Microsoft login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error de autenticación con Microsoft",
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = sessionStorage.getItem("auth_token")
      if (!token) {
        return null
      }

      const storedUser = sessionStorage.getItem("current_user")
      if (storedUser) {
        return JSON.parse(storedUser)
      }

      const response = await this.apiService.get<{ user: User }>("/auth/me")

      if (response.success && response.data?.user) {
        sessionStorage.setItem("current_user", JSON.stringify(response.data.user))
        return response.data.user
      }

      return null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      const headers: Record<string, string> = {};
      const selectedCompany = sessionStorage.getItem("selected_company");
      if (selectedCompany) {
        try {
          const companyObj = JSON.parse(selectedCompany);
          if (companyObj?.id) {
            headers["IdEmpresa"] = companyObj.id.toString();
          }
        } catch (e) {
          console.warn("Error parseando selected_company:", e);
        }
      }
      const currentUser = sessionStorage.getItem("current_user");
      if (currentUser) {
        try {
          const userObj = JSON.parse(currentUser);
          if (userObj?.codigoUsuario) {
            headers.codigousuario = userObj.codigoUsuario.toString();
          }
          if (userObj?.loginUsuario) {
            headers.loginusuario = userObj.loginUsuario;
          }
        } catch (e) {
          console.warn("Error parseando current_user:", e);
        }
      }
      await this.apiService.post("/auth/logout", {}, headers);
    } catch (e) {
    } finally {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("current_user")
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp < now
    } catch (e) {
      return true
    }
  }

  async refreshToken(): Promise<boolean> {
    const token = sessionStorage.getItem("auth_token")
    if (!token || AuthService.isTokenExpired(token)) {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("current_user")
      return false
    }
    try {
      const response = await this.apiService.post<{ token?: string }>("/auth/refresh", {})
      if (response.data?.token) {
        sessionStorage.setItem("auth_token", response.data.token)
        return true
      }
      return false
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }
}
