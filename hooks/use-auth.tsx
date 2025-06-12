"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AuthService } from "@/services/auth.service"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithMicrosoft: (msToken: string, email: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const authService = new AuthService()

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("auth_token")
      if (token) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
      console.error("Error checking auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }


  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await authService.loginWithCredentials(email, password)
      if (result.success && result.user) {
        setUser(result.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithMicrosoft = async (msToken: string, email: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const result = await authService.loginWithMicrosoft(msToken, email)
      if (result.success && result.user) {
        setUser(result.user)
        return true
      }
      return false
    } catch (error) {
      console.error("Microsoft login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()

      setUser(null)

      sessionStorage.removeItem("selected_company")

      sessionStorage.clear()
    } catch (error) {
      setUser(null)
      sessionStorage.clear()
      localStorage.clear()
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithMicrosoft,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
