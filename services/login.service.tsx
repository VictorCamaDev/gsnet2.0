// Servicio de autenticación siguiendo principios SOLID
// S - Single Responsibility: Solo maneja autenticación
// O - Open/Closed: Extensible para nuevos métodos de auth
// L - Liskov Substitution: Implementa interfaz común
// I - Interface Segregation: Interfaces específicas
// D - Dependency Inversion: Depende de abstracciones

import { ApiService } from "./api.service"

export interface IAuthService {
  loginWithMicrosoft(msToken: string, email: string): Promise<boolean>
  loginWithCredentials(email: string, password: string): Promise<AuthResult>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  roles: string[]
}

export class AuthService implements IAuthService {
  private apiService: ApiService

  constructor() {
    this.apiService = new ApiService()
  }

  /**
   * Login real con Microsoft Azure AD. Recibe el token y el email desde el frontend (MSAL) y los envía al backend.
   */
  async loginWithMicrosoft(msToken: string, email: string): Promise<boolean> {
    try {
      const response = await this.apiService.post<{ user: User; token: string; error?: string }>(
        '/auth/microsoft',
        { msToken, email }
      );
      if (response.data?.user && response.data?.token) {
        sessionStorage.setItem("auth_token", response.data.token);
        sessionStorage.setItem("current_user", JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await this.apiService.post<{ user: User; token: string; error?: string }>(
        '/auth/login',
        { email, password }
      )
      if (response.data?.user) {
        sessionStorage.setItem("auth_token", response.data.token)
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        }
      }
      return { success: false, error: response.data?.error || "Credenciales inválidas" }
    } catch (error) {
      return { 
        success: false, 
        error: 'Credenciales inválidas' 
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiService.post('/auth/logout')
    } finally {
      sessionStorage.removeItem("auth_token")
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.apiService.get<{ user: User }>('/auth/me')
      return response.data?.user || null
    } catch (error) {
      return null
    }
  }



}
