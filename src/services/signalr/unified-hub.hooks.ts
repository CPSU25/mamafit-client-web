import { useEffect, useRef, useState } from 'react'
import { unifiedHubService, type UnifiedHubEventMap, type EventCallback } from './unified-hub.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

// ===== CONNECTION STATUS HOOK =====
export function useUnifiedHubConnection() {
  const [connectionState, setConnectionState] = useState(unifiedHubService.connectionState)
  const [isConnected, setIsConnected] = useState(unifiedHubService.isConnected)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      setIsConnected(false)
      setConnectionState('Disconnected')
      return
    }

    // Update state từ service
    const updateConnectionInfo = () => {
      const info = unifiedHubService.getConnectionInfo()
      setIsConnected(info.isConnected)
      setConnectionState(info.state)
      setReconnectAttempts(info.reconnectAttempts)
    }

    // Listen to connection state changes
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected)
      updateConnectionInfo()
    }

    const handleReconnecting = () => {
      updateConnectionInfo()
    }

    const handleReconnected = () => {
      updateConnectionInfo()
    }

    // Subscribe to events
    unifiedHubService.on('connectionStateChange', handleConnectionChange)
    unifiedHubService.on('reconnecting', handleReconnecting)
    unifiedHubService.on('reconnected', handleReconnected)

    // Initial state update
    updateConnectionInfo()

    // Cleanup
    return () => {
      unifiedHubService.off('connectionStateChange', handleConnectionChange)
      unifiedHubService.off('reconnecting', handleReconnecting)
      unifiedHubService.off('reconnected', handleReconnected)
    }
  }, [isAuthenticated])

  const connect = async () => {
    try {
      await unifiedHubService.connect()
    } catch (error) {
      console.error('❌ Failed to connect UnifiedHub:', error)
    }
  }

  const disconnect = async () => {
    try {
      await unifiedHubService.disconnect()
    } catch (error) {
      console.error('❌ Failed to disconnect UnifiedHub:', error)
    }
  }

  return {
    isConnected,
    connectionState,
    reconnectAttempts,
    connect,
    disconnect,
    connectionInfo: unifiedHubService.getConnectionInfo()
  }
}

// ===== EVENT LISTENER HOOK =====
export function useUnifiedHubEvent<K extends keyof UnifiedHubEventMap>(
  event: K,
  callback: EventCallback<K>
) {
  const callbackRef = useRef(callback)
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const wrappedCallback: EventCallback<K> = (...args) => {
      callbackRef.current(...args)
    }

    unifiedHubService.on(event, wrappedCallback)

    return () => {
      unifiedHubService.off(event, wrappedCallback)
    }
  }, [event])
}

// ===== ORDER UPDATES HOOK =====
export function useOrderUpdates(
  orderId?: string,
  options: {
    onStatusChange?: (event: UnifiedHubEventMap['ORDER_STATUS_CHANGED'][0]) => void
    onPaymentReceived?: (event: UnifiedHubEventMap['PAYMENT_RECEIVED'][0]) => void
  } = {}
) {
  const [lastOrderUpdate, setLastOrderUpdate] = useState<UnifiedHubEventMap['ORDER_STATUS_CHANGED'][0] | null>(null)
  const [lastPayment, setLastPayment] = useState<UnifiedHubEventMap['PAYMENT_RECEIVED'][0] | null>(null)

  useUnifiedHubEvent('ORDER_STATUS_CHANGED', (event) => {
    if (!orderId || event.orderId === orderId) {
      setLastOrderUpdate(event)
      options.onStatusChange?.(event)
    }
  })

  useUnifiedHubEvent('PAYMENT_RECEIVED', (event) => {
    if (!orderId || event.orderId === orderId) {
      setLastPayment(event)
      options.onPaymentReceived?.(event)
    }
  })

  return {
    lastOrderUpdate,
    lastPayment,
    hasUpdates: !!lastOrderUpdate || !!lastPayment
  }
}

// ===== TASK UPDATES HOOK =====
export function useTaskUpdates(
  taskId?: string,
  options: {
    onStatusChange?: (event: UnifiedHubEventMap['TASK_STATUS_CHANGED'][0]) => void
  } = {}
) {
  const [lastTaskUpdate, setLastTaskUpdate] = useState<UnifiedHubEventMap['TASK_STATUS_CHANGED'][0] | null>(null)
  const [taskHistory, setTaskHistory] = useState<UnifiedHubEventMap['TASK_STATUS_CHANGED'][0][]>([])

  useUnifiedHubEvent('TASK_STATUS_CHANGED', (event) => {
    if (!taskId || event.taskId === taskId) {
      setLastTaskUpdate(event)
      setTaskHistory(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 updates
      options.onStatusChange?.(event)
    }
  })

  return {
    lastTaskUpdate,
    taskHistory,
    hasUpdates: !!lastTaskUpdate
  }
}

// ===== NOTIFICATION HOOK =====
export function useNotificationUpdates(
  options: {
    onNotificationReceived?: (event: UnifiedHubEventMap['NOTIFICATION_CREATED'][0]) => void
    filterByType?: string[]
    filterByPriority?: string[]
  } = {}
) {
  const [notifications, setNotifications] = useState<UnifiedHubEventMap['NOTIFICATION_CREATED'][0][]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useUnifiedHubEvent('NOTIFICATION_CREATED', (event) => {
    // Apply filters
    if (options.filterByType && !options.filterByType.includes(event.type)) {
      return
    }
    
    if (options.filterByPriority && !options.filterByPriority.includes(event.priority)) {
      return
    }

    setNotifications(prev => [event, ...prev.slice(0, 49)]) // Keep last 50 notifications
    setUnreadCount(prev => prev + 1)
    options.onNotificationReceived?.(event)
  })

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true } 
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
    setUnreadCount(0)
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
}

// ===== CHAT UPDATES HOOK =====
export function useChatUpdates(
  roomId?: string,
  options: {
    onMessageReceived?: (event: UnifiedHubEventMap['CHAT_MESSAGE_SENT'][0]) => void
  } = {}
) {
  const [lastMessage, setLastMessage] = useState<UnifiedHubEventMap['CHAT_MESSAGE_SENT'][0] | null>(null)
  const [messageHistory, setMessageHistory] = useState<UnifiedHubEventMap['CHAT_MESSAGE_SENT'][0][]>([])

  useUnifiedHubEvent('CHAT_MESSAGE_SENT', (event) => {
    if (!roomId || event.roomId === roomId) {
      setLastMessage(event)
      setMessageHistory(prev => [...prev, event].slice(-50)) // Keep last 50 messages
      options.onMessageReceived?.(event)
    }
  })

  return {
    lastMessage,
    messageHistory,
    hasNewMessages: !!lastMessage
  }
}

// ===== USER STATUS HOOK =====
export function useUserStatus(
  userId?: string,
  options: {
    onUserOnline?: (event: UnifiedHubEventMap['USER_ONLINE'][0]) => void
    onUserOffline?: (event: UnifiedHubEventMap['USER_OFFLINE'][0]) => void
  } = {}
) {
  const [userStatuses, setUserStatuses] = useState<Map<string, UnifiedHubEventMap['USER_ONLINE'][0]>>(new Map())

  useUnifiedHubEvent('USER_ONLINE', (event) => {
    if (!userId || event.userId === userId) {
      setUserStatuses(prev => new Map(prev.set(event.userId, event)))
      options.onUserOnline?.(event)
    }
  })

  useUnifiedHubEvent('USER_OFFLINE', (event) => {
    if (!userId || event.userId === userId) {
      setUserStatuses(prev => {
        const newMap = new Map(prev)
        newMap.delete(event.userId)
        return newMap
      })
      options.onUserOffline?.(event)
    }
  })

  const getUserStatus = (targetUserId: string) => {
    return userStatuses.get(targetUserId)
  }

  const isUserOnline = (targetUserId: string) => {
    return userStatuses.has(targetUserId)
  }

  return {
    userStatuses: Array.from(userStatuses.values()),
    getUserStatus,
    isUserOnline,
    onlineUserCount: userStatuses.size
  }
}

// ===== SYSTEM UPDATES HOOK =====
export function useSystemUpdates(
  options: {
    onSystemUpdate?: (event: UnifiedHubEventMap['SYSTEM_UPDATE'][0]) => void
    filterBySeverity?: string[]
  } = {}
) {
  const [systemUpdates, setSystemUpdates] = useState<UnifiedHubEventMap['SYSTEM_UPDATE'][0][]>([])
  const [criticalAlerts, setCriticalAlerts] = useState<UnifiedHubEventMap['SYSTEM_UPDATE'][0][]>([])

  useUnifiedHubEvent('SYSTEM_UPDATE', (event) => {
    // Apply severity filter
    if (options.filterBySeverity && !options.filterBySeverity.includes(event.severity)) {
      return
    }

    setSystemUpdates(prev => [event, ...prev.slice(0, 19)]) // Keep last 20 updates
    
    if (event.severity === 'CRITICAL') {
      setCriticalAlerts(prev => [event, ...prev.slice(0, 9)]) // Keep last 10 critical alerts
    }
    
    options.onSystemUpdate?.(event)
  })

  const dismissAlert = (updateType: string, scheduledAt?: string) => {
    setCriticalAlerts(prev => 
      prev.filter(alert => 
        !(alert.updateType === updateType && alert.scheduledAt === scheduledAt)
      )
    )
  }

  return {
    systemUpdates,
    criticalAlerts,
    hasCriticalAlerts: criticalAlerts.length > 0,
    dismissAlert
  }
}

// ===== AUTO-CONNECT HOOK =====
export function useUnifiedHubAutoConnect(enabled = true) {
  const { isAuthenticated } = useAuthStore()
  const connectionRef = useRef<boolean>(false)

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      connectionRef.current = false
      return
    }

    // Avoid multiple connections
    if (connectionRef.current) return

    const connectToHub = async () => {
      try {
        console.log('🔌 Auto-connecting to UnifiedHub...')
        await unifiedHubService.connect()
        connectionRef.current = true
      } catch (error) {
        console.error('❌ Auto-connect to UnifiedHub failed:', error)
        connectionRef.current = false
      }
    }

    connectToHub()

    // Cleanup on unmount or auth change
    return () => {
      if (connectionRef.current) {
        console.log('🔌 Auto-disconnecting from UnifiedHub...')
        unifiedHubService.disconnect()
        connectionRef.current = false
      }
    }
  }, [enabled, isAuthenticated])

  return {
    isAutoConnected: connectionRef.current
  }
}

// ===== REALTIME DATA SYNC HOOK =====
export function useRealtimeSync(
  queryKey: string[],
  options: {
    events?: (keyof UnifiedHubEventMap)[]
    invalidateOnEvents?: boolean
    refetchOnEvents?: boolean
  } = {}
) {
  const { events = [], invalidateOnEvents = true } = options

  // This would integrate with React Query to invalidate/refetch queries
  // when realtime events are received
  useEffect(() => {
    if (events.length === 0) return

    const handleEvent = () => {
      if (invalidateOnEvents) {
        // Example: queryClient.invalidateQueries({ queryKey })
        console.log('🔄 Invalidating queries due to realtime event:', queryKey)
      }
    }

    // Subscribe to multiple events
    events.forEach(event => {
      unifiedHubService.on(event as keyof UnifiedHubEventMap, handleEvent)
    })

    return () => {
      events.forEach(event => {
        unifiedHubService.off(event as keyof UnifiedHubEventMap, handleEvent)
      })
    }
  }, [queryKey, events, invalidateOnEvents])
}

// ===== GROUP MANAGEMENT HOOK =====
export function useGroupManagement() {
  const [joinedGroups, setJoinedGroups] = useState<string[]>([])

  useEffect(() => {
    // Update joined groups from service
    const updateGroups = () => {
      setJoinedGroups(unifiedHubService.joinedGroupsList)
    }

    // Listen for connection changes to update groups
    unifiedHubService.on('connectionStateChange', updateGroups)
    
    // Initial update
    updateGroups()

    return () => {
      unifiedHubService.off('connectionStateChange', updateGroups)
    }
  }, [])

  const joinGroup = async (groupName: string) => {
    try {
      await unifiedHubService.joinGroup(groupName)
      setJoinedGroups(unifiedHubService.joinedGroupsList)
    } catch (error) {
      console.error('❌ Failed to join group:', error)
      throw error
    }
  }

  const leaveGroup = async (groupName: string) => {
    try {
      await unifiedHubService.leaveGroup(groupName)
      setJoinedGroups(unifiedHubService.joinedGroupsList)
    } catch (error) {
      console.error('❌ Failed to leave group:', error)
      throw error
    }
  }

  return {
    joinedGroups,
    joinGroup,
    leaveGroup,
    isInGroup: (groupName: string) => joinedGroups.includes(groupName)
  }
}