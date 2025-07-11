import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { chatService, useMyRooms, useCreateRoom, useChatCache } from '@/services/chat/chat.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ChatMessage, ChatRoom } from '@/@types/chat.types'
import { type Convo } from '../data/chat-types'

export interface UseChatReturn {
  isConnected: boolean
  connectionStatus: string

  joinRoom: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, message: string) => Promise<void>
  loadMessages: (roomId: string) => void
  loadRooms: () => void
  createRoom: (userId1: string, userId2: string) => Promise<ChatRoom>
  rooms: ChatRoom[]
  messages: Record<string, Convo[]>
  isLoading: boolean
  isLoadingRooms: boolean
  error: string | null
  loadedRooms: Set<string>
  onlineUsers: Set<string>
  lastCreatedRoomId: string | null
  lastInvitedRoomId: string | null
}

export function useChat(): UseChatReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [messages, setMessages] = useState<Record<string, Convo[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [loadedRooms, setLoadedRooms] = useState<Set<string>>(new Set())
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [lastCreatedRoomId, setLastCreatedRoomId] = useState<string | null>(null)
  const [lastInvitedRoomId, setLastInvitedRoomId] = useState<string | null>(null)
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set())
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const listenersSetupRef = useRef(false)
  const { user } = useAuthStore()

  const { data: roomsData, isLoading: isLoadingRooms, error: roomsError, refetch: refetchRooms } = useMyRooms()
  const rooms = useMemo(() => roomsData || [], [roomsData])
  const createRoomMutation = useCreateRoom()
  const chatCache = useChatCache()
  const memoizedUser = useMemo(() => user, [user?.userId, user?.fullName])

  const mapChatMessageToConvo = useCallback(
    (msg: ChatMessage): Convo => {
      return {
        message: msg.message,
        timestamp: new Date(msg.messageTimestamp),
        sender: msg.senderId === memoizedUser?.userId ? 'You' : msg.senderName
      }
    },
    [memoizedUser?.userId]
  )

  const loadRooms = useCallback(() => {
    console.log('🔄 Refreshing rooms via React Query...')
    refetchRooms()
  }, [refetchRooms])
  const createRoom = useCallback(
    async (userId1: string, userId2: string): Promise<ChatRoom> => {
      try {
        setError(null)
        const result = await createRoomMutation.mutateAsync({ userId1, userId2 })
        setLastCreatedRoomId(result.id) // <-- Track phòng vừa tạo
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create room'
        setError(errorMessage)
        throw err
      }
    },
    [createRoomMutation]
  )

  const loadMessages = useCallback((roomId: string) => {
    console.log(`📜 Loading messages for room ${roomId} - handled by React Query`)
    setLoadedRooms((prev) => new Set([...prev, roomId]))
  }, [])
  const joinRoom = useCallback(
    async (roomId: string) => {
      // Skip if already joined
      if (joinedRooms.has(roomId)) {
        console.log(`⏭️ Room ${roomId} already joined`)
        return
      }

      try {
        setError(null)
        console.log(`🏠 Joining room via SignalR: ${roomId}`)
        await chatService.joinRoom(roomId)
        console.log(`✅ Join room request sent: ${roomId}`)

        // Note: JoinedRoom event will update joinedRooms state
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join room'
        setError(errorMessage)
        console.error('❌ Failed to join room:', err)
        throw err
      }
    },
    [joinedRooms]
  )
  // ===== SIGNALR REALTIME EVENT HANDLERS =====

  // Setup SignalR event listeners (only for realtime events)
  useEffect(() => {
    // Prevent duplicate listener setup
    if (listenersSetupRef.current) {
      console.log('⏭️ Event listeners already setup, skipping')
      return
    }

    console.log('🔧 Setting up SignalR realtime event listeners')
    listenersSetupRef.current = true

    const handleReceiveMessage = (...args: unknown[]) => {
      const message = args[0] as ChatMessage
      console.log('📨 Received realtime message:', message)

      // Prevent duplicate message processing using message ID
      const messageId = message.id || `${message.chatRoomId}-${message.messageTimestamp || Date.now()}`

      if (processedMessages.has(messageId)) {
        console.log('⏭️ Skipping duplicate message:', messageId)
        return
      }

      // Mark message as processed (with cleanup to prevent memory leak)
      setProcessedMessages((prev) => {
        const newSet = new Set([...prev, messageId])

        // Clean up old message IDs to prevent memory leak (keep last 1000)
        if (newSet.size > 1000) {
          const recentIds = Array.from(newSet).slice(-1000)
          return new Set(recentIds)
        }

        return newSet
      })

      const convo = mapChatMessageToConvo(message)

      // Update messages for the chat room
      setMessages((prev) => ({
        ...prev,
        [message.chatRoomId]: [convo, ...(prev[message.chatRoomId] || [])]
      }))

      // Update React Query cache with latest message info
      chatCache.updateRoomLastMessage(message.chatRoomId, message.message, message.senderId, message.senderName)
    }

    const handleUserOnline = (...args: unknown[]) => {
      const userId = args[0] as string
      const userName = args[1] as string
      console.log('🟢 User came online:', { userId, userName })
      setOnlineUsers((prev) => new Set([...prev, userId]))
    }

    const handleUserOffline = (...args: unknown[]) => {
      const userId = args[0] as string
      const userName = args[1] as string
      console.log('🔴 User went offline:', { userId, userName })
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }

    const handleJoinedRoom = (...args: unknown[]) => {
      const roomId = args[0] as string
      console.log('🏠 Successfully joined room via SignalR:', roomId)
      setJoinedRooms((prev) => new Set([...prev, roomId]))
    }

    const handleLeftRoom = (...args: unknown[]) => {
      const roomId = args[0] as string
      console.log('🚪 Successfully left room via SignalR:', roomId)
      setJoinedRooms((prev) => {
        const newSet = new Set(prev)
        newSet.delete(roomId)
        return newSet
      })
    }

    const handleMessageSent = (...args: unknown[]) => {
      const messageId = args[0] as string
      const timestamp = args[1] as Date
      console.log('✅ Message sent confirmation via SignalR:', { messageId, timestamp })
    }

    const handleOnlineUsersList = (...args: unknown[]) => {
      const users = args[0] as Array<{ userId: string; userName?: string; isOnline: boolean }>
      console.log('👥 Online users list received:', users)

      const onlineUserIds = users.filter((user) => user.isOnline).map((user) => user.userId)

      setOnlineUsers(new Set(onlineUserIds))
    }

    const handleError = (...args: unknown[]) => {
      const errorMessage = args[0] as string
      console.error('❌ SignalR Error:', errorMessage)
      setError(errorMessage)
    }

    // ===== LEGACY EVENT HANDLERS (for backward compatibility) =====

    const handleRoomCreated = (...args: unknown[]) => {
      const roomId = args[0] as string
      console.log('⚠️ [DEPRECATED] Room created via SignalR event:', roomId)

      // Invalidate React Query cache to refetch updated rooms
      chatCache.invalidateRooms()
    }

    const handleLoadRoom = () => {
      console.log('⚠️ [DEPRECATED] LoadRoom event - data now managed by React Query')
      // Do nothing, React Query handles rooms data
    }

    const handleMessageHistory = () => {
      console.log('⚠️ [DEPRECATED] MessageHistory event - data now managed by React Query')
      // Do nothing, React Query handles message history
    }

    const handleNoRooms = () => {
      console.log('⚠️ [DEPRECATED] NoRooms event - handled by React Query')
    }

    const handleNoMessages = () => {
      console.log('⚠️ [DEPRECATED] NoMessages event - handled by React Query')
    }
    const handleInvitedToRoom = async (...args: unknown[]) => {
      const roomId = args[0] as string
      console.log('👥 Được mời vào phòng mới:', roomId)
      try {
        await joinRoom(roomId)
        chatCache.invalidateRooms()
        setLastInvitedRoomId(roomId) // invalidate rooms cache để UI cập nhật ngay
      } catch (err) {
        console.error('❌ Không thể join room được mời:', err)
      }
    }

    // Register realtime event listeners
    chatService.on('ReceiveMessage', handleReceiveMessage)
    chatService.on('UserOnline', handleUserOnline)
    chatService.on('UserOffline', handleUserOffline)
    chatService.on('ListOnlineUsers', handleOnlineUsersList)
    chatService.on('JoinedRoom', handleJoinedRoom)
    chatService.on('LeftRoom', handleLeftRoom)
    chatService.on('MessageSent', handleMessageSent)
    chatService.on('Error', handleError)
    chatService.on('InvitedToRoom', handleInvitedToRoom)

    return () => {
      console.log('🧹 Cleaning up SignalR event listeners')

      // Remove realtime event listeners
      chatService.off('InvitedToRoom', handleInvitedToRoom)
      chatService.off('ReceiveMessage', handleReceiveMessage)
      chatService.off('UserOnline', handleUserOnline)
      chatService.off('UserOffline', handleUserOffline)
      chatService.off('ListOnlineUsers', handleOnlineUsersList)
      chatService.off('JoinedRoom', handleJoinedRoom)
      chatService.off('LeftRoom', handleLeftRoom)
      chatService.off('MessageSent', handleMessageSent)
      chatService.off('Error', handleError)

      // Remove legacy event listeners
      chatService.off('RoomCreated', handleRoomCreated)
      chatService.off('LoadRoom', handleLoadRoom)
      chatService.off('MessageHistory', handleMessageHistory)
      chatService.off('NoRooms', handleNoRooms)
      chatService.off('NoMessages', handleNoMessages)

      // Reset ref to allow re-setup if needed
      listenersSetupRef.current = false
    }
  }, [mapChatMessageToConvo, chatCache, processedMessages, joinRoom])

  // Monitor connection status with optimized interval
  useEffect(() => {
    // Clear existing interval
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current)
    }

    // Set up optimized connection monitoring
    connectionCheckIntervalRef.current = setInterval(() => {
      const connected = chatService.isConnected
      const newStatus = connected ? 'Connected' : 'Disconnected'

      // Only update if status actually changed
      if (isConnected !== connected) {
        setIsConnected(connected)
      }
      if (connectionStatus !== newStatus) {
        setConnectionStatus(newStatus)
      }
    }, 2000) // Check every 2 seconds

    return () => {
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current)
      }
    }
  }, [isConnected, connectionStatus])

  // Sync React Query errors with local error state
  useEffect(() => {
    if (roomsError) {
      const errorMessage = roomsError instanceof Error ? roomsError.message : 'Failed to load rooms'
      setError(errorMessage)
    } else if (createRoomMutation.error) {
      const errorMessage =
        createRoomMutation.error instanceof Error ? createRoomMutation.error.message : 'Failed to create room'
      setError(errorMessage)
    } else {
      setError(null)
    }
  }, [roomsError, createRoomMutation.error])

  // ===== SIGNALR ROOM OPERATIONS =====

  const sendMessage = useCallback(
    async (roomId: string, message: string) => {
      try {
        setError(null)
        console.log(`💬 Sending message via SignalR: ${roomId}`)
        await chatService.sendMessage(roomId, message)
        console.log(`✅ Message sent via SignalR`)

        // Optimistically update React Query cache
        chatCache.updateRoomLastMessage(
          roomId,
          message,
          memoizedUser?.userId || '',
          (memoizedUser?.fullName as string) || 'You'
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        console.error('❌ Failed to send message:', err)
      }
    },
    [memoizedUser?.userId, memoizedUser?.fullName, chatCache]
  )

  return {
    isConnected,
    connectionStatus,
    joinRoom,
    sendMessage,
    loadMessages,
    loadRooms,
    createRoom,
    rooms,
    messages,
    isLoading: Boolean(createRoomMutation.isPending), // Use mutation loading state
    isLoadingRooms,
    error,
    loadedRooms,
    onlineUsers,
    lastCreatedRoomId,
    lastInvitedRoomId
  }
}
