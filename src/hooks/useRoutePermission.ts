import { useEffect, useCallback } from 'react'
import { usePermission } from '@/features/auth/usePermission'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

interface UseRoutePermissionOptions {
  requiredRole?: string
  redirectTo?: string
  showErrorMessage?: boolean
}

export const useRoutePermission = (options: UseRoutePermissionOptions = {}) => {
  const { requiredRole, redirectTo = '/unauthorized', showErrorMessage = true } = options

  const { permission, isLoading, isError, hasPermission } = usePermission()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Memoize redirect function để tránh tạo mới mỗi lần render
  const handleRedirect = useCallback(() => {
    if (showErrorMessage) {
      toast.error('Access Denied', {
        description: 'You do not have permission to access this page.'
      })
    }
    navigate(redirectTo, { replace: true })
  }, [showErrorMessage, navigate, redirectTo])

  useEffect(() => {
    // Chỉ check khi không loading
    if (isLoading) return

    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: location }, replace: true })
      return
    }

    // Chỉ check permission khi có requiredRole và permission data
    if (requiredRole && permission && !hasPermission(requiredRole)) {
      handleRedirect()
    }
  }, [isAuthenticated, isLoading, permission, requiredRole, hasPermission, navigate, location, handleRedirect])

  return {
    permission,
    isLoading,
    isError,
    hasPermission,
    isAuthorized: !requiredRole || hasPermission(requiredRole)
  }
}
