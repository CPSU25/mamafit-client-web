import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { Navigate, Outlet } from 'react-router-dom'

export default function GuestLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to='/' replace />
  }

  return (
    <div className='max-w-screen h-screen flex flex-col items-center justify-center'>
      <Outlet />
    </div>
  )
}
