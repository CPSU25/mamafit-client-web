import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import chatAPI from '@/apis/chat.api'
import { ChatRoom, ChatMessage, CreateRoomRequest, GetMessagesRequest, MessageType } from '@/@types/chat.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ===== SIGNALR REALTIME TYPES =====
// Types for SignalR events (đồng bộ với backend SignalR Hub)
interface SignalRChatMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  chatRoomId: string
  messageTimestamp: string // ISO string from SignalR
  senderAvatar?: string
  type: number
}

interface SignalRUserPresence {
  userId: string
  userName?: string
  isOnline: boolean
}

// Helper function to convert SignalR number type to MessageType enum
function convertSignalRTypeToMessageType(signalRType: number): MessageType {
  switch (signalRType) {
    case 0:
      return MessageType.Text
    case 1:
      return MessageType.Image
    case 2:
      return MessageType.File
    default:
      return MessageType.Text // Default fallback
  }
}

export class ChatService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor() {
    console.log('🔧 SignalR Service được khởi tạo')
  }

  private createConnection(): signalR.HubConnection {
    const baseURL = import.meta.env.VITE_HUB_URL

    if (!baseURL) {
      throw new Error('VITE_API_CHAT_HUB không được định nghĩa trong environment')
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseURL}/chatHub`, {
        accessTokenFactory: () => {
          const authStore = useAuthStore.getState()
          const token = authStore.accessToken || ''
          return token
        },
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false,
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    return connection
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('⏳ Đang trong quá trình kết nối, bỏ qua yêu cầu mới')
      return
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ Đã kết nối rồi, không cần kết nối lại')
      return
    }

    try {
      this.isConnecting = true
      console.log('🚀 Bắt đầu kết nối SignalR...')

      if (!this.connection) {
        this.connection = this.createConnection()
        this.setupEventListeners()
      }

      await this.connection.start()
      console.log('🎉 Kết nối SignalR thành công!')
    } catch (error) {
      console.error('❌ Lỗi khi kết nối SignalR:', error)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return

    this.connection.on('ReceiveMessage', (message: SignalRChatMessage) => {
      console.log('📨 Nhận tin nhắn mới từ SignalR:', message)

      const frontendMessage: ChatMessage = {
        id: message.id,
        message: message.message,
        senderId: message.senderId,
        senderName: message.senderName,
        chatRoomId: message.chatRoomId,
        senderAvatar: message.senderAvatar,
        type: convertSignalRTypeToMessageType(message.type),
        messageTimestamp: new Date(message.messageTimestamp),
        isRead: false
      }

      this.emit('ReceiveMessage', frontendMessage)
    })

    this.connection.on('MessageSent', (messageId: string, timestamp: string) => {
      console.log('✅ Tin nhắn đã gửi thành công:', { messageId, timestamp })
      this.emit('MessageSent', messageId, new Date(timestamp))
    })

    this.connection.on('UserOnline', (userId: string, userName?: string) => {
      console.log('🟢 User online:', { userId, userName })
      this.emit('UserOnline', userId, userName)
    })

    this.connection.on('UserOffline', (userId: string, userName?: string) => {
      console.log('🔴 User offline:', { userId, userName })
      this.emit('UserOffline', userId, userName)
    })

    this.connection.on('ListOnlineUsers', (users: SignalRUserPresence[]) => {
      console.log('👥 Danh sách users online:', users)
      this.emit('ListOnlineUsers', users)
    })

    this.connection.on('JoinedRoom', (roomId: string) => {
      console.log('🏠 Đã join room thành công:', roomId)
      this.emit('JoinedRoom', roomId)
    })

    this.connection.on('LeftRoom', (roomId: string) => {
      console.log('🚪 Đã leave room thành công:', roomId)
      this.emit('LeftRoom', roomId)
    })

    this.connection.on('Error', (errorMessage: string) => {
      console.error('❌ Lỗi từ SignalR server:', errorMessage)
      this.emit('Error', errorMessage)
    })

    this.connection.on('InvitedToRoom', (roomId: string) => {
      console.log('👥 Đã được mời vào room:', roomId)
      this.emit('InvitedToRoom', roomId)
      this.joinRoom(roomId)
      this.emit('JoinedRoom', roomId)
    })

    this.connection.on('LoadRoom', (rooms: unknown[]) => {
      console.log('⚠️ [DEPRECATED] LoadRoom event - sử dụng REST API thay thế')
      this.emit('LoadRoom', rooms)
    })

    this.connection.on('MessageHistory', (roomId: string, messages: SignalRChatMessage[]) => {
      console.log('⚠️ [DEPRECATED] MessageHistory event - sử dụng REST API thay thế')
      this.emit('MessageHistory', roomId, messages)
    })

    this.connection.on('NoRooms', (message: string) => {
      console.log('⚠️ [DEPRECATED] NoRooms event - sử dụng REST API thay thế')
      this.emit('NoRooms', message)
    })

    this.connection.on('NoMessages', (message: string) => {
      console.log('⚠️ [DEPRECATED] NoMessages event - sử dụng REST API thay thế')
      this.emit('NoMessages', message)
    })

    console.log('✅ SignalR event listeners đã được setup')
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID không được để trống')
    }

    try {
      console.log('🏠 Đang join room qua SignalR:', roomId)
      await this.connection.invoke('JoinRoom', roomId.trim())
      console.log('✅ Đã gửi yêu cầu join room')
    } catch (error) {
      console.error('❌ Lỗi khi join room:', error)
      throw error
    }
  }

  // Leave room (chỉ SignalR)
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID không được để trống')
    }

    try {
      console.log('🚪 Đang leave room qua SignalR:', roomId)
      await this.connection.invoke('LeaveRoom', roomId.trim())
      console.log('✅ Đã gửi yêu cầu leave room')
    } catch (error) {
      console.error('❌ Lỗi khi leave room:', error)
      throw error
    }
  }

  // Gửi tin nhắn (chỉ SignalR)
  async sendMessage(roomId: string, message: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID không được để trống')
    }

    if (!message || message.trim() === '') {
      throw new Error('Tin nhắn không được để trống')
    }

    try {
      console.log('💬 Đang gửi tin nhắn qua SignalR:', { roomId, message })

      const messageDto = {
        Message: message.trim(),
        ChatRoomId: roomId.trim(),
        Type: 0 // 0 = Text message
      }

      await this.connection.invoke('SendMessage', messageDto)
      console.log('✅ Đã gửi tin nhắn qua SignalR')
    } catch (error) {
      console.error('❌ Lỗi khi gửi tin nhắn:', error)
      throw error
    }
  }

  // ===== REST API METHODS =====

  // Tạo room chat qua REST API (thay thế SignalR createRoom)
  async createRoomViaAPI(userId1: string, userId2: string): Promise<ChatRoom> {
    if (!userId1 || userId1.trim() === '') {
      throw new Error('User ID 1 không được để trống')
    }

    if (!userId2 || userId2.trim() === '') {
      throw new Error('User ID 2 không được để trống')
    }

    if (userId1.trim() === userId2.trim()) {
      throw new Error('Không thể tạo room chat với chính mình')
    }

    try {
      console.log('🏗️ Đang tạo room qua REST API:', { userId1, userId2 })

      const createRoomRequest: CreateRoomRequest = {
        userId1: userId1.trim(),
        userId2: userId2.trim()
      }

      const response = await chatAPI.createRoom(createRoomRequest)

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from create room API')
      }

      const createdRoom = response.data.data
      console.log('✅ Room đã được tạo qua REST API:', createdRoom)

      // Sau khi tạo room thành công, join room qua SignalR
      if (createdRoom.id) {
        try {
          await this.joinRoom(createdRoom.id)
          console.log('✅ Đã join room mới tạo qua SignalR')
        } catch (joinError) {
          console.warn('⚠️ Tạo room thành công nhưng không thể join qua SignalR:', joinError)
          // Không throw error vì room đã được tạo thành công
        }
      }

      return createdRoom
    } catch (error) {
      console.error('❌ Lỗi khi tạo room qua REST API:', error)
      throw error
    }
  }

  // Lấy danh sách rooms qua REST API (thay thế SignalR loadRoom)
  async getMyRoomsViaAPI(): Promise<ChatRoom[]> {
    try {
      console.log('📂 Đang lấy danh sách rooms qua REST API...')

      const response = await chatAPI.getMyRooms()

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from get rooms API')
      }

      const rooms = response.data.data
      console.log('✅ Đã lấy danh sách rooms qua REST API:', rooms.length, 'rooms')

      return rooms
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách rooms qua REST API:', error)
      throw error
    }
  }

  // Lấy tin nhắn lịch sử qua REST API (thay thế SignalR loadMessageHistory)
  async getRoomMessagesViaAPI(roomId: string, pageSize: number = 20, page: number = 1): Promise<ChatMessage[]> {
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID không được để trống')
    }

    if (pageSize <= 0) {
      throw new Error('Page size phải lớn hơn 0')
    }

    if (page <= 0) {
      throw new Error('Page phải lớn hơn 0')
    }

    try {
      console.log('📜 Đang lấy tin nhắn lịch sử qua REST API:', { roomId, pageSize, page })

      const getMessagesRequest: GetMessagesRequest = {
        roomId: roomId.trim(),
        index: page,
        pageSize: pageSize
      }

      const response = await chatAPI.getRoomMessages(getMessagesRequest)

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from get messages API')
      }

      const messages = response.data.data
      console.log('✅ Đã lấy tin nhắn lịch sử qua REST API:', messages.length, 'messages')

      return messages
    } catch (error) {
      console.error('❌ Lỗi khi lấy tin nhắn lịch sử qua REST API:', error)
      throw error
    }
  }

  // ===== LEGACY METHODS (deprecated, sẽ loại bỏ) =====

  // TODO: Loại bỏ method này sau khi frontend hook được cập nhật
  async createRoom(userId1: string, userId2: string): Promise<void> {
    console.log('⚠️ [DEPRECATED] createRoom() via SignalR - sử dụng createRoomViaAPI() thay thế')

    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      await this.connection.invoke('CreateRoom', userId1.trim(), userId2.trim())
    } catch (error) {
      console.error('❌ Lỗi khi tạo room (deprecated):', error)
      throw error
    }
  }

  // TODO: Loại bỏ method này sau khi frontend hook được cập nhật
  async loadRoom(): Promise<void> {
    console.log('⚠️ [DEPRECATED] loadRoom() via SignalR - sử dụng getMyRoomsViaAPI() thay thế')

    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      await this.connection.invoke('LoadRoom')
    } catch (error) {
      console.error('❌ Lỗi khi load rooms (deprecated):', error)
      throw error
    }
  }

  // TODO: Loại bỏ method này sau khi frontend hook được cập nhật
  async loadMessageHistory(roomId: string, pageSize: number = 20, page: number = 1): Promise<void> {
    console.log('⚠️ [DEPRECATED] loadMessageHistory() via SignalR - sử dụng getRoomMessagesViaAPI() thay thế')

    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      await this.connection.invoke('LoadMessageHistory', roomId.trim(), pageSize, page)
    } catch (error) {
      console.error('❌ Lỗi khi load tin nhắn lịch sử (deprecated):', error)
      throw error
    }
  }

  // TODO: Loại bỏ method này sau khi frontend hook được cập nhật
  async loadMessages(roomId: string, pageSize: number = 20, page: number = 1): Promise<void> {
    console.log('⚠️ [DEPRECATED] loadMessages() - sử dụng getRoomMessagesViaAPI() thay thế')
    return this.loadMessageHistory(roomId, pageSize, page)
  }

  // ===== UTILITY METHODS =====

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  get connectionState(): string {
    return this.connection?.state?.toString() || 'No Connection'
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      console.log('🔌 Đang ngắt kết nối SignalR...')
      await this.connection.stop()
      console.log('✅ Đã ngắt kết nối')
    }
  }

  // ===== EVENT MANAGEMENT =====

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(...args))
    }
  }
}

// Singleton instance
export const chatService = new ChatService()

// ===== REACT QUERY HOOKS =====

// Query Keys for React Query
export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  myRooms: () => [...chatKeys.rooms(), 'my'] as const,
  roomMessages: (roomId: string) => [...chatKeys.all, 'messages', roomId] as const,
  roomMessagesPaginated: (roomId: string, page: number, pageSize: number) =>
    [...chatKeys.roomMessages(roomId), { page, pageSize }] as const
}

// Hook để lấy danh sách rooms của user hiện tại
export const useMyRooms = () => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: chatKeys.myRooms(),
    queryFn: () => chatService.getMyRoomsViaAPI(),
    enabled: isAuthenticated, // Chỉ call khi user đã login
    staleTime: 2 * 60 * 1000, // Cache 2 minutes
    retry: (failureCount, error) => {
      // Không retry 401, 403 errors
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
    retryDelay: 1000
  })
}

// Hook để lấy tin nhắn của một room
export const useRoomMessages = (roomId: string, pageSize: number = 20, page: number = 1) => {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: chatKeys.roomMessagesPaginated(roomId, page, pageSize),
    queryFn: () => chatService.getRoomMessagesViaAPI(roomId, pageSize, page),
    enabled: isAuthenticated && !!roomId && roomId.trim() !== '', // Chỉ call khi có roomId
    staleTime: 1 * 60 * 1000, // Cache 1 minute cho messages
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403 || status === 404) return false
      return failureCount < 2
    },
    retryDelay: 1000
  })
}

// Hook để tạo room mới
export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId1, userId2 }: { userId1: string; userId2: string }) =>
      chatService.createRoomViaAPI(userId1, userId2),
    onSuccess: (newRoom) => {
      console.log('✅ Room created successfully via React Query:', newRoom)

      // Invalidate và refetch rooms list
      queryClient.invalidateQueries({ queryKey: chatKeys.myRooms() })

      // Optionally add the new room to cache optimistically
      queryClient.setQueryData(chatKeys.myRooms(), (oldRooms: ChatRoom[] = []) => {
        // Check if room already exists to avoid duplicates
        const roomExists = oldRooms.some((room) => room.id === newRoom.id)
        if (roomExists) return oldRooms

        return [newRoom, ...oldRooms]
      })
    },
    onError: (error) => {
      console.error('❌ Failed to create room via React Query:', error)
    },
    retry: (failureCount, error) => {
      // Không retry client errors
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) return false
      return failureCount < 1
    },
    retryDelay: 1000
  })
}

// Hook để gửi tin nhắn qua REST API (nếu cần backup cho SignalR)
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      message,
      senderId,
      type = MessageType.Text
    }: {
      roomId: string
      message: string
      senderId: string
      type?: MessageType
    }) => {
      const sendMessageRequest = {
        Message: message,
        SenderId: senderId,
        ChatRoomId: roomId,
        Type: type
      }

      const response = await chatAPI.sendMessage(sendMessageRequest)

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from send message API')
      }

      return response.data.data
    },
    onSuccess: (sentMessage, variables) => {
      console.log('✅ Message sent successfully via REST API:', sentMessage)

      // Invalidate messages for this room
      queryClient.invalidateQueries({
        queryKey: chatKeys.roomMessages(variables.roomId)
      })

      // Update rooms list with latest message info
      queryClient.setQueryData(chatKeys.myRooms(), (oldRooms: ChatRoom[] = []) => {
        return oldRooms.map((room) =>
          room.id === variables.roomId
            ? {
                ...room,
                lastMessage: variables.message,
                lastTimestamp: new Date().toISOString(),
                lastUserId: variables.senderId,
                lastUserName: 'You'
              }
            : room
        )
      })
    },
    onError: (error) => {
      console.error('❌ Failed to send message via REST API:', error)
    },
    retry: 1,
    retryDelay: 1000
  })
}

// Helper hook để invalidate chat cache khi cần
export const useChatCache = () => {
  const queryClient = useQueryClient()

  const invalidateRooms = () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.myRooms() })
  }

  const invalidateRoomMessages = (roomId: string) => {
    queryClient.invalidateQueries({ queryKey: chatKeys.roomMessages(roomId) })
  }

  const invalidateAllChat = () => {
    queryClient.invalidateQueries({ queryKey: chatKeys.all })
  }

  const updateRoomLastMessage = (roomId: string, message: string, senderId: string, senderName: string) => {
    queryClient.setQueryData(chatKeys.myRooms(), (oldRooms: ChatRoom[] = []) => {
      return oldRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              lastMessage: message,
              lastTimestamp: new Date().toISOString(),
              lastUserId: senderId,
              lastUserName: senderName
            }
          : room
      )
    })
  }

  return {
    invalidateRooms,
    invalidateRoomMessages,
    invalidateAllChat,
    updateRoomLastMessage
  }
}
