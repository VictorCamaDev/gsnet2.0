export interface CompanyTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  logoUrl: string
  backgroundImageUrl?: string
  fontFamily?: string
}

export interface Company {
  id: string
  name: string
  domain: string
  logo: string
  theme: CompanyTheme
  databaseName?: string
  databaseInfo?: {
    name: string
    server?: string
    type?: "mysql" | "postgres" | "sqlserver" | "oracle" | "other"
    status?: "online" | "offline" | "maintenance"
  }
}
