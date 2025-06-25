import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { chatService } from '@/services/chat/chat.service'
import { ChatMessage } from '@/@types/chat.types'
import { notificationService } from '@/services/notification/notification.service'

export const useSignalRAutoConnect = () => {
  const { isAuthenticated, user } = useAuthStore()
  const hasTriedConnect = useRef(false)
  const processedMessages = useRef(new Set<string>())

  // Centralized message handler
  const handleMessage = useCallback(
    (message: ChatMessage) => {
      console.log('📨 [AutoConnect] Received message:', message)

      // Prevent duplicate message processing
      const messageId = message.id || `${message.chatRoomId}-${message.messageTimestamp || Date.now()}`

      if (processedMessages.current.has(messageId)) {
        console.log('⏭️ [AutoConnect] Skipping duplicate message:', messageId)
        return
      }

      // Mark message as processed
      processedMessages.current.add(messageId)

      // Cleanup old message IDs to prevent memory leak (keep last 1000)
      if (processedMessages.current.size > 1000) {
        const recentIds = Array.from(processedMessages.current).slice(-1000)
        processedMessages.current = new Set(recentIds)
      }

      // Handle notifications for messages from other users
      const isFromOtherUser = message.senderId !== user?.userId

      if (isFromOtherUser) {
        const isNotificationEnabled = localStorage.getItem('chat-notifications-enabled') === 'true'

        if (isNotificationEnabled) {
          notificationService
            .showChatMessageNotification(message.senderName, message.message, message.chatRoomId)
            .catch((error) => {
              console.error('❌ [AutoConnect] Error showing notification:', error)
            })
        }
      }

      // You can add more message handling logic here
      // e.g., update global state, emit custom events, etc.
    },
    [user?.userId]
  )

  // Setup global message listener
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔧 [AutoConnect] Setting up global message listener')

      const messageHandler = (...args: unknown[]) => {
        const message = args[0] as ChatMessage
        handleMessage(message)
      }

      chatService.on('ReceiveMessage', messageHandler)

      return () => {
        console.log('🧹 [AutoConnect] Cleaning up global message listener')
        chatService.off('ReceiveMessage', messageHandler)
      }
    }
  }, [isAuthenticated, user?.userId, handleMessage])

  useEffect(() => {
    let isComponentMounted = true

    const handleSignalRConnection = async () => {
      if (isAuthenticated && user) {
        if (!hasTriedConnect.current || !chatService.isConnected) {
          try {
            if (!chatService.isConnected) {
              await chatService.connect()
              hasTriedConnect.current = true
              console.log('✅ SignalR auto-connected after login')
            } else {
              console.log('⏭️ SignalR already connected')
            }
          } catch (error) {
            console.error('❌ Failed to auto-connect SignalR after login:', error)
            hasTriedConnect.current = false
          }
        }
      } else {
        try {
          if (chatService.isConnected) {
            console.log('🔒 User logged out, disconnecting from SignalR...')
            await chatService.disconnect()
            hasTriedConnect.current = false
            // Clear processed messages on logout
            processedMessages.current.clear()
          }
        } catch (error) {
          console.error('❌ Failed to disconnect SignalR after logout:', error)
        }
      }
    }

    if (isComponentMounted) {
      handleSignalRConnection()
    }
    return () => {
      isComponentMounted = false
    }
  }, [isAuthenticated, user?.userId])

  return {
    isConnected: chatService.isConnected,
    connectionState: chatService.connectionState,
    handleMessage // Export the message handler for external use
  }
}
