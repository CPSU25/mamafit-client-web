import { useQuery } from '@tanstack/react-query'
import { authAPI } from '@/apis'
// import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useMemo } from 'react'

export const usePermission = () => {
  //   const { isAuthenticated } = useAuthStore()

  const {
    data: permissionData,
    isLoading,
    isError,
    error,
    refetch,
    isSuccess
  } = useQuery({
    queryKey: ['permission'], // Bỏ location.pathname khỏi queryKey
    queryFn: () => authAPI.permission(),
    // enabled: isAuthenticated, // Chỉ gọi API khi user đã authenticated
    staleTime: 1000 * 60 * 5, // Cache 5 phút
    gcTime: 1000 * 60 * 10, // Garbage collect sau 10 phút
    retry: (failureCount, error) => {
      // Không retry nếu lỗi 401, 403 (permission denied)
      if (error.response?.status === 401 || error.response?.status === 403) {
        return true
      }
      return failureCount < 2
    },
    retryDelay: 3000
  })

  const permission = permissionData?.data?.data

  // Memoize hasPermission function để tránh tạo mới mỗi lần render
  const hasPermission = useMemo(() => {
    return (requiredRole?: string) => {
      if (!permission || !requiredRole) return false
      return permission.roleName === requiredRole
    }
  }, [permission])

  // Memoize userInfo để tránh tạo object mới mỗi lần render
  const userInfo = useMemo(() => {
    return permission
      ? {
          username: permission.userName,
          email: permission.userEmail,
          role: permission.roleName,
          avatar: permission.profilePicture || '/default-avatar.png'
        }
      : null
  }, [permission])

  return {
    permission,
    isLoading,
    isError,
    error,
    refetch,
    isSuccess,
    hasPermission,
    userInfo
  }
}
