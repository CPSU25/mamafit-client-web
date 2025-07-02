import { useMemo } from 'react'
import { useRoomMessages } from '@/services/chat/chat.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { type Convo } from '../data/chat-types'

interface UseRoomMessagesParams {
  roomId: string
  realtimeMessages: Record<string, Convo[]>
  pageSize?: number
  page?: number
}

export function useRoomMessagesData({ roomId, realtimeMessages, pageSize = 20, page = 1 }: UseRoomMessagesParams) {
  const { user } = useAuthStore()

  // Load messages cho room hiện tại qua React Query
  const {
    data: roomMessagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages
  } = useRoomMessages(roomId, pageSize, page)

  // Map ChatMessage to Convo format for UI
  const mapChatMessageToConvo = useMemo(() => {
    return (msg: {
      message: string
      messageTimestamp: Date | string
      senderId: string
      senderName: string
    }): Convo => ({
      message: msg.message,
      timestamp: new Date(msg.messageTimestamp),
      sender: msg.senderId === user?.userId ? 'You' : msg.senderName
    })
  }, [user?.userId])

  // Combine API messages with realtime messages
  const combinedMessages = useMemo(() => {
    if (!roomId) return []

    // Get API messages (lịch sử từ REST API)
    const apiMessages = roomMessagesData ? roomMessagesData.map(mapChatMessageToConvo) : []

    // Get realtime messages (tin nhắn mới từ SignalR)
    const realtimeRoomMessages = realtimeMessages[roomId] || []

    // Combine và remove duplicates based on timestamp + message content
    const allMessages = [...apiMessages, ...realtimeRoomMessages]

    // Remove duplicates và sort by timestamp (newest first for chat UI)
    const uniqueMessages = allMessages.filter((msg, index, arr) => {
      return (
        arr.findIndex(
          (m) =>
            m.message === msg.message && m.timestamp.getTime() === msg.timestamp.getTime() && m.sender === msg.sender
        ) === index
      )
    })

    return uniqueMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [roomId, roomMessagesData, realtimeMessages, mapChatMessageToConvo])

  return {
    messages: combinedMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages,
    hasMessages: combinedMessages.length > 0
  }
}
