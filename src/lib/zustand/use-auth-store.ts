import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { decodeJwt, JWTPayload } from 'jose'
import { UserRole } from '@/@types/user'

interface AuthStoreState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string
  refreshToken: string
  save: ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => void
  clear: () => void
}
interface User extends JWTPayload {
  id: string
  name: string
  email: string
  role: UserRole
}
/**
 * Zustand store for managing authentication state.
 *
 * This store handles access and refresh tokens, decodes the JWT to extract user information,
 * and persists the relevant tokens using localStorage.
 *
 * ### Features:
 * - Stores access & refresh tokens
 * - Automatically decodes JWT and extracts user info
 * - Persists tokens between reloads
 * - Provides `save()` and `clear()` methods
 *
 * Usage:
 * ```ts
 * const { isAuthenticated, user, save, clear } = useAuthStore()
 * // or
 * useAuthStore.getState().save({ accessToken, refreshToken })
 * useAuthStore.getState().user
 * ```
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: '',
      refreshToken: '',
      user: null,
      save: ({ accessToken, refreshToken }) => {
        try {
          const user = decodeJwt(accessToken) as User
          set({ isAuthenticated: true, accessToken, refreshToken, user })
        } catch (error) {
          console.error('Failed to decode JWT in save:', error)
          set({ isAuthenticated: false, accessToken, refreshToken, user: null })
        }
      },
      clear: () => {
        set({ isAuthenticated: false, accessToken: '', refreshToken: '', user: null })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Rehydration error:', error)
          return
        }
        if (state && state.accessToken && state.refreshToken) {
          try {
            const user = decodeJwt(state.accessToken) as User
            state.isAuthenticated = true
            state.user = user
          } catch (error) {
            console.error('Failed to decode JWT during rehydration:', error)
            state.isAuthenticated = false
            state.user = null
          }
        } else {
          console.log('No tokens found in rehydrated state')
        }
      }
    }
  )
)
