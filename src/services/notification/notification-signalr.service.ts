import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { 
  NotificationResponseDto
} from '@/@types/notification.types'

export class NotificationSignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  constructor() {
    console.log('🔧 Notification SignalR Service được khởi tạo')
  }

  // Bước 1: Tạo connection
  private createConnection(): signalR.HubConnection {
    const baseURL = import.meta.env.VITE_HUB_URL

    if (!baseURL) {
      throw new Error('VITE_API_NOTIFICATION_HUB hoặc VITE_API_BASE_URL không được định nghĩa trong environment')
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseURL}/notificationHub`, {
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
      console.log('⏳ Đang trong quá trình kết nối notification hub, bỏ qua yêu cầu mới')
      return
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ Đã kết nối notification hub rồi, không cần kết nối lại')
      return
    }

    try {
      this.isConnecting = true
      console.log('🚀 Bắt đầu kết nối Notification SignalR...')

      // Tạo connection mới nếu chưa có
      if (!this.connection) {
        this.connection = this.createConnection()
        this.setupEventListeners()
      }

      // Kết nối
      await this.connection.start()
      console.log('🎉 Kết nối Notification SignalR thành công!')
    } catch (error) {
      console.error('❌ Lỗi khi kết nối Notification SignalR:', error)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  // Bước 3: Setup event listeners
  private setupEventListeners(): void {
    if (!this.connection) return

    // Nhận notification mới
    this.connection.on('ReceiveNotification', (notification: NotificationResponseDto) => {
      console.log('🔔 Received new notification:', notification)
      this.emit('ReceiveNotification', notification)
    })

    // Nhận số lượng notification chưa đọc
    this.connection.on('UnreadNotificationCount', (count: number) => {
      console.log('📊 Unread notification count:', count)
      this.emit('UnreadNotificationCount', count)
    })

    // Notification được đánh dấu là đã đọc
    this.connection.on('NotificationMarkedAsRead', (notificationId: string) => {
      console.log('✅ Notification marked as read:', notificationId)
      this.emit('NotificationMarkedAsRead', notificationId)
    })

    // Danh sách notifications
    this.connection.on('UserNotifications', (notifications: NotificationResponseDto[]) => {
      console.log('📋 User notifications loaded:', notifications)
      this.emit('UserNotifications', notifications)
    })

    // Lỗi từ server
    this.connection.on('Error', (errorMessage: string) => {
      console.error('❌ Lỗi từ notification server:', errorMessage)
      this.emit('Error', errorMessage)
    })

    console.log('📡 Notification event listeners đã được setup')
  }

  // Bước 4: Lấy danh sách notifications với phân trang
  async getUserNotifications(index: number = 1, pageSize: number = 10): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      console.log('📋 Đang lấy danh sách notifications:', { index, pageSize })
      await this.connection.invoke('GetUserNotifications', index, pageSize)
      console.log('✅ Yêu cầu lấy notifications đã được gửi')
    } catch (error) {
      console.error('❌ Lỗi khi lấy notifications:', error)
      throw error
    }
  }

  // Bước 5: Đánh dấu notification là đã đọc
  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    if (!notificationId || notificationId.trim() === '') {
      throw new Error('Notification ID không được để trống')
    }

    try {
      console.log('✅ Đang đánh dấu notification là đã đọc:', notificationId)
      await this.connection.invoke('MarkNotificationAsRead', notificationId.trim())
      console.log('✅ Đã đánh dấu notification là đã đọc')
    } catch (error) {
      console.error('❌ Lỗi khi đánh dấu notification là đã đọc:', error)
      throw error
    }
  }

  // Bước 6: Lấy số lượng notification chưa đọc
  async getUnreadNotificationCount(): Promise<void> {
    if (!this.connection) {
      throw new Error('Chưa có connection. Hãy gọi connect() trước')
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Connection chưa sẵn sàng. State hiện tại: ${this.connection.state}`)
    }

    try {
      console.log('📊 Đang lấy số lượng notification chưa đọc...')
      await this.connection.invoke('GetUnreadNotificationCount')
      console.log('✅ Yêu cầu lấy unread count đã được gửi')
    } catch (error) {
      console.error('❌ Lỗi khi lấy unread count:', error)
      throw error
    }
  }

  // Event handling methods (giống như chat service)
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
      eventListeners.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`❌ Lỗi trong event listener cho event '${event}':`, error)
        }
      })
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
      console.log('🔌 Đang ngắt kết nối Notification SignalR...')
      await this.connection.stop()
      console.log('✅ Đã ngắt kết nối notification hub')
    }
  }

  // Cleanup
  destroy(): void {
    this.listeners.clear()
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }
}

// Singleton instance
export const notificationSignalRService = new NotificationSignalRService() 