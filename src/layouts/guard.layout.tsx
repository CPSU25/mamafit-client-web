import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { Navigate } from 'react-router'

interface GuardLayoutProps {
  children: React.ReactNode
  allowPermissions: string[]
}

export default function GuardLayout({ children, allowPermissions }: GuardLayoutProps) {
  // Return early if the user is not authenticated
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to='/sign-in' replace />
  }

  // If the user is authenticated, check if they have the required permissions
  // If the user does not have the required permissions, you can redirect them to a different page or show an error message

  const userPermissions = ['view:dasboard'] // This should be replaced with the actual user permissions from API

  const hasAllPermissions = allowPermissions.every((permission) => userPermissions.includes(permission))

  if (!hasAllPermissions) {
    return <Navigate to='/404' replace />
  }

  return <div>{children}</div>
}
