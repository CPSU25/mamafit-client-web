import { UserRole } from '@/@types/user'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { Navigate, useLocation } from 'react-router-dom'

interface AuthMiddlewareProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function AuthMiddleware({ children, allowedRoles }: AuthMiddlewareProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to='/sign-in' state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to='/404' replace />
  }

  return <>{children}</>
}
