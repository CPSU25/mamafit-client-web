import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Helper function to get dashboard route based on role
const getDashboardRoute = (role: string) => {
  switch (role) {
    case 'Admin':
      return '/system/admin/dashboard'
    case 'BranchManager':
      return '/system/branch/dashboard'
    case 'Designer':
      return '/system/designer/dashboard'
    case 'Manager':
      return '/system/factory-manager/dashboard'
    case 'Staff':
      return '/system/factory-staff/dashboard'
    default:
      return '/system'
  }
}

export default function GuestLayout() {
  const { isAuthenticated, user } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  // Check localStorage to avoid flash redirects
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage && authStorage !== 'null' && authStorage !== 'undefined') {
          // Có auth data, đợi auth store hydrate và redirect
          const timeoutId = setTimeout(() => {
            setIsChecking(false)
          }, 1000) // Timeout sau 1 giây

          return () => clearTimeout(timeoutId)
        }
        // Không có token, không cần redirect
        setIsChecking(false)
      } catch (error) {
        console.error('Error checking localStorage:', error)
        setIsChecking(false)
      }
    }

    const cleanup = checkAuth()
    return cleanup
  }, [])

  // Khi auth store đã authenticated, dừng checking và redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsChecking(false)
    }
  }, [isAuthenticated, user])

  // Đợi kiểm tra localStorage hoàn tất
  if (isChecking) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600'></div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    const dashboardRoute = getDashboardRoute(user.role ?? '')
    return <Navigate to={dashboardRoute} replace />
  }

  return (
    <div className='max-w-screen h-screen flex flex-col items-center justify-center'>
      <Outlet />
    </div>
  )
}
