import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatRoom, ChatMessage, ChatState, MessageType, TypingIndicator, UserStatus } from '@/@types/chat.types'
import { chatAPI } from '@/apis'
import { signalRService } from '@/services/chat/signalr.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

export const useChat = () => {
  const { user } = useAuthStore()
  const [state, setState] = useState<ChatState>({
    rooms: [],
    messages: {},
    activeRoom: null,
    onlineUsers: new Set(),
    typingUsers: {},
    isConnected: false,
    isLoading: true,
    connectionError: null,
    isRetrying: false
  })

  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Initialize chat
  useEffect(() => {
    initializeChat()

    return () => {
      signalRService.stop()
    }
  }, [])

  const initializeChat = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    // Setup SignalR listeners first
    setupSignalRListeners()

    // Start SignalR connection (don't await - let it retry in background)
    signalRService.start().catch((error) => {
      console.error('Initial SignalR connection failed:', error)
      // Connection will keep retrying in background
    })

    // Load user's rooms (independent of SignalR connection)
    try {
      await loadRooms()
    } catch (error) {
      console.error('Failed to load rooms:', error)
    }

    // Always finish loading to show UI
    setState((prev) => ({ ...prev, isLoading: false }))
  }

  const setupSignalRListeners = () => {
    // Message events
    signalRService.on('ReceiveMessage', (message: unknown) => {
      const chatMessage = message as ChatMessage
      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatMessage.chatRoomId]: [chatMessage, ...(prev.messages[chatMessage.chatRoomId] || [])]
        }
      }))
    })

    // Typing events
    signalRService.on('UserStartedTyping', (data: unknown) => {
      const typingData = data as TypingIndicator
      if (typingData.userId === user?.id) return // Don't show own typing

      setState((prev) => ({
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [typingData.chatRoomId]: [
            ...(prev.typingUsers[typingData.chatRoomId] || []).filter((id) => id !== typingData.userId),
            typingData.userId
          ]
        }
      }))
    })

    signalRService.on('UserStoppedTyping', (data: unknown) => {
      const typingData = data as TypingIndicator
      setState((prev) => ({
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [typingData.chatRoomId]: (prev.typingUsers[typingData.chatRoomId] || []).filter(
            (id) => id !== typingData.userId
          )
        }
      }))
    })

    // User status events
    signalRService.on('UserOnline', (data: unknown) => {
      const statusData = data as UserStatus
      setState((prev) => ({
        ...prev,
        onlineUsers: new Set([...prev.onlineUsers, statusData.userId])
      }))
    })

    signalRService.on('UserOffline', (data: unknown) => {
      const statusData = data as UserStatus
      setState((prev) => {
        const newOnlineUsers = new Set(prev.onlineUsers)
        newOnlineUsers.delete(statusData.userId)
        return {
          ...prev,
          onlineUsers: newOnlineUsers
        }
      })
    })

    // Connection events
    signalRService.on('Connected', () => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        isRetrying: false
      }))
    })

    signalRService.on('Disconnected', () => {
      setState((prev) => ({ ...prev, isConnected: false }))
    })

    signalRService.on('Reconnecting', () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        isRetrying: true,
        connectionError: null
      }))
    })

    signalRService.on('Reconnected', () => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        isRetrying: false
      }))
    })

    // Error events
    signalRService.on('ConnectionError', (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: errorMessage,
        isRetrying: false
      }))
    })

    signalRService.on('CorsError', () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: 'CORS policy error. Please check server configuration.',
        isRetrying: false
      }))
    })

    signalRService.on('NetworkError', () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: 'Network error. Please check your internet connection.',
        isRetrying: true
      }))
    })

    signalRService.on('MaxRetriesReached', () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: 'Unable to connect to chat server. Please try again later.',
        isRetrying: false
      }))
    })
  }

  const loadRooms = async () => {
    try {
      const response = await chatAPI.getMyRooms()
      // The API returns { ...response, data: { ...response.data, data: mapped } }
      // mapped is an array of ChatRoom, so use response.data.data
      const rooms = response.data.data
      setState((prev) => ({ ...prev, rooms }))
    } catch (error) {
      console.error('Failed to load rooms:', error)
      // Don't block the UI if API fails, just log the error
      // User can still see the chat interface even if rooms don't load
    }
  }

  const loadMessages = async (roomId: string, index = 1, pageSize = 20) => {
    try {
      const response = await chatAPI.getRoomMessages({ roomId, index, pageSize })
      if (response.data.code === 'SUCCESS') {
        const messages = response.data.data.items
        setState((prev) => ({
          ...prev,
          messages: {
            ...prev.messages,
            [roomId]: index === 1 ? messages : [...(prev.messages[roomId] || []), ...messages]
          }
        }))
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const selectRoom = useCallback(
    async (room: ChatRoom) => {
      setState((prev) => ({ ...prev, activeRoom: room }))

      // Join room in SignalR
      await signalRService.joinRoom(room.id)

      // Load messages if not already loaded
      if (!state.messages[room.id]) {
        await loadMessages(room.id)
      }
    },
    [state.messages]
  )

  const sendMessage = async (message: string) => {
    if (!state.activeRoom || !message.trim()) return

    const trimmedMessage = message.trim()
    const tempMessage: ChatMessage = {
      id: Date.now().toString(), // Temporary ID
      message: trimmedMessage,
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      chatRoomId: state.activeRoom.id,
      type: MessageType.Text,
      timestamp: new Date(),
      isRead: false
    }

    // Optimistically add message to UI
    setState((prev) => ({
      ...prev,
      messages: {
        ...prev.messages,
        [state.activeRoom!.id]: [tempMessage, ...(prev.messages[state.activeRoom!.id] || [])]
      }
    }))

    try {
      if (signalRService.isConnected) {
        // Send via SignalR for real-time delivery if connected
        await signalRService.sendMessage(state.activeRoom.id, trimmedMessage)
      } else {
        // Fallback to REST API if SignalR is not connected
        await chatAPI.sendMessage({
          message: trimmedMessage,
          senderId: user?.id || '',
          chatRoomId: state.activeRoom.id,
          type: MessageType.Text
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)

      // Remove the optimistic message on error
      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [state.activeRoom!.id]: (prev.messages[state.activeRoom!.id] || []).filter((msg) => msg.id !== tempMessage.id)
        }
      }))

      throw error
    }
  }

  const startTyping = useCallback(async () => {
    if (!state.activeRoom) return

    await signalRService.startTyping(state.activeRoom.id)

    // Clear existing timeout
    if (typingTimeoutRef.current[state.activeRoom.id]) {
      clearTimeout(typingTimeoutRef.current[state.activeRoom.id])
    }

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current[state.activeRoom.id] = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [state.activeRoom])

  const stopTyping = useCallback(async () => {
    if (!state.activeRoom) return

    await signalRService.stopTyping(state.activeRoom.id)

    // Clear timeout
    if (typingTimeoutRef.current[state.activeRoom.id]) {
      clearTimeout(typingTimeoutRef.current[state.activeRoom.id])
      delete typingTimeoutRef.current[state.activeRoom.id]
    }
  }, [state.activeRoom])

  const createRoom = async (userId1: string, userId2: string) => {
    try {
      const response = await chatAPI.createRoom({ userId1, userId2 })
      if (response.data.code === 'SUCCESS') {
        const newRoom = response.data.data
        setState((prev) => ({
          ...prev,
          rooms: [newRoom, ...prev.rooms]
        }))
        return newRoom
      }
    } catch (error) {
      console.error('Failed to create room:', error)
      throw error
    }
  }

  const retryConnection = useCallback(async () => {
    setState((prev) => ({ ...prev, connectionError: null, isRetrying: true }))
    await signalRService.stop()
    setTimeout(() => signalRService.start(), 1000)
  }, [])

  return {
    // State
    rooms: state.rooms,
    messages: state.messages,
    activeRoom: state.activeRoom,
    onlineUsers: state.onlineUsers,
    typingUsers: state.typingUsers,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    connectionError: state.connectionError,
    isRetrying: state.isRetrying,

    // Actions
    selectRoom,
    sendMessage,
    startTyping,
    stopTyping,
    createRoom,
    loadMessages,
    loadRooms,
    retryConnection
  }
}
