import { useState, useEffect, useCallback, useRef } from 'react'
import {
  notificationSignalRService,
  NotificationResponseDto,
  NotificationEventHandlers
} from '@/services/notification/notification-signalr.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useNotificationCache } from '@/hooks/use-notification-cache'
import { toast } from 'sonner'

export interface UseNotificationSignalROptions {
  autoConnect?: boolean
  onReceiveNotification?: (notification: NotificationResponseDto) => void
  onConnectionStateChange?: (isConnected: boolean) => void
  onError?: (error: string) => void
}

export interface UseNotificationSignalRReturn {
  notifications: NotificationResponseDto[]
  unreadCount: number
  isConnected: boolean
  connectionState: string
  connectionInfo: {
    isConnected: boolean
    state: string
    reconnectAttempts: number
    autoConnectEnabled: boolean
  }
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  forceConnect: () => Promise<void>
  forceDisconnect: () => Promise<void>
  clearNotifications: () => void
  markAsReadLocally: (notificationId: string) => void
  removeNotification: (notificationId: string) => void
}

export function useNotificationSignalR(options: UseNotificationSignalROptions = {}): UseNotificationSignalRReturn {
  const { onReceiveNotification, onConnectionStateChange, onError } = options

  // State management
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('Disconnected')
  const [connectionInfo, setConnectionInfo] = useState(notificationSignalRService.getConnectionInfo())

  // Refs to prevent duplicate operations
  const listenersSetupRef = useRef(false)
  const autoConnectAttempted = useRef(false)

  // 🔥 React Query integration
  const notificationCache = useNotificationCache()

  // Calculate unread count
  const unreadCount = notifications.filter((notif) => !notif.isRead).length

  // 🔧 FIX: Auto-connect based on auth state từ store
  useEffect(() => {
    const checkAndConnect = async () => {
      try {
        const authStore = useAuthStore.getState()
        const isAuthenticated = !!authStore.accessToken && !!authStore.user
        
        console.log('🔍 [NotificationHook] Checking auth state:', {
          isAuthenticated,
          hasToken: !!authStore.accessToken,
          hasUser: !!authStore.user,
          isConnected: notificationSignalRService.isConnected,
          autoConnectAttempted: autoConnectAttempted.current
        })
        
        if (isAuthenticated && !notificationSignalRService.isConnected && !autoConnectAttempted.current) {
          autoConnectAttempted.current = true
          console.log('🚀 [NotificationHook] Triggering auto-connect...')
          await notificationSignalRService.connect()
        } else if (!isAuthenticated && notificationSignalRService.isConnected) {
          console.log('🔌 [NotificationHook] User logged out, disconnecting...')
          await notificationSignalRService.disconnect()
          autoConnectAttempted.current = false
        }
      } catch (error) {
        console.error('❌ [NotificationHook] Auto-connect error:', error)
        autoConnectAttempted.current = false
      }
    }

    // Check immediately
    checkAndConnect()

    // Subscribe to auth changes để đảm bảo không miss events
    const unsubscribe = useAuthStore.subscribe((state) => {
      const isAuthenticated = !!state.accessToken && !!state.user
      console.log('📡 [NotificationHook] Auth state changed:', isAuthenticated)
      
      if (isAuthenticated && !autoConnectAttempted.current) {
        checkAndConnect()
      } else if (!isAuthenticated) {
        autoConnectAttempted.current = false
        if (notificationSignalRService.isConnected) {
          notificationSignalRService.disconnect()
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Update connection info periodically
  useEffect(() => {
    const updateConnectionInfo = () => {
      const info = notificationSignalRService.getConnectionInfo()
      setIsConnected(info.isConnected)
      setConnectionState(info.state)
      setConnectionInfo(info)
    }

    // Update immediately
    updateConnectionInfo()

    // Update every 5 seconds
    const interval = setInterval(updateConnectionInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  // Setup SignalR event listeners
  useEffect(() => {
    if (listenersSetupRef.current) {
      return
    }

    listenersSetupRef.current = true

    const handlers: NotificationEventHandlers = {
      onReceiveNotification: (notification: NotificationResponseDto) => {

        // Add new notification to the top of the list
        setNotifications((prev) => {
          // Prevent duplicates
          const exists = prev.some((n) => n.id === notification.id)
          if (exists) {
            return prev
          }
          return [notification, ...prev]
        })

        // ✅ Update React Query cache real-time
        notificationCache.addNewNotification(notification)

        // ✅ Show smart toast for ORDER_PROGRESS
        if (notification.type === 'ORDER_PROGRESS') {
          toast.info(notification.notificationTitle || 'Cập nhật tiến độ', {
            description: notification.notificationContent,
            action: notification.actionUrl ? {
              label: 'Xem chi tiết',
              onClick: () => {
                window.location.href = notification.actionUrl!
              }
            } : undefined,
            duration: 6000
          })
        } else {
          // Regular notification toast
          toast(notification.notificationTitle || 'Thông báo mới', {
            description: notification.notificationContent,
            duration: 4000
          })
        }

        // Call custom handler if provided
        if (onReceiveNotification) {
          onReceiveNotification(notification)
        }
      },

      onConnectionStateChange: (connected: boolean) => {
        setIsConnected(connected)

        // Call custom handler if provided
        if (onConnectionStateChange) {
          onConnectionStateChange(connected)
        }
      },

      onError: (error: string) => {

        // Call custom handler if provided
        if (onError) {
          onError(error)
        }
      }
    }

    // Setup handlers và lấy cleanup function
    const cleanup = notificationSignalRService.setupHandlers(handlers)

    // Cleanup function
    return () => {
      cleanup()
      listenersSetupRef.current = false
    }
  }, [onReceiveNotification, onConnectionStateChange, onError, notificationCache])

  // Memoized methods
  const connect = useCallback(async () => {
    await notificationSignalRService.connect()
  }, [])

  const disconnect = useCallback(async () => {
    await notificationSignalRService.disconnect()
    // Clear notifications when disconnecting
    setNotifications([])
  }, [])

  const forceConnect = useCallback(async () => {
    await notificationSignalRService.forceConnect()
  }, [])

  const forceDisconnect = useCallback(async () => {
    await notificationSignalRService.forceDisconnect()
    // Clear notifications when disconnecting
    setNotifications([])
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const markAsReadLocally = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }, [])

  // Return hook interface
  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    connectionState,
    connectionInfo,

    // Connection management
    connect,
    disconnect,
    forceConnect,
    forceDisconnect,

    // Notification management
    clearNotifications,
    markAsReadLocally,
    removeNotification
  }
}
