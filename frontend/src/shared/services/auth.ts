import { apiClient } from './api'

// Tipos para Auth
export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'CLEANER'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface RegisterDto {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'CLEANER'
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  newPassword: string
}

// Servicio de Auth
export class AuthService {
  private basePath = '/auth'

  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(`${this.basePath}/login`, credentials)
    
    // Guardar token en localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    
    return response
  }

  async register(userData: RegisterDto): Promise<User> {
    return apiClient.post<User>(`${this.basePath}/register`, userData)
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/logout`)
    } catch (error) {
      // Continuar con logout local incluso si falla la llamada al servidor
      console.warn('Error al hacer logout en servidor:', error)
    } finally {
      // Limpiar storage local
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/me`)
  }

  async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    const response = await apiClient.post<{ token: string; expiresIn: number }>(`${this.basePath}/refresh`)
    
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    
    return response
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/change-password`, data)
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.basePath}/forgot-password`, data)
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.basePath}/reset-password`, data)
  }

  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  }

  // Helpers
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    return !!token
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  hasRole(role: User['role']): boolean {
    const user = this.getStoredUser()
    return user?.role === role
  }

  hasAnyRole(roles: User['role'][]): boolean {
    const user = this.getStoredUser()
    return user ? roles.includes(user.role) : false
  }
}

// Instancia singleton
export const authService = new AuthService()
