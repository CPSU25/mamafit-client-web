import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { signalRService } from '@/services/chat/signalr.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ChatMessage, ChatRoom, Member } from '@/@types/chat.types'
import { type Convo } from '../data/chat-types'

export interface UseChatReturn {
  isConnected: boolean
  connectionStatus: string

  joinRoom: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, message: string) => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
  loadRooms: () => Promise<void>
  createRoom: (userId1: string, userId2: string) => Promise<ChatRoom>
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
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set())
  const [hasLoadedRooms, setHasLoadedRooms] = useState(false)

  // Use refs to prevent unnecessary re-renders
  const loadRoomsCalledRef = useRef(false)
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [createRoomPromise, setCreateRoomPromise] = useState<{
    resolve: (room: ChatRoom) => void
    reject: (error: Error) => void
  } | null>(null)

  const [loadRoomsPromise, setLoadRoomsPromise] = useState<{
    resolve: (rooms: ChatRoom[]) => void
    reject: (error: Error) => void
  } | null>(null)

  const { user } = useAuthStore()

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => user, [user?.userId, user?.fullName])

  // Map ChatMessage to Convo format for UI (memoized)
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

  // Load user's chat rooms from SignalR
  const loadRooms = useCallback(async () => {
    // Prevent multiple simultaneous loads using ref
    if (isLoadingRooms || hasLoadedRooms || loadRoomsCalledRef.current) {
      console.log('⏭️ Rooms already loaded or currently loading - skipping duplicate call')
      return
    }

    // Mark as called to prevent duplicates
    loadRoomsCalledRef.current = true

    return new Promise<void>((resolve, reject) => {
      // Store promise handlers để xử lý trong event listeners
      setLoadRoomsPromise({
        resolve: (rooms: ChatRoom[]) => {
          setRooms(rooms)
          setHasLoadedRooms(true)
          loadRoomsCalledRef.current = false // Reset after completion
          resolve()
        },
        reject: (error) => {
          loadRoomsCalledRef.current = false // Reset on error
          reject(error)
        }
      })

      setIsLoadingRooms(true)
      setError(null)

      // Gọi SignalR method
      signalRService.loadRoom().catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load rooms'
        setError(errorMessage)
        console.error('❌ Failed to load rooms:', err)
        reject(err)
        setLoadRoomsPromise(null)
        setIsLoadingRooms(false)
        loadRoomsCalledRef.current = false // Reset on error
      })
    })
  }, [isLoadingRooms, hasLoadedRooms])

  const createRoom = useCallback(async (userId1: string, userId2: string): Promise<ChatRoom> => {
    return new Promise<ChatRoom>((resolve, reject) => {
      // Store promise handlers để xử lý trong event listeners
      setCreateRoomPromise({ resolve, reject })

      // Set error state về null khi bắt đầu
      setError(null)

      // Gọi SignalR method
      signalRService.createRoom(userId1, userId2).catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create room'
        setError(errorMessage)
        console.error('❌ Failed to create room:', err)
        reject(err)
        setCreateRoomPromise(null)
      })
    })
  }, [])

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

      // Update messages for the chat room
      setMessages((prev) => ({
        ...prev,
        [message.chatRoomId]: [convo, ...(prev[message.chatRoomId] || [])]
      }))

      // Update room list with latest message info
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) =>
          room.id === message.chatRoomId
            ? ({
                ...room,
                lastMessage: message.message,
                lastTimestamp: message.messageTimestamp.toString(),
                lastUserId: message.senderId,
                lastUserName: message.senderName
              } as ChatRoom)
            : room
        )

        // Sort rooms by lastTimestamp (newest first)
        return updatedRooms.sort((a, b) => {
          const timeA = new Date(a.lastTimestamp || 0).getTime()
          const timeB = new Date(b.lastTimestamp || 0).getTime()
          return timeB - timeA
        })
      })
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

    const handleRoomCreated = async (...args: unknown[]) => {
      const roomId = args[0] as string
      console.log('🏠 Room created successfully:', roomId)

      try {
        // Join the newly created room (server doesn't auto-join new rooms)
        await signalRService.joinRoom(roomId)
        setJoinedRooms((prev) => new Set([...prev, roomId]))

        // Reload rooms to get the new room data via SignalR
        await loadRooms()

        // Create a basic room object for immediate use
        const basicRoom: ChatRoom = {
          id: roomId,
          name: 'New Chat',
          members: [],
          lastMessage: undefined,
          lastTimestamp: new Date().toISOString()
        }

        if (createRoomPromise) {
          // Resolve with the basic room object immediately
          createRoomPromise.resolve(basicRoom)
          setCreateRoomPromise(null)
        }
      } catch (err) {
        console.error('❌ Failed to join newly created room or reload rooms:', err)
        if (createRoomPromise) {
          createRoomPromise.reject(new Error('Room created but failed to join or load details'))
          setCreateRoomPromise(null)
        }
      }
    }

    const handleError = (...args: unknown[]) => {
      const errorMessage = args[0] as string
      console.error('❌ SignalR Error:', errorMessage)
      setError(errorMessage)

      if (createRoomPromise) {
        createRoomPromise.reject(new Error(errorMessage))
        setCreateRoomPromise(null)
      }

      if (loadRoomsPromise) {
        loadRoomsPromise.reject(new Error(errorMessage))
        setLoadRoomsPromise(null)
        setIsLoadingRooms(false)
      }
    }

    const handleLoadRoom = async (...args: unknown[]) => {
      const roomsData = args[0] as unknown[]
      console.log('📂 Rooms loaded successfully:', roomsData)

      try {
        // Map server response to ChatRoom format with validation
        const mappedRooms: ChatRoom[] = Array.isArray(roomsData)
          ? roomsData
              .map((room: unknown) => {
                const roomObj = room as Record<string, unknown>

                // Log để debug structure
                console.log('🔍 Room object structure:', roomObj)

                return {
                  id: roomObj.id as string, // lowercase 'id'
                  name: roomObj.name as string, // lowercase 'name'
                  lastMessage: roomObj.lastMessage as string, // lowercase 'lastMessage'
                  lastTimestamp: roomObj.lastTimestamp as string, // lowercase 'lastTimestamp'
                  lastUserName: roomObj.lastUserName as string, // lowercase 'lastUserName'
                  lastUserId: roomObj.lastUserId as string, // lowercase 'lastUserId'
                  memberCount: roomObj.memberCount as number, // lowercase 'memberCount'
                  members: roomObj.members as Member[] // lowercase 'members'
                } as ChatRoom
              })
              .filter((room: ChatRoom) => {
                // Filter out rooms with invalid or missing IDs
                const isValid = room.id && typeof room.id === 'string' && room.id.trim() !== ''
                if (!isValid) {
                  console.warn('⚠️ Filtered out invalid room:', room)
                }
                return isValid
              })
          : []

        console.log('✅ Valid rooms after filtering:', mappedRooms)

        // Mark all rooms as "joined" since server auto-joins them on connection
        if (mappedRooms.length > 0) {
          const roomIds = mappedRooms.map((room) => room.id)
          setJoinedRooms((prev) => new Set([...prev, ...roomIds]))
          console.log('✅ Marked rooms as joined (server auto-joined):', roomIds)
        }

        if (loadRoomsPromise) {
          loadRoomsPromise.resolve(mappedRooms)
          setLoadRoomsPromise(null)
          setIsLoadingRooms(false)
        }
      } catch (err) {
        console.error('❌ Failed to process loaded rooms:', err)
        if (loadRoomsPromise) {
          loadRoomsPromise.reject(new Error('Failed to process loaded rooms'))
          setLoadRoomsPromise(null)
          setIsLoadingRooms(false)
        }
      }
    }

    const handleNoRooms = (...args: unknown[]) => {
      const message = args[0] as string
      console.log('📭 No rooms found:', message)

      // Set empty rooms array
      if (loadRoomsPromise) {
        loadRoomsPromise.resolve([])
        setLoadRoomsPromise(null)
        setIsLoadingRooms(false)
      }
    }

    signalRService.on('ReceiveMessage', handleReceiveMessage)
    signalRService.on('MessageHistory', handleMessageHistory)
    signalRService.on('RoomCreated', handleRoomCreated)
    signalRService.on('Error', handleError)
    signalRService.on('LoadRoom', handleLoadRoom)
    signalRService.on('NoRooms', handleNoRooms)

    return () => {
      signalRService.off('ReceiveMessage', handleReceiveMessage)
      signalRService.off('MessageHistory', handleMessageHistory)
      signalRService.off('RoomCreated', handleRoomCreated)
      signalRService.off('Error', handleError)
      signalRService.off('LoadRoom', handleLoadRoom)
      signalRService.off('NoRooms', handleNoRooms)
    }
  }, [mapChatMessageToConvo, loadRooms, createRoomPromise, loadRoomsPromise, isConnected, joinedRooms])

  // Monitor connection status with optimized interval
  useEffect(() => {
    // Clear existing interval
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current)
    }

    // Set up optimized connection monitoring
    connectionCheckIntervalRef.current = setInterval(() => {
      const connected = signalRService.isConnected
      const newStatus = connected ? 'Connected' : 'Disconnected'

      // Only update if status actually changed
      if (isConnected !== connected) {
        setIsConnected(connected)
      }
      if (connectionStatus !== newStatus) {
        setConnectionStatus(newStatus)
      }
    }, 2000) // Reduced frequency to 2 seconds

    return () => {
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current)
      }
    }
  }, [isConnected, connectionStatus]) // Only re-run if status changes

  const joinRoom = useCallback(
    async (roomId: string) => {
      // Skip if already joined (server auto-joins on connection)
      if (joinedRooms.has(roomId)) {
        console.log(`⏭️ Room ${roomId} already joined (server auto-joined)`)
        return
      }

      try {
        setError(null)
        console.log(`🏠 Manually joining room: ${roomId}`)
        await signalRService.joinRoom(roomId)
        console.log(`✅ Manually joined room: ${roomId}`)

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

  const sendMessage = useCallback(
    async (roomId: string, message: string) => {
      try {
        setError(null)
        await signalRService.sendMessage(roomId, message)
        console.log(`✅ Message sent to room ${roomId}`)

        // Update room list with the sent message (optimistic update)
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId
              ? ({
                  ...room,
                  lastMessage: message,
                  lastTimestamp: new Date().toISOString(),
                  lastUserId: memoizedUser?.userId || '',
                  lastUserName: (memoizedUser?.fullName || 'You') as string
                } as ChatRoom)
              : room
          )
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        console.error('❌ Failed to send message:', err)
      }
    },
    [memoizedUser?.userId, memoizedUser?.fullName]
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
    isLoading,
    isLoadingRooms,
    error,
    loadedRooms
  }
}
