import { UserRole } from '@/@types/user'
import { useRoutePermission } from '@/hooks/useRoutePermission'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface AuthMiddlewareProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function AuthMiddleware({ children, allowedRoles }: AuthMiddlewareProps) {
  const requiredRole = allowedRoles?.[0] // Lấy role đầu tiên nếu có nhiều roles

  const { isLoading, isAuthorized } = useRoutePermission({
    requiredRole,
    redirectTo: '/system'
  })

  // Hiển thị loading khi đang check permission
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600'></div>
      </div>
    )
  }

  // Chỉ render children khi đã có quyền truy cập
  if (!isAuthorized) {
    return <Navigate to='/system' replace />
  }

  return <>{children}</>
}
