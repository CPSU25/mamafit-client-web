import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { authAPI } from '@/apis'
import { PermissionResponse } from '@/@types/auth.type'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  userPermission: PermissionResponse | null
  hasRole: (role: string) => boolean
  checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [userPermission, setUserPermission] = useState<PermissionResponse | null>(null)

  const hasRole = useCallback((role: string): boolean => {
    return userPermission?.roleName === role
  }, [userPermission?.roleName])

  const checkAuth = useCallback(async () => {
    if (!isAuthenticated) {
      setUserPermission(null)
      return
    }

    if (userPermission) return

    setIsLoading(true)
    try {
      const response = await authAPI.permission()
      setUserPermission(response.data.data)
    } catch (error) {
      console.error('Permission check failed:', error)
      setUserPermission(null)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, userPermission])

  useEffect(() => {
    if (isAuthenticated && !userPermission) {
      checkAuth()
    } else if (!isAuthenticated) {
      setUserPermission(null)
    }
  }, [isAuthenticated])

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated,
    isLoading,
    userPermission,
    hasRole,
    checkAuth
  }), [isAuthenticated, isLoading, userPermission, hasRole, checkAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 