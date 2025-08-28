// Configuración base de la API
export const API_BASE_URL = 'http://localhost:3000/api/v1'

// Tipos base para respuestas de API
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// Clase para manejar errores de API
export class ApiErrorClass extends Error {
  statusCode: number
  error?: string

  constructor(message: string, statusCode: number, error?: string) {
    super(message)
    this.statusCode = statusCode
    this.error = error
    this.name = 'ApiError'
  }
}

// Cliente API base con autenticación
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Obtener token de autenticación
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  // Headers por defecto con autenticación
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  // Método genérico para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      // Si no hay contenido (204), retornar null
      if (response.status === 204) {
        return null as T
      }

      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        throw new ApiErrorClass(
          data.message || 'Error en la petición',
          response.status,
          data.error
        )
      }

      // Extraer datos del formato del backend: { success: true, data: { data: [...] } }
      if (data && typeof data === 'object' && data.success && data.data) {
        return data.data.data || data.data
      }

      return data
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error
      }
      
      // Error de red o conexión
      throw new ApiErrorClass(
        'Error de conexión con el servidor',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(API_BASE_URL)

// Hook personalizado para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiErrorClass) {
    // Manejar errores específicos
    switch (error.statusCode) {
      case 401:
        // Token expirado o inválido
        localStorage.removeItem('authToken')
        window.location.href = '/login'
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.'
      case 403:
        return 'No tienes permisos para realizar esta acción.'
      case 404:
        return 'El recurso solicitado no fue encontrado.'
      case 422:
        return error.message || 'Datos inválidos.'
      case 500:
        return 'Error interno del servidor. Intenta nuevamente.'
      default:
        return error.message || 'Error desconocido.'
    }
  }
  
  return 'Error de conexión. Verifica tu conexión a internet.'
}
