import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { notificationSignalRService } from '@/services/notification/notification-signalr.service'
import { 
  NotificationResponseDto, 
  UseNotificationReturn 
} from '@/@types/notification.types'

export const useNotificationSignalR = (): UseNotificationReturn => {
  const { isAuthenticated, user } = useAuthStore()
  
  // State management
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // Refs to prevent duplicate operations
  const isConnectedRef = useRef(false)
  const listenersSetupRef = useRef(false)
  const loadedPages = useRef(new Set<number>())

  // Clear error handler
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load notifications with pagination
  const loadNotifications = useCallback(async (page: number = 1, pageSize: number = 10) => {
    if (!notificationSignalRService.isConnected) {
      setError('Không có kết nối đến notification server')
      return
    }

    // Prevent duplicate loads for the same page
    if (loadedPages.current.has(page) && page !== 1) {
      console.log(`⏭️ Page ${page} already loaded, skipping`)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log(`📋 Loading notifications - Page: ${page}, PageSize: ${pageSize}`)
      await notificationSignalRService.getUserNotifications(page, pageSize)
      
      // Mark page as loaded
      loadedPages.current.add(page)
      setCurrentPage(page)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications'
      setError(errorMessage)
      console.error('❌ Failed to load notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!notificationSignalRService.isConnected) {
      setError('Không có kết nối đến notification server')
      return
    }

    try {
      setError(null)
      console.log(`✅ Marking notification as read: ${notificationId}`)
      await notificationSignalRService.markNotificationAsRead(notificationId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read'
      setError(errorMessage)
      console.error('❌ Failed to mark notification as read:', err)
    }
  }, [])

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    if (!notificationSignalRService.isConnected) {
      setError('Không có kết nối đến notification server')
      return
    }

    try {
      setError(null)
      console.log('📊 Getting unread notification count')
      await notificationSignalRService.getUnreadNotificationCount()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get unread count'
      setError(errorMessage)
      console.error('❌ Failed to get unread count:', err)
    }
  }, [])

  // Connection management
  const connect = useCallback(async () => {
    if (isConnectedRef.current || notificationSignalRService.isConnected) {
      console.log('⏭️ Already connected to notification hub')
      return
    }

    try {
      console.log('🚀 Connecting to notification hub...')
      await notificationSignalRService.connect()
      isConnectedRef.current = true
      console.log('✅ Connected to notification hub')
      
      // Load initial data after connection
      await getUnreadCount()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to notification hub'
      setError(errorMessage)
      console.error('❌ Failed to connect to notification hub:', err)
    }
  }, [getUnreadCount])

  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting from notification hub...')
      await notificationSignalRService.disconnect()
      isConnectedRef.current = false
      
      // Reset state
      setNotifications([])
      setUnreadCount(0)
      setCurrentPage(1)
      setHasMore(true)
      loadedPages.current.clear()
      
      console.log('✅ Disconnected from notification hub')
    } catch (err) {
      console.error('❌ Failed to disconnect from notification hub:', err)
    }
  }, [])

  // Setup SignalR event listeners
  useEffect(() => {
    if (!isAuthenticated || !user || listenersSetupRef.current) {
      return
    }

    console.log('🔧 Setting up notification SignalR event listeners')
    listenersSetupRef.current = true

    // Handler for new notifications
    const handleReceiveNotification = (...args: unknown[]) => {
      const notification = args[0] as NotificationResponseDto
      console.log('🔔 Received new notification:', notification)
      
      // Add new notification to the top of the list
      setNotifications(prev => [notification, ...prev])
      
      // Increment unread count if notification is unread
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1)
      }
    }

    // Handler for unread count updates
    const handleUnreadCountUpdate = (...args: unknown[]) => {
      const count = args[0] as number
      console.log('📊 Unread count updated:', count)
      setUnreadCount(count)
    }

    // Handler for notification marked as read
    const handleNotificationMarkedAsRead = (...args: unknown[]) => {
      const notificationId = args[0] as string
      console.log('✅ Notification marked as read:', notificationId)
      
      // Update notification in the list
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ))
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Handler for notifications list
    const handleUserNotifications = (...args: unknown[]) => {
      const notificationsList = args[0] as NotificationResponseDto[]
      console.log('📋 Notifications list received:', notificationsList)
      
      if (currentPage === 1) {
        // Replace all notifications for first page
        setNotifications(notificationsList)
      } else {
        // Append notifications for subsequent pages
        setNotifications(prev => [...prev, ...notificationsList])
      }
      
      // Update hasMore based on received data
      setHasMore(notificationsList.length === 10) // Assuming pageSize is 10
    }

    // Handler for errors
    const handleError = (...args: unknown[]) => {
      const errorMessage = args[0] as string
      console.error('❌ Notification SignalR Error:', errorMessage)
      setError(errorMessage)
    }

    // Attach event listeners
    notificationSignalRService.on('ReceiveNotification', handleReceiveNotification)
    notificationSignalRService.on('UnreadNotificationCount', handleUnreadCountUpdate)
    notificationSignalRService.on('NotificationMarkedAsRead', handleNotificationMarkedAsRead)
    notificationSignalRService.on('UserNotifications', handleUserNotifications)
    notificationSignalRService.on('Error', handleError)

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up notification SignalR event listeners')
      notificationSignalRService.off('ReceiveNotification', handleReceiveNotification)
      notificationSignalRService.off('UnreadNotificationCount', handleUnreadCountUpdate)
      notificationSignalRService.off('NotificationMarkedAsRead', handleNotificationMarkedAsRead)
      notificationSignalRService.off('UserNotifications', handleUserNotifications)
      notificationSignalRService.off('Error', handleError)
      
      listenersSetupRef.current = false
    }
  }, [isAuthenticated, user?.userId, currentPage])

  // Auto-connect/disconnect based on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }
  }, [isAuthenticated, user?.userId, connect, disconnect])

  // Return hook interface
  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isConnected: notificationSignalRService.isConnected,

    // Actions
    loadNotifications,
    markAsRead,
    getUnreadCount,
    clearError,
    
    // Connection management
    connect,
    disconnect
  }
} 