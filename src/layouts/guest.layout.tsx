import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { Navigate, Outlet } from 'react-router-dom'

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
    default:
      return '/system'
  }
}

export default function GuestLayout() {
  const { isAuthenticated, user } = useAuthStore()

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
