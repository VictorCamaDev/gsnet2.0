// Configuración centralizada de variables de entorno
// Siguiendo principio de responsabilidad única

export interface EnvironmentConfig {
  // API Configuration
  apiUrl: string
  apiTimeout: number

  // Microsoft Authentication
  microsoftClientId: string
  microsoftTenantId: string
  microsoftRedirectUri: string

  // Application Settings
  appName: string
  appVersion: string
  environment: "development" | "staging" | "production"

  // Feature Flags
  enableMicrosoftAuth: boolean
  enableCredentialsAuth: boolean
  enableDebugMode: boolean
}

class EnvironmentService {
  private config: EnvironmentConfig

  constructor() {
    this.config = this.loadConfig()
    this.validateConfig()
  }

  private loadConfig(): EnvironmentConfig {
    return {
      // API Configuration
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
      apiTimeout: Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "70000"),

      // Microsoft Authentication
      microsoftClientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "",
      microsoftTenantId: process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || "",
      microsoftRedirectUri: process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || "",

      // Application Settings
      appName: process.env.NEXT_PUBLIC_APP_NAME || "Intranet Corporativa",
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      environment: (process.env.NODE_ENV as any) || "development",

      // Feature Flags
      enableMicrosoftAuth: process.env.NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH === "true",
      enableCredentialsAuth: process.env.NEXT_PUBLIC_ENABLE_CREDENTIALS_AUTH !== "false",
      enableDebugMode: process.env.NODE_ENV === "development",
    }
  }

  private validateConfig(): void {
    const requiredVars = ["apiUrl", "appName"]

    const missingVars = requiredVars.filter((key) => !this.config[key as keyof EnvironmentConfig])

    if (missingVars.length > 0) {
      console.warn("Missing environment variables:", missingVars)
    }

    if (this.config.enableMicrosoftAuth) {
      const microsoftRequiredVars = ["microsoftClientId", "microsoftTenantId"]

      const missingMicrosoftVars = microsoftRequiredVars.filter((key) => !this.config[key as keyof EnvironmentConfig])

      if (missingMicrosoftVars.length > 0) {
        console.error("Microsoft Auth enabled but missing variables:", missingMicrosoftVars)
      }
    }
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config }
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key]
  }

  isDevelopment(): boolean {
    return this.config.environment === "development"
  }

  isProduction(): boolean {
    return this.config.environment === "production"
  }
}

export const envConfig = new EnvironmentService()
