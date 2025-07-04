import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { UserRole } from '@/@types/auth.type'
import { toast } from 'sonner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/system/sign-in' 
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // ✅ Tránh hiển thị toast nhiều lần
  const hasShownToast = useRef(false)
  const currentPath = useRef(location.pathname)

  // ✅ Reset toast flag khi đổi route
  if (currentPath.current !== location.pathname) {
    hasShownToast.current = false
    currentPath.current = location.pathname
  }

  useEffect(() => {
    // Nếu đang loading, không làm gì
    if (isLoading) return

    // Nếu chưa authenticated, redirect về login (silent)
    if (!isAuthenticated) {
      navigate(fallbackPath, { 
        state: { from: location }, 
        replace: true 
      })
      return
    }

    // Nếu có requiredRole và user không có role đó
    if (requiredRole && !hasRole(requiredRole)) {
      if (!hasShownToast.current) {
        hasShownToast.current = true
        toast.error('Access Denied', {
          description: `You need ${requiredRole} role to access this page.`
        })
      }
      navigate(fallbackPath, { replace: true })
      return
    }
  }, [isAuthenticated, isLoading, requiredRole, hasRole, navigate, fallbackPath])

  // ✅ Show loading spinner
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600'></div>
      </div>
    )
  }

  // ✅ Chỉ render children khi đã pass all checks
  if (!isAuthenticated) return null
  if (requiredRole && !hasRole(requiredRole)) return null

  return <>{children}</>
} 

export default AuthGuard