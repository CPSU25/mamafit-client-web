import { useState, useEffect, useCallback } from 'react'
import { signalRService } from '@/services/chat/signalr.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ChatMessage, ChatRoom } from '@/@types/chat.types'
import chatAPI from '@/apis/chat.api'
import { type Convo } from '../data/chat-types'

export interface UseChatReturn {
  isConnected: boolean
  connectionStatus: string

  joinRoom: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, message: string) => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
  loadRooms: () => Promise<void>
  rooms: ChatRoom[]
  messages: Record<string, Convo[]>
  isLoading: boolean
  isLoadingRooms: boolean
  error: string | null
  loadedRooms: Set<string>
}

export function useChat(): UseChatReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Record<string, Convo[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedRooms, setLoadedRooms] = useState<Set<string>>(new Set())
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set()) // Track joined rooms
  const [hasLoadedRooms, setHasLoadedRooms] = useState(false) // Track if rooms have been loaded

  const { user } = useAuthStore()

  // Map ChatMessage to Convo format for UI
  const mapChatMessageToConvo = useCallback(
    (msg: ChatMessage): Convo => {
      return {
        message: msg.message,
        timestamp: new Date(msg.messageTimestamp),
        sender: msg.senderId === user?.userId ? 'You' : msg.senderName
      }
    },
    [user?.userId]
  )
  // Load user's chat rooms from API
  const loadRooms = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRooms || hasLoadedRooms) {
      console.log('⏭️ Rooms already loaded or currently loading')
      return
    }

    try {
      setIsLoadingRooms(true)
      setError(null)

      const response = await chatAPI.getMyRooms()
      const roomsData = response.data.data || []

      setRooms(roomsData)
      setHasLoadedRooms(true) // Mark as loaded
      console.log('✅ Loaded', roomsData.length, 'chat rooms')

      // Auto-join all rooms for SignalR
      if (isConnected && roomsData.length > 0) {
        for (const room of roomsData) {
          if (!joinedRooms.has(room.id)) {
            try {
              await signalRService.joinRoom(room.id)
              setJoinedRooms((prev) => new Set([...prev, room.id]))
              console.log(`✅ Auto-joined room: ${room.id}`)
            } catch (err) {
              console.error(`❌ Failed to join room ${room.id}:`, err)
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rooms'
      setError(errorMessage)
      console.error('❌ Failed to load rooms:', err)
    } finally {
      setIsLoadingRooms(false)
    }
  }, [isConnected, joinedRooms, isLoadingRooms, hasLoadedRooms]) // Add hasLoadedRooms dependency

  // Load messages for a specific room (only once per room)
  const loadMessages = useCallback(
    async (roomId: string) => {
      // Skip if already loaded
      if (loadedRooms.has(roomId)) {
        console.log(`⏭️ Messages already loaded for room: ${roomId}`)
        return
      }

      try {
        setError(null)
        setIsLoading(true)
        await signalRService.loadMessages(roomId)

        // Mark room as loaded
        setLoadedRooms((prev) => new Set([...prev, roomId]))
        console.log(`✅ Messages loaded for room ${roomId}`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load messages'
        setError(errorMessage)
        console.error('❌ Failed to load messages:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [loadedRooms]
  )

  // Setup SignalR event listeners
  useEffect(() => {
    const handleReceiveMessage = (...args: unknown[]) => {
      const message = args[0] as ChatMessage
      console.log('📨 Received message:', message)
      const convo = mapChatMessageToConvo(message)

      setMessages((prev) => ({
        ...prev,
        [message.chatRoomId]: [convo, ...(prev[message.chatRoomId] || [])]
      }))
    }

    const handleMessageHistory = (...args: unknown[]) => {
      const messageList = args[0] as ChatMessage[]
      console.log('📜 Received message history:', messageList)

      if (messageList.length > 0) {
        const roomId = messageList[0].chatRoomId
        const convos = messageList
          .map(mapChatMessageToConvo)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

        setMessages((prev) => ({
          ...prev,
          [roomId]: convos
        }))
      }
    }

    signalRService.on('ReceiveMessage', handleReceiveMessage)
    signalRService.on('MessageHistory', handleMessageHistory)

    return () => {
      signalRService.off('ReceiveMessage', handleReceiveMessage)
      signalRService.off('MessageHistory', handleMessageHistory)
    }
  }, [mapChatMessageToConvo])

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = signalRService.isConnected
      setIsConnected(connected)
      setConnectionStatus(connected ? 'Connected' : 'Disconnected')
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const joinRoom = useCallback(
    async (roomId: string) => {
      // Skip if already joined
      if (joinedRooms.has(roomId)) {
        console.log(`⏭️ Already joined room: ${roomId}`)
        return
      }

      try {
        setError(null)
        await signalRService.joinRoom(roomId)
        console.log(`✅ Joined room: ${roomId}`)

        // Track that we've joined this room
        setJoinedRooms((prev) => new Set([...prev, roomId]))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to join room'
        setError(errorMessage)
        console.error('❌ Failed to join room:', err)
        throw err // Re-throw to let caller handle error
      }
    },
    [joinedRooms]
  )

  const sendMessage = useCallback(async (roomId: string, message: string) => {
    try {
      setError(null)
      await signalRService.sendMessage(roomId, message)
      console.log(`✅ Message sent to room ${roomId}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('❌ Failed to send message:', err)
    }
  }, [])

  return {
    isConnected,
    connectionStatus,
    joinRoom,
    sendMessage,
    loadMessages,
    loadRooms,
    rooms,
    messages,
    isLoading,
    isLoadingRooms,
    error,
    loadedRooms
  }
}
