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
  userId?: string // Changed from 'id' to 'userId' to match JWT payload
  id?: string // Keep 'id' as optional for backward compatibility
  name?: string
  email?: string
  role?: UserRole
  username?: string // Add username field from JWT
  unique_name?: string // Alternative name field in JWT
  given_name?: string // Another name field in JWT
  nameid?: string // Alternative ID field in JWT
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string // Full claim name
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

          // Debug JWT payload structure
          console.group('🔍 JWT Debug Information')
          console.log('Raw JWT payload:', user)
          console.log('Available claims:', Object.keys(user))

          // Check different possible user ID fields
          const possibleUserIds = {
            userId: user.userId,
            id: user.id,
            sub: user.sub,
            nameid: user.nameid,
            nameIdentifier: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
          }

          console.log('Possible user ID fields:', possibleUserIds)

          // Find the actual user ID
          const actualUserId =
            user.userId ||
            user.id ||
            user.sub ||
            user.nameid ||
            user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']

          console.log('Selected user ID:', actualUserId)
          console.log('User name:', user.name || user.unique_name || user.given_name)
          console.log('User email:', user.email)
          console.log('User role:', user.role)
          console.groupEnd()

          // Ensure we have a user ID
          if (!actualUserId) {
            console.error('No user ID found in JWT token! Available claims:', Object.keys(user))
            throw new Error('JWT token missing user ID claim')
          }

          // Normalize user object
          const normalizedUser: User = {
            ...user,
            userId: actualUserId,
            id: actualUserId, // Ensure both fields exist
            name: user.name || user.unique_name || user.given_name || 'Unknown User'
          }

          console.log('Normalized user object:', normalizedUser)

          set({ isAuthenticated: true, accessToken, refreshToken, user: normalizedUser })
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

            // Use same normalization logic as save()
            const actualUserId =
              user.userId ||
              user.id ||
              user.sub ||
              user.nameid ||
              user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']

            if (!actualUserId) {
              throw new Error('No user ID found in rehydrated JWT')
            }

            const normalizedUser: User = {
              ...user,
              userId: actualUserId,
              id: actualUserId,
              name: user.name || user.unique_name || user.given_name || 'Unknown User'
            }

            state.isAuthenticated = true
            state.user = normalizedUser
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
