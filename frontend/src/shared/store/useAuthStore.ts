import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, type User, type LoginDto } from '../services/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginDto) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
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

      checkAuth: async () => {
        try {
          const token = authService.getToken()
          const user = authService.getStoredUser()
          
          if (token && user) {
            // Verificar si el token sigue siendo válido
            const isValid = await authService.verifyToken()
            if (isValid) {
              set({ 
                user, 
                token, 
                isAuthenticated: true 
              })
            } else {
              // Token inválido, limpiar estado
              await get().logout()
            }
          }
        } catch (error) {
          console.error('Error checking auth:', error)
          await get().logout()
        }
      },

      login: async (credentials: LoginDto) => {
        try {
          set({ isLoading: true })
          
          const response = await authService.login(credentials)
          
          set({ 
            user: response.user, 
            token: response.token, 
            isAuthenticated: true,
            isLoading: false 
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Error during logout:', error)
        } finally {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken()
          set({ 
            token: response.token
          })
        } catch (error) {
          // Si falla el refresh, logout
          await get().logout()
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
