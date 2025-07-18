import type { ApiError } from "@/types/api"

class ApiClient {
  private baseUrl: string
  private apiKey?: string

  // process.env.NEXT_PUBLIC_API_URL ||
  constructor(baseUrl: string =  "http://localhost:8000/api") {
    this.baseUrl = baseUrl
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || (typeof window !== "undefined" ? localStorage.getItem("accessToken") : "") || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }
    // Obtener el token de localStorage y agregarlo al header Authorization si existe
    let token: string | null = null;
    const isPublicEndpoint = endpoint === "/users/login/" || endpoint === "/users/register/";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("accessToken");
      if (!token && !this.apiKey && !isPublicEndpoint) {
        window.location.href = "/sign-in";
        return Promise.reject(new Error("No hay token de autenticación. Redirigiendo a login..."));
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      } else if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`
      }
    } else if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          // Remove tokens from localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          
          // Remove tokens from cookies
          document.cookie = "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
          document.cookie = "refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
          
          // Try to get redirect info from backend response
          try {
            const errorData = await response.json();
            const redirectTo = errorData.redirect_to || "/sign-in";
            const message = errorData.message || "Token expirado o inválido. Redirigiendo a login...";
            console.log("Middleware redirect:", message);
            window.location.href = redirectTo;
            return Promise.reject(new Error(message));
          } catch {
            // Fallback if response is not JSON
            window.location.href = "/sign-in";
            return Promise.reject(new Error("Token expirado o inválido. Redirigiendo a login..."));
          }
        }
        const errorData: ApiError = await response.json().catch(() => ({
          error: "Network Error",
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: response.status,
        }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
