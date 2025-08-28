import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true })
          
          const response = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          if (!response.ok) {
            throw new Error('Credenciales inválidas')
          }

          const data = await response.json()
          
          set({ 
            user: data.data.user, 
            token: data.data.accessToken, 
            isAuthenticated: true,
            isLoading: false 
          })
          
          localStorage.setItem('access_token', data.data.accessToken)
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        })
        localStorage.removeItem('access_token')
      },

      refreshToken: async () => {
        try {
          const token = get().token
          if (!token) {
            throw new Error('No token available')
          }

          const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data = await response.json()
          
          set({ 
            token: data.data.accessToken, 
          })
          
          localStorage.setItem('access_token', data.data.accessToken)
        } catch (error) {
          // Si falla el refresh, logout
          get().logout()
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
