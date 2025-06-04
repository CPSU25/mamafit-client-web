import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

export default function GuardLayout() {
  const { isAuthenticated, user } = useAuthStore()

  // Nếu chưa đăng nhập, chuyển đến trang sign-in
  if (!isAuthenticated) {
    return <Navigate to='/sign-in' replace />
  }

  // Nếu đã đăng nhập, chuyển đến dashboard tương ứng với role
  if (user) {
    switch (user.role) {
      case 'Admin':
        return <Navigate to='/admin/dashboard' replace />
      case 'BranchManager':
        return <Navigate to='/branch/dashboard' replace />
      case 'Designer':
        return <Navigate to='/designer/dashboard' replace />
      case 'Manager':
        return <Navigate to='/factory-manager/dashboard' replace />
      default:
        return <Navigate to='/404' replace />
    }
  }

  // Fallback loading state
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div>Loading...</div>
    </div>
  )
}
