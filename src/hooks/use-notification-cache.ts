import { useQueryClient } from '@tanstack/react-query'
import { NotificationResponseDto } from '@/services/notification/notification-signalr.service'

// ===== QUERY KEYS =====
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const
}

/**
 * Hook utility để invalidate notification cache
 * Version đơn giản và an toàn
 */
export const useNotificationCache = () => {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    try {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      console.log('✅ [NotificationCache] Invalidated all notifications')
    } catch (error) {
      console.error('❌ [NotificationCache] Error invalidating all:', error)
    }
  }

  const invalidateStats = () => {
    try {
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() })
      console.log('✅ [NotificationCache] Invalidated notification stats')
    } catch (error) {
      console.error('❌ [NotificationCache] Error invalidating stats:', error)
    }
  }

  const invalidateLists = () => {
    try {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      console.log('✅ [NotificationCache] Invalidated notification lists')
    } catch (error) {
      console.error('❌ [NotificationCache] Error invalidating lists:', error)
    }
  }

  const addNewNotification = (notification: NotificationResponseDto) => {
    try {
      console.log('➕ [NotificationCache] Adding new notification:', notification.id)
      
      // Simple approach: just invalidate to refetch fresh data
      invalidateAll()
      
      // Optional: You can add optimistic updates here later
      console.log('✅ [NotificationCache] New notification processed')
    } catch (error) {
      console.error('❌ [NotificationCache] Error adding notification:', error)
    }
  }

  const updateNotification = (notificationId: string, updates: Partial<NotificationResponseDto>) => {
    try {
      console.log('🔄 [NotificationCache] Updating notification:', notificationId, updates)
      
      // Simple approach: just invalidate to refetch fresh data
      invalidateAll()
      
      console.log('✅ [NotificationCache] Notification updated')
    } catch (error) {
      console.error('❌ [NotificationCache] Error updating notification:', error)
    }
  }

  return {
    invalidateAll,
    invalidateStats,
    invalidateLists,
    addNewNotification,
    updateNotification
  }
}
