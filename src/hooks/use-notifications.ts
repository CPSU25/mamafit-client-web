import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { notificationAPI, GetNotificationsRequest, MarkAsReadRequest } from '@/apis/notification.api'
import { NotificationResponseDto } from '@/services/notification/notification-signalr.service'
import { toast } from 'sonner'

// ===== QUERY KEYS =====
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: GetNotificationsRequest) => [...notificationKeys.lists(), filters] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  infinite: (filters: GetNotificationsRequest) => [...notificationKeys.all, 'infinite', filters] as const
}

// ===== HOOKS =====

/**
 * Hook để lấy danh sách notifications với pagination
 */
export const useNotifications = (params: GetNotificationsRequest = {}) => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationAPI.getNotifications(params),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // Cache 30 giây
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
    select: (data) => ({
      notifications: data.data?.items || [],
      pagination: {
        pageNumber: data.data?.pageNumber || 1,
        totalPages: data.data?.totalPages || 1,
        totalCount: data.data?.totalCount || 0,
        pageSize: data.data?.pageSize || 10,
        hasPreviousPage: data.data?.hasPreviousPage || false,
        hasNextPage: data.data?.hasNextPage || false
      }
    })
  })
}

/**
 * Hook để lấy notifications với infinite scroll
 */
export const useNotificationsInfinite = (baseParams: Omit<GetNotificationsRequest, 'pageNumber'> = {}) => {
  const { isAuthenticated } = useAuthStore()

  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(baseParams),
    queryFn: ({ pageParam = 1 }) => 
      notificationAPI.getNotifications({ ...baseParams, pageNumber: pageParam }),
    enabled: isAuthenticated,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasNext = lastPage.data?.hasNextPage
      const currentPage = lastPage.data?.pageNumber || 1
      return hasNext ? currentPage + 1 : undefined
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      notifications: data.pages.flatMap(page => page.data?.items || []),
      totalCount: data.pages[0]?.data?.totalCount || 0
    })
  })
}

/**
 * Hook để lấy thống kê notifications
 */
export const useNotificationStats = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationAPI.getNotificationStats(),
    enabled: isAuthenticated,
    staleTime: 10 * 1000, // Cache 10 giây cho stats
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Auto refetch mỗi 30 giây
    select: (data) => data.data
  })
}

/**
 * Hook để lấy chi tiết một notification
 */
export const useNotificationDetail = (notificationId: string) => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: notificationKeys.detail(notificationId),
    queryFn: () => notificationAPI.getNotificationById(notificationId),
    enabled: isAuthenticated && !!notificationId,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    select: (data) => data.data
  })
}

/**
 * Hook để đánh dấu notifications là đã đọc
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: MarkAsReadRequest) => notificationAPI.markAsRead(request),
    onMutate: async ({ notificationIds }) => {

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })
      await queryClient.cancelQueries({ queryKey: notificationKeys.stats() })

      // Snapshot previous values
      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.lists() })
      const previousStats = queryClient.getQueryData(notificationKeys.stats())

      // Optimistically update notification lists
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { data?: { items?: NotificationResponseDto[] } & Record<string, unknown> }
        if (!data?.data?.items) return oldData

        return {
          ...data,
          data: {
            ...data.data,
            items: data.data.items.map((notification: NotificationResponseDto) =>
              notificationIds.includes(notification.id)
                ? { ...notification, isRead: true }
                : notification
            )
          }
        }
      })

      // Optimistically update infinite queries
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { pages?: Array<{ data?: { items?: NotificationResponseDto[] } & Record<string, unknown> }> }
        if (!data?.pages) return oldData

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data?.items?.map((notification: NotificationResponseDto) =>
                notificationIds.includes(notification.id)
                  ? { ...notification, isRead: true }
                  : notification
              ) || []
            }
          }))
        }
      })

      // Optimistically update stats
      queryClient.setQueryData(notificationKeys.stats(), (oldStats: unknown) => {
        if (!oldStats || typeof oldStats !== 'object') return oldStats

        const stats = oldStats as { unreadCount?: number; readCount?: number } & Record<string, unknown>
        const markCount = notificationIds.length
        
        return {
          ...stats,
          unreadCount: Math.max(0, (stats.unreadCount || 0) - markCount),
          readCount: (stats.readCount || 0) + markCount
        }
      })

      return { previousData, previousStats }
    },
    onError: (error, _variables, context) => {
      console.error('❌ [MarkAsRead] Error:', error)
      
      // Revert optimistic updates
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousStats) {
        queryClient.setQueryData(notificationKeys.stats(), context.previousStats)
      }

      toast.error('Lỗi khi đánh dấu đã đọc', {
        description: 'Vui lòng thử lại sau'
      })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onSuccess: (_data, { notificationIds }) => {
      console.log('✅ [MarkAsRead] Success for:', notificationIds)
      
      toast.success('Đã đánh dấu đã đọc', {
        description: `${notificationIds.length} thông báo`
      })
    }
  })
}

/**
 * Hook để đánh dấu tất cả notifications là đã đọc
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onMutate: async () => {
      console.log('🔄 [MarkAllAsRead] Optimistic update')

      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all })

      // Mark all notifications as read optimistically
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { data?: { items?: NotificationResponseDto[] } & Record<string, unknown> }
        if (!data?.data?.items) return oldData

        return {
          ...data,
          data: {
            ...data.data,
            items: data.data.items.map((notification: NotificationResponseDto) => ({
              ...notification,
              isRead: true
            }))
          }
        }
      })

      // Update infinite queries
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { pages?: Array<{ data?: { items?: NotificationResponseDto[] } & Record<string, unknown> }> }
        if (!data?.pages) return oldData

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data?.items?.map((notification: NotificationResponseDto) => ({
                ...notification,
                isRead: true
              })) || []
            }
          }))
        }
      })

      // Update stats
      queryClient.setQueryData(notificationKeys.stats(), (oldStats: unknown) => {
        if (!oldStats || typeof oldStats !== 'object') return oldStats

        const stats = oldStats as { totalCount?: number; unreadCount?: number; readCount?: number } & Record<string, unknown>
        
        return {
          ...stats,
          unreadCount: 0,
          readCount: stats.totalCount || 0
        }
      })

      return { previousData }
    },
    onError: (error, _variables, context) => {
      console.error('❌ [MarkAllAsRead] Error:', error)
      
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Lỗi khi đánh dấu tất cả đã đọc', {
        description: 'Vui lòng thử lại sau'
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onSuccess: () => {
      console.log('✅ [MarkAllAsRead] Success')
      
      toast.success('Đã đánh dấu tất cả đã đọc', {
        description: 'Tất cả thông báo đã được đánh dấu đã đọc'
      })
    }
  })
}

/**
 * Hook để xóa notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => notificationAPI.deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      console.log('🔄 [DeleteNotification] Optimistic update for:', notificationId)

      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all })

      // Remove notification optimistically
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { 
          data?: { 
            items?: NotificationResponseDto[]; 
            totalCount?: number 
          } & Record<string, unknown> 
        }
        if (!data?.data?.items) return oldData

        const filteredItems = data.data.items.filter(
          (notification: NotificationResponseDto) => notification.id !== notificationId
        )

        return {
          ...data,
          data: {
            ...data.data,
            items: filteredItems,
            totalCount: Math.max(0, (data.data.totalCount || 0) - 1)
          }
        }
      })

      // Update infinite queries
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { 
          pages?: Array<{ 
            data?: { 
              items?: NotificationResponseDto[]; 
              totalCount?: number 
            } & Record<string, unknown> 
          }> 
        }
        if (!data?.pages) return oldData

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data?.items?.filter(
                (notification: NotificationResponseDto) => notification.id !== notificationId
              ) || [],
              totalCount: Math.max(0, (page.data?.totalCount || 0) - 1)
            }
          }))
        }
      })

      return { previousData }
    },
    onError: (error, _notificationId, context) => {
      console.error('❌ [DeleteNotification] Error:', error)
      
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Lỗi khi xóa thông báo', {
        description: 'Vui lòng thử lại sau'
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onSuccess: () => {
      console.log('✅ [DeleteNotification] Success')
      
      toast.success('Đã xóa thông báo', {
        description: 'Thông báo đã được xóa thành công'
      })
    }
  })
}

/**
 * Hook để xóa nhiều notifications
 */
export const useDeleteNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationIds: string[]) => notificationAPI.deleteNotifications(notificationIds),
    onMutate: async (notificationIds) => {
      console.log('🔄 [DeleteNotifications] Optimistic update for:', notificationIds)

      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousData = queryClient.getQueriesData({ queryKey: notificationKeys.all })

      // Remove notifications optimistically
      queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData

        const data = oldData as { 
          data?: { 
            items?: NotificationResponseDto[]; 
            totalCount?: number 
          } & Record<string, unknown> 
        }
        if (!data?.data?.items) return oldData

        const filteredItems = data.data.items.filter(
          (notification: NotificationResponseDto) => !notificationIds.includes(notification.id)
        )

        return {
          ...data,
          data: {
            ...data.data,
            items: filteredItems,
            totalCount: Math.max(0, (data.data.totalCount || 0) - notificationIds.length)
          }
        }
      })

      return { previousData }
    },
    onError: (error, _notificationIds, context) => {
      console.error('❌ [DeleteNotifications] Error:', error)
      
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast.error('Lỗi khi xóa thông báo', {
        description: 'Vui lòng thử lại sau'
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onSuccess: (_data, notificationIds) => {
      console.log('✅ [DeleteNotifications] Success for:', notificationIds)
      
      toast.success('Đã xóa thông báo', {
        description: `${notificationIds.length} thông báo đã được xóa`
      })
    }
  })
}

/**
 * Hook utility để invalidate notification cache
 */
export const useNotificationCache = () => {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all })
  }

  const invalidateStats = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
  }

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
  }

  const addNewNotification = (notification: NotificationResponseDto) => {
    console.log('➕ [NotificationCache] Adding new notification:', notification.id)

    // Add to all list queries
    queryClient.setQueriesData({ queryKey: notificationKeys.lists() }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData

      const data = oldData as { 
        data?: { 
          items?: NotificationResponseDto[]; 
          totalCount?: number 
        } & Record<string, unknown> 
      }
      if (!data?.data?.items) return oldData

      return {
        ...data,
        data: {
          ...data.data,
          items: [notification, ...data.data.items],
          totalCount: (data.data.totalCount || 0) + 1
        }
      }
    })

    // Add to infinite queries
    queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData

      const data = oldData as { 
        pages?: Array<{ 
          data?: { 
            items?: NotificationResponseDto[]; 
            totalCount?: number 
          } & Record<string, unknown> 
        }> 
      }
      if (!data?.pages || data.pages.length === 0) return oldData

      const newPages = [...data.pages]
      if (newPages[0]?.data?.items) {
        newPages[0] = {
          ...newPages[0],
          data: {
            ...newPages[0].data,
            items: [notification, ...newPages[0].data.items],
            totalCount: (newPages[0].data.totalCount || 0) + 1
          }
        }
      }

      return {
        ...data,
        pages: newPages
      }
    })

    // Update stats
    queryClient.setQueryData(notificationKeys.stats(), (oldStats: unknown) => {
      if (!oldStats || typeof oldStats !== 'object') return oldStats

      const stats = oldStats as { 
        totalCount?: number; 
        unreadCount?: number; 
        readCount?: number; 
        todayCount?: number 
      } & Record<string, unknown>

      return {
        ...stats,
        totalCount: (stats.totalCount || 0) + 1,
        unreadCount: notification.isRead ? stats.unreadCount || 0 : (stats.unreadCount || 0) + 1,
        readCount: notification.isRead ? (stats.readCount || 0) + 1 : stats.readCount || 0,
        todayCount: (stats.todayCount || 0) + 1
      }
    })
  }

  const updateNotification = (notificationId: string, updates: Partial<NotificationResponseDto>) => {
    console.log('🔄 [NotificationCache] Updating notification:', notificationId, updates)

    // Update in all queries
    queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object') return oldData

      const data = oldData as { 
        data?: { items?: NotificationResponseDto[] } & Record<string, unknown>;
        pages?: Array<{ 
          data?: { items?: NotificationResponseDto[] } & Record<string, unknown> 
        }>
      }

      if (data?.data?.items) {
        // Regular query
        return {
          ...data,
          data: {
            ...data.data,
            items: data.data.items.map((notification: NotificationResponseDto) =>
              notification.id === notificationId
                ? { ...notification, ...updates }
                : notification
            )
          }
        }
      } else if (data?.pages) {
        // Infinite query
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data?.items?.map((notification: NotificationResponseDto) =>
                notification.id === notificationId
                  ? { ...notification, ...updates }
                  : notification
              ) || []
            }
          }))
        }
      }

      return oldData
    })
  }

  return {
    invalidateAll,
    invalidateStats,
    invalidateLists,
    addNewNotification,
    updateNotification
  }
}