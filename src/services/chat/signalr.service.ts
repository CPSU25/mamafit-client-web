import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import chatAPI from '@/apis/chat.api'

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

    this.connection.on('MessageHistory', (messages: ChatMessage[]) => {
      this.emit('MessageHistory', messages)
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

  // Bước 6: Load tin nhắn lịch sử (nếu server hỗ trợ)
  async loadMessages(roomId: string, pageSize: number = 20, page: number = 1): Promise<void> {
    if (!roomId || roomId.trim() === '') {
      throw new Error('Room ID không được để trống')
    }

    try {
      console.log('📜 Đang load tin nhắn (REST API):', { roomId, pageSize, page })
      const response = await chatAPI.getRoomMessages({ roomId: roomId.trim(), pageSize, index: page })

      // Handle both possible response structures: data.data.items and data.items
      let rawMessages: unknown[] = []
      if (response.data && response.data.data && response.data.data) {
        rawMessages = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        rawMessages = response.data
      }

      // Map the messages to include timestamp field for compatibility
      const messages = Array.isArray(rawMessages)
        ? rawMessages.map((msg: unknown) => {
            const msgObj = msg as Record<string, unknown>
            const msgWithTimestamp = msgObj as { messageTimestamp?: string; timestamp?: string }
            return {
              ...msgObj,
              timestamp: msgWithTimestamp.messageTimestamp || msgWithTimestamp.timestamp
            }
          })
        : []

      this.emit('MessageHistory', messages)
    } catch (error) {
      console.error('❌ Lỗi khi load tin nhắn (REST API):', error)
      throw error
    }
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
