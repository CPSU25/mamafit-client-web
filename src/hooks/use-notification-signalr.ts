import { useState, useEffect, useCallback, useRef } from 'react'
import {
  notificationSignalRService,
  NotificationResponseDto,
  NotificationEventHandlers
} from '@/services/notification/notification-signalr.service'

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

  // Calculate unread count
  const unreadCount = notifications.filter((notif) => !notif.isRead).length

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

    console.log('🔧 Setting up notification SignalR event listeners')
    listenersSetupRef.current = true

    const handlers: NotificationEventHandlers = {
      onReceiveNotification: (notification: NotificationResponseDto) => {
        console.log('🔔 Received new notification:', notification)

        // Add new notification to the top of the list
        setNotifications((prev) => {
          // Prevent duplicates
          const exists = prev.some((n) => n.id === notification.id)
          if (exists) {
            console.log('⏭️ Notification already exists, skipping')
            return prev
          }
          return [notification, ...prev]
        })

        // Call custom handler if provided
        if (onReceiveNotification) {
          onReceiveNotification(notification)
        }
      },

      onConnectionStateChange: (connected: boolean) => {
        console.log('🔗 Connection state changed:', connected)
        setIsConnected(connected)

        // Call custom handler if provided
        if (onConnectionStateChange) {
          onConnectionStateChange(connected)
        }
      },

      onError: (error: string) => {
        console.error('❌ Notification SignalR Error:', error)

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
      console.log('🧹 Cleaning up notification SignalR event listeners')
      cleanup()
      listenersSetupRef.current = false
    }
  }, [onReceiveNotification, onConnectionStateChange, onError])

  // Memoized methods
  const connect = useCallback(async () => {
    console.log('🚀 Connecting via hook...')
    await notificationSignalRService.connect()
  }, [])

  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting via hook...')
    await notificationSignalRService.disconnect()
    // Clear notifications when disconnecting
    setNotifications([])
  }, [])

  const forceConnect = useCallback(async () => {
    console.log('🔧 Force connecting via hook...')
    await notificationSignalRService.forceConnect()
  }, [])

  const forceDisconnect = useCallback(async () => {
    console.log('🔧 Force disconnecting via hook...')
    await notificationSignalRService.forceDisconnect()
    // Clear notifications when disconnecting
    setNotifications([])
  }, [])

  const clearNotifications = useCallback(() => {
    console.log('🧹 Clearing notifications')
    setNotifications([])
  }, [])

  const markAsReadLocally = useCallback((notificationId: string) => {
    console.log(`✅ Marking notification as read locally: ${notificationId}`)
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)))
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    console.log(`🗑️ Removing notification locally: ${notificationId}`)
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
