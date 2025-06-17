import * as signalR from '@microsoft/signalr'
import { SignalRMessage, TypingIndicator, UserStatus, ChatMessage, MessageType } from '@/@types/chat.types'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor() {
    this.initializeConnection()
  }

  private initializeConnection() {
    const baseURL = import.meta.env.VITE_API_CHAT_HUB

    if (!baseURL) {
      console.error('VITE_API_CHAT_HUB or VITE_API_BASE_URL is not defined')
      return
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseURL}/chatHub`, {
        accessTokenFactory: () => {
          return useAuthStore.getState().accessToken || ''
        },
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false,
        withCredentials: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext: signalR.RetryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          }
          return null
        }
      })
      .configureLogging(signalR.LogLevel.Warning) // Reduce logging in production
      .build()

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.connection) return

    // Message Events
    this.connection.on('ReceiveMessage', (message: SignalRMessage) => {
      this.emit('ReceiveMessage', this.transformMessage(message))
    })

    // Typing Events
    this.connection.on('UserStartedTyping', (data: TypingIndicator) => {
      this.emit('UserStartedTyping', data)
    })

    this.connection.on('UserStoppedTyping', (data: TypingIndicator) => {
      this.emit('UserStoppedTyping', data)
    })

    // User Status Events
    this.connection.on('UserOnline', (data: UserStatus) => {
      this.emit('UserOnline', data)
    })

    this.connection.on('UserOffline', (data: UserStatus) => {
      this.emit('UserOffline', data)
    })

    // Connection Events
    this.connection.onreconnecting(() => {
      this.emit('Reconnecting')
    })

    this.connection.onreconnected(() => {
      this.reconnectAttempts = 0
      this.emit('Reconnected')
      this.joinUserRooms()
    })

    this.connection.onclose(() => {
      this.emit('Disconnected')
    })
  }

  private transformMessage(signalRMessage: SignalRMessage): ChatMessage {
    return {
      id: signalRMessage.id,
      message: signalRMessage.message,
      senderId: signalRMessage.senderId,
      senderName: signalRMessage.senderName,
      chatRoomId: signalRMessage.chatRoomId,
      type: signalRMessage.type,
      timestamp: new Date(signalRMessage.timestamp),
      isRead: false
    }
  }

  async start(): Promise<void> {
    if (!this.connection) {
      this.initializeConnection()
    }

    if (!this.connection) {
      console.error('Failed to initialize SignalR connection')
      this.emit('ConnectionError', new Error('Failed to initialize connection'))
      return
    }

    try {
      if (this.connection.state === signalR.HubConnectionState.Disconnected) {
        console.log('Starting SignalR connection...')
        await this.connection.start()
        console.log('Connected to ChatHub')
        this.reconnectAttempts = 0 // Reset on successful connection
        this.emit('Connected')

        // Only join rooms after successful connection
        try {
          await this.joinUserRooms()
        } catch (roomError) {
          console.warn('Failed to join user rooms:', roomError)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('SignalR Connection Error:', errorMessage)

      // Emit specific error types
      if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control')) {
        this.emit('CorsError', error)
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        this.emit('NetworkError', error)
      } else {
        this.emit('ConnectionError', error)
      }

      // Retry connection with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
        console.log(
          `Retrying connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        )
        setTimeout(() => this.start(), delay)
      } else {
        console.error('Max reconnect attempts reached. Connection failed.')
        this.emit('MaxRetriesReached')
      }
    }
  }

  async stop(): Promise<void> {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop()
      this.emit('Disconnected')
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinRoom', roomId)
      } catch (error) {
        console.error('Error joining room:', error)
      }
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveRoom', roomId)
      } catch (error) {
        console.error('Error leaving room:', error)
      }
    }
  }

  async sendMessage(roomId: string, message: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) throw new Error('No auth token available')

        await this.connection.invoke('SendMessage', roomId, message, MessageType.Text)
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      }
    } else {
      throw new Error('SignalR connection not established')
    }
  }

  async startTyping(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('StartTyping', roomId)
      } catch (error) {
        console.error('Error starting typing:', error)
      }
    }
  }

  async stopTyping(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('StopTyping', roomId)
      } catch (error) {
        console.error('Error stopping typing:', error)
      }
    }
  }

  private async joinUserRooms(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinUserRooms')
        console.log('Successfully joined user rooms')
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Check if method doesn't exist on server
        if (errorMessage.includes('Method does not exist') || errorMessage.includes('JoinUserRooms')) {
          console.warn('JoinUserRooms method not implemented on server - skipping')
          // This is not a critical error, continue normal operation
        } else {
          console.error('Error joining user rooms:', errorMessage)
        }
      }
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

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null
  }
}

// Singleton instance
export const signalRService = new SignalRService()
