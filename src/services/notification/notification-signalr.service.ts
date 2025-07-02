import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

// ===== NOTIFICATION TYPES (theo backend) =====
export interface NotificationResponseDto {
  id: string
  notificationTitle?: string
  notificationContent?: string
  type?: string // NotificationType enum từ backend
  actionUrl?: string
  metadata?: string
  receiverId?: string
  isRead: boolean
  createdBy?: string
  updatedBy?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface NotificationEventHandlers {
  onReceiveNotification?: (notification: NotificationResponseDto) => void
  onConnectionStateChange?: (isConnected: boolean) => void
  onError?: (error: string) => void
}

// Type-safe event system
type EventMap = {
  ReceiveNotification: [NotificationResponseDto]
  connectionStateChange: [boolean]
  Error: [string]
}

type EventCallback<K extends keyof EventMap> = (...args: EventMap[K]) => void

export class NotificationSignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private listeners: Map<keyof EventMap, EventCallback<keyof EventMap>[]> = new Map()
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private autoConnectEnabled = true

  constructor() {
    console.log('🔔 NotificationSignalRService được khởi tạo')

    // Lắng nghe auth state changes để auto-connect/disconnect
    this.setupAuthStateListener()
  }

  private setupAuthStateListener(): void {
    // Subscribe to auth store changes
    useAuthStore.subscribe((state) => {
      const isAuthenticated = !!state.accessToken && !!state.user

      if (isAuthenticated && this.autoConnectEnabled && !this.isConnected) {
        console.log('🔐 User đã login, tự động kết nối NotificationHub...')
        this.connect().catch((error) => {
          console.error('❌ Auto-connect NotificationHub failed:', error)
        })
      } else if (!isAuthenticated && this.isConnected) {
        console.log('🔓 User đã logout, ngắt kết nối NotificationHub...')
        this.disconnect()
      }
    })
  }

  private createConnection(): signalR.HubConnection {
    const baseURL = import.meta.env.VITE_HUB_URL

    if (!baseURL) {
      throw new Error('VITE_HUB_URL hoặc VITE_API_BASE_URL không được định nghĩa trong environment')
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
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, 60s
          const delays = [0, 2000, 10000, 30000, 60000]
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)]
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build()

    return connection
  }

  async connect(): Promise<void> {
    // Kiểm tra auth trước khi connect
    const authStore = useAuthStore.getState()
    if (!authStore.accessToken || !authStore.user) {
      console.warn('⚠️ Không thể kết nối NotificationHub: chưa đăng nhập')
      return
    }

    if (this.isConnecting) {
      console.log('⏳ Đang trong quá trình kết nối NotificationHub, bỏ qua yêu cầu mới')
      return
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ Đã kết nối NotificationHub rồi, không cần kết nối lại')
      return
    }

    try {
      this.isConnecting = true

      if (!this.connection) {
        this.connection = this.createConnection()
        this.setupEventListeners()
        this.setupConnectionEvents()
      }

      await this.connection.start()
      this.reconnectAttempts = 0
      this.emit('connectionStateChange', true)
      this.requestNotificationPermission()
    } catch (error) {
      console.error('❌ Lỗi khi kết nối NotificationHub:', error)
      this.emit('connectionStateChange', false)
      this.emit('Error', `Connection failed: ${error}`)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      console.log('✅ Đã ngắt kết nối NotificationHub')
      this.emit('connectionStateChange', false)
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return

    this.connection.on('ReceiveNotification', (notification: NotificationResponseDto) => {
      const processedNotification: NotificationResponseDto = {
        ...notification,
        createdAt:
          typeof notification.createdAt === 'string' ? new Date(notification.createdAt) : notification.createdAt,
        updatedAt:
          typeof notification.updatedAt === 'string' ? new Date(notification.updatedAt) : notification.updatedAt
      }

      this.emit('ReceiveNotification', processedNotification)
      this.showNotificationUI(processedNotification)
    })
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return

    this.connection.onreconnecting(() => {
      this.emit('connectionStateChange', false)
    })

    this.connection.onreconnected(() => {
      this.reconnectAttempts = 0
      this.emit('connectionStateChange', true)
    })

    this.connection.onclose((error) => {
      console.log('🔌 NotificationHub connection đã đóng:', error?.message || 'Unknown reason')
      this.emit('connectionStateChange', false)

      const authStore = useAuthStore.getState()
      const isAuthenticated = !!authStore.accessToken && !!authStore.user

      if (isAuthenticated && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
        setTimeout(() => {
          this.connect().catch((err) => {
            console.error('❌ NotificationHub reconnect failed:', err)
            this.emit('Error', `Reconnect failed: ${err}`)
          })
        }, delay)
      }
    })
  }

  on<K extends keyof EventMap>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback as EventCallback<keyof EventMap>)
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<K>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as EventCallback<keyof EventMap>)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`❌ Lỗi trong notification event listener cho '${event}':`, error)
        }
      })
    }
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  get connectionState(): string {
    return this.connection?.state?.toString() || 'Disconnected'
  }

  destroy(): void {
    this.listeners.clear()
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log(`🔔 Browser notification permission: ${permission}`)
      } catch (error) {
        console.error('❌ Lỗi khi request notification permission:', error)
      }
    }
  }

  private showNotificationUI(notification: NotificationResponseDto): void {
    console.log('📢 Hiển thị notification UI cho:', notification.notificationTitle)

    // Show browser notification if possible
    this.showBrowserNotification(notification)

    // TODO: Add other UI notifications here:
    // - Toast notification
    // - Update notification badge count
    // - Add to notification dropdown list
    // - Play notification sound
  }

  /**
   * Setup handlers với type safety
   */
  setupHandlers(handlers: NotificationEventHandlers): () => void {
    const cleanupFunctions: (() => void)[] = []

    if (handlers.onReceiveNotification) {
      this.on('ReceiveNotification', handlers.onReceiveNotification)
      cleanupFunctions.push(() => this.off('ReceiveNotification', handlers.onReceiveNotification!))
    }

    if (handlers.onConnectionStateChange) {
      this.on('connectionStateChange', handlers.onConnectionStateChange)
      cleanupFunctions.push(() => this.off('connectionStateChange', handlers.onConnectionStateChange!))
    }

    if (handlers.onError) {
      this.on('Error', handlers.onError)
      cleanupFunctions.push(() => this.off('Error', handlers.onError!))
    }

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }

  /**
   * Helper để tạo browser notification (nếu có permission)
   */
  private showBrowserNotification(notification: NotificationResponseDto): void {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.notificationTitle || 'New notification', {
          body: notification.notificationContent || '',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false,
          silent: false
        })

        // Handle notification click
        browserNotification.onclick = () => {
          window.focus()
          if (notification.actionUrl) {
            console.log('Navigate to:', notification.actionUrl)
            // TODO: Navigate to actionUrl using your router
          }
          browserNotification.close()
        }

        // Auto close after 5 seconds
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      } catch (error) {
        console.error('❌ Lỗi khi tạo browser notification:', error)
      }
    }
  }

  // ===== PUBLIC UTILITY METHODS =====

  /**
   * Manual connect method for testing
   */
  async forceConnect(): Promise<void> {
    console.log('🔧 Force connecting NotificationHub...')
    await this.connect()
  }

  /**
   * Manual disconnect method
   */
  async forceDisconnect(): Promise<void> {
    console.log('🔧 Force disconnecting NotificationHub...')
    await this.disconnect()
  }

  /**
   * Get connection status info
   */
  getConnectionInfo(): {
    isConnected: boolean
    state: string
    reconnectAttempts: number
    autoConnectEnabled: boolean
  } {
    return {
      isConnected: this.isConnected,
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      autoConnectEnabled: this.autoConnectEnabled
    }
  }
}

// ===== SINGLETON INSTANCE =====
export const notificationSignalRService = new NotificationSignalRService()
