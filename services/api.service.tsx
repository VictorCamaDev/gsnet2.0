export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiConfig {
  baseUrl: string
  timeout: number
  headers: Record<string, string>
}

export class ApiService {
  private config!: ApiConfig

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers };
    let token = null;
    if (typeof window !== "undefined") {
      token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    let triedRefresh = false;
    const doRequest = async (): Promise<ApiResponse<T>> => {
      const url = `${this.config.baseUrl}${endpoint}`;
      //console.log("API REQUEST URL:", url);

      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401 && endpoint !== '/auth/logout' && !triedRefresh) {
          //console.log("¡Entrando a lógica de refresh token!");
          triedRefresh = true;
          if (typeof window !== 'undefined') {
            const selectedCompany = sessionStorage.getItem('selected_company');
            const empresa = selectedCompany ? JSON.parse(selectedCompany).id : null;

            const currentUser = sessionStorage.getItem('current_user');
            const usuario = currentUser ? JSON.parse(currentUser).correo : null;

            const refreshToken = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${this.config.baseUrl}/auth/refresh`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'IdEmpresa': empresa 
                  },
                  body: JSON.stringify({ refreshToken, usuario }),
                });

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  if (refreshData.success && refreshData.token) {
                    sessionStorage.setItem('auth_token', refreshData.token);
                    if (refreshData.refreshToken) {
                      sessionStorage.setItem('refresh_token', refreshData.refreshToken);
                    }
                    config.headers = { ...this.getHeaders(), ...options.headers };
                    return await doRequest();
                  }
                } else {
                  // Si el refresh falla, obtenemos el mensaje de error
                  const errorData = await refreshResponse.json();
                  console.error("Error en refresh token:", errorData);
                  return {
                    success: false,
                    error: errorData.message || 'Error al refrescar el token. Por favor inicia sesión de nuevo.'
                  };
                }
              } catch (e) {
                console.error("Error en la llamada al refresh:", e);
                return {
                  success: false,
                  error: 'Error al refrescar el token. Por favor inicia sesión de nuevo.'
                };
              }
            } else {
              // Si no hay refresh token, redirigimos al login
              sessionStorage.clear();
              localStorage.clear();
              window.location.href = '/';
              return {
                success: false,
                error: 'Sesión expirada. Por favor inicia sesión de nuevo.'
              };
            }
          }
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && typeof data === "object" && "data" in data) {
          return { success: true, data: data.data };
        }
        return { success: true, data };

      } catch (error) {
        if (options && typeof options === 'object' && 'method' in options && options.method === 'POST' && endpoint === '/auth/logout' && error instanceof Error && error.message.includes('401')) {
        } else {
          if (!(error instanceof Error && (error.message.includes('404') || error.message.includes('Failed to fetch')))) {
            console.error("API Error:", error);
          }
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        }
      }
    };
    return await doRequest();
  }

  public async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: {
        ...this.getHeaders(),
        ...customHeaders,
      },
    });
  }

  public async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...this.getHeaders(),
        ...customHeaders,
      },
    });
  }

  public async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        ...this.getHeaders(),
        ...customHeaders,
      },
    });
  }

  public async delete<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      headers: {
        ...this.getHeaders(),
        ...customHeaders,
      },
    });
  }
}
