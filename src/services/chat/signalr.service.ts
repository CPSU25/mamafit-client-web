import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

// Types
interface ChatMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  chatRoomId: string
  timestamp: string
  type: number
}

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor() {
    console.log('🔧 SignalR Service được khởi tạo')
  }

  // Bước 1: Tạo connection
  private createConnection(): signalR.HubConnection {
    const baseURL = import.meta.env.VITE_API_CHAT_HUB

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

  // Bước 2: Connect tới SignalR Hub
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

      // Tạo connection mới nếu chưa có
      if (!this.connection) {
        this.connection = this.createConnection()
        this.setupEventListeners()
      }

      // Kết nối
      await this.connection.start()
      console.log('🎉 Kết nối SignalR thành công!')
    } catch (error) {
      console.error('❌ Lỗi khi kết nối SignalR:', error)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  // Bước 3: Setup event listeners cơ bản
  private setupEventListeners(): void {
    if (!this.connection) return

    // Message Events
    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      this.emit('ReceiveMessage', message)
    })

    this.connection.on('MessageHistory', (roomId: string, messages: ChatMessage[]) => {
      this.emit('MessageHistory', roomId, messages)
    })

    // Room Events
    this.connection.on('RoomCreated', (roomId: string) => {
      console.log('🏠 Room được tạo thành công:', roomId)
      this.emit('RoomCreated', roomId)
    })

    this.connection.on('Error', (errorMessage: string) => {
      console.error('❌ Lỗi từ server:', errorMessage)
      this.emit('Error', errorMessage)
    })

    // Load Room Events
    this.connection.on('LoadRoom', (rooms: unknown[]) => {
      console.log('📂 Rooms được load thành công:', rooms)
      this.emit('LoadRoom', rooms)
    })

    this.connection.on('NoRooms', (message: string) => {
      console.log('📭 Không có rooms:', message)
      this.emit('NoRooms', message)
    })

    this.connection.on('NoMessages', (message: string) => {
      console.log('📭 Không có tin nhắn:', message)
      this.emit('NoMessages', message)
    })

    console.log('Event listeners đã được setup')
  }

  // Bước 4: Join room
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
      console.log('🏠 Đang join room:', roomId)
      await this.connection.invoke('JoinRoom', roomId.trim())
      console.log('✅ Đã join room thành công:', roomId)
    } catch (error) {
      console.error('❌ Lỗi khi join room:', error)
      throw error
    }
  }

  // Bước 5: Gửi tin nhắn
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
      console.log('💬 Đang gửi tin nhắn:', { roomId, message })

      const messageDto = {
        Message: message.trim(),
        ChatRoomId: roomId.trim(),
        Type: 0 // 0 = Text message
      }

      await this.connection.invoke('SendMessage', messageDto)
      console.log('✅ Gửi tin nhắn thành công')
    } catch (error) {
      console.error('❌ Lỗi khi gửi tin nhắn:', error)
      throw error
    }
  }

  // Bước 6: Tạo room chat giữa 2 users
  async createRoom(userId1: string, userId2: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

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
      console.log('🏗️ Đang tạo room chat:', { userId1, userId2 })
      await this.connection.invoke('CreateRoom', userId1.trim(), userId2.trim())
      console.log('✅ Yêu cầu tạo room đã được gửi')
    } catch (error) {
      console.error('❌ Lỗi khi tạo room:', error)
      throw error
    }
  }

  // Bước 7: Load danh sách chat rooms của user hiện tại
  async loadRoom(): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      console.log('📂 Đang load danh sách rooms...')
      await this.connection.invoke('LoadRoom')
      console.log('✅ Yêu cầu load rooms đã được gửi')
    } catch (error) {
      console.error('❌ Lỗi khi load rooms:', error)
      throw error
    }
  }

  // Bước 8: Load tin nhắn lịch sử qua SignalR
  async loadMessageHistory(roomId: string, pageSize: number = 20, page: number = 1): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

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
      console.log('📜 Đang load tin nhắn lịch sử (SignalR):', { roomId, pageSize, page })
      await this.connection.invoke('LoadMessageHistory', roomId.trim(), pageSize, page)
      console.log('✅ Yêu cầu load tin nhắn lịch sử đã được gửi')
    } catch (error) {
      console.error('❌ Lỗi khi load tin nhắn lịch sử (SignalR):', error)
      throw error
    }
  }

  // Legacy method - Keep for backward compatibility but prefer loadMessageHistory
  async loadMessages(roomId: string, pageSize: number = 20, page: number = 1): Promise<void> {
    console.log('⚠️ loadMessages() is deprecated, using loadMessageHistory() instead')
    return this.loadMessageHistory(roomId, pageSize, page)
  }

  // Utility methods
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

  // Event Management
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
export const signalRService = new SignalRService()
