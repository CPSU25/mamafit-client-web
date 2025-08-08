import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { notificationService } from '@/services/notification/notification.service'
import { toast } from 'sonner'
import { UserRole } from '@/@types/auth.type'

// ===== UNIFIED HUB EVENT TYPES =====
// Định nghĩa các event types từ backend UnifiedHub

// Backend RealtimeEvent wrapper
interface RealtimeEventWrapper {
  orderId?: string
  oldStatus?: number
  newStatus?: number
  paymentStatus?: number
  orderCode?: string
  eventType: string
  entityId: string
  entityType: string
  data: Record<string, unknown>
  userId?: string | null
  targetUserId?: string | null
  targetUserIds?: string[] | null
  timestamp: string
  metadata?: Record<string, unknown>
}

interface OrderStatusChangedEvent {
  orderId: string
  orderItemId?: string
  oldStatus: string
  newStatus: string
  updatedBy?: string
  updatedAt: string
  customerMessage?: string
  internalNotes?: string
  orderCode?: string
}

interface TaskStatusChangedEvent {
  taskId: string
  orderId: string
  orderItemId: string
  taskType: string
  oldStatus: string
  newStatus: string
  assignedTo?: string
  completedBy?: string
  updatedAt: string
  estimatedTime?: number
  actualTime?: number
}

interface PaymentReceivedEvent {
  paymentId: string
  orderId: string
  amount: number
  paymentMethod: string
  customerName: string
  receivedAt: string
  paymentDetails?: Record<string, unknown>
}

interface NotificationCreatedEvent {
  id: string
  title: string
  body: string
  type: string
  actionUrl?: string
  receiverId: string
  createdAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
}

interface ChatMessageSentEvent {
  messageId: string
  roomId: string
  senderId: string
  senderName: string
  message: string
  timestamp: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE'
  attachments?: Array<{ url: string; type: string; name: string }>
}

interface UserStatusEvent {
  userId: string
  userName: string
  isOnline: boolean
  lastSeen?: string
  currentRole?: UserRole
}

interface SystemUpdateEvent {
  updateType: 'MAINTENANCE' | 'FEATURE' | 'SECURITY' | 'SYSTEM'
  title: string
  message: string
  scheduledAt?: string
  affectedModules?: string[]
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
}

// ===== EVENT MAP TYPE SAFETY =====
type UnifiedHubEventMap = {
  // Order & Task Events
  'ORDER_STATUS_CHANGED': [OrderStatusChangedEvent]
  'TASK_STATUS_CHANGED': [TaskStatusChangedEvent]
  'PAYMENT_RECEIVED': [PaymentReceivedEvent]
  
  // Communication Events  
  'NOTIFICATION_CREATED': [NotificationCreatedEvent]
  'CHAT_MESSAGE_SENT': [ChatMessageSentEvent]
  
  // User & System Events
  'USER_ONLINE': [UserStatusEvent]
  'USER_OFFLINE': [UserStatusEvent]
  'SYSTEM_UPDATE': [SystemUpdateEvent]
  
  // Connection Events
  'connectionStateChange': [boolean]
  'reconnecting': []
  'reconnected': []
  'error': [string]
}

type EventCallback<K extends keyof UnifiedHubEventMap> = (...args: UnifiedHubEventMap[K]) => void

// ===== CONFIGURATION =====
interface UnifiedHubConfig {
  autoConnect: boolean
  autoReconnect: boolean
  reconnectDelay: number
  maxReconnectAttempts: number
  enableNotifications: boolean
  enableToasts: boolean
  logLevel: signalR.LogLevel
}

const DEFAULT_CONFIG: UnifiedHubConfig = {
  autoConnect: true,
  autoReconnect: true,
  reconnectDelay: 2000,
  maxReconnectAttempts: 5,
  enableNotifications: true,
  enableToasts: true,
  logLevel: signalR.LogLevel.Information
}

// ===== UNIFIED HUB SERVICE CLASS =====
export class UnifiedHubService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private config: UnifiedHubConfig
  
  // Type-safe event listeners
  private listeners: Map<keyof UnifiedHubEventMap, EventCallback<keyof UnifiedHubEventMap>[]> = new Map()
  
  // Message queue for offline scenarios
  private messageQueue: Array<{ event: string; data: unknown }> = []
  private isOnline = true

  // Role-based groups the user has joined
  private joinedGroups: Set<string> = new Set()

  constructor(config: Partial<UnifiedHubConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    console.log('🔧 UnifiedHubService được khởi tạo với config:', this.config)
    
    this.setupAuthStateListener()
    this.setupNetworkStatusListener()
  }

  // ===== CONNECTION MANAGEMENT =====
  
  private createConnection(): signalR.HubConnection {
    const baseURL = import.meta.env.VITE_HUB_URL

    if (!baseURL) {
      throw new Error('VITE_HUB_URL không được định nghĩa trong environment variables')
    }

    const hubUrl = `${baseURL}/unifiedHub`
    console.log('🔗 Connecting to UnifiedHub URL:', hubUrl)

    const connectionBuilder = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const authStore = useAuthStore.getState()
          const token = authStore.accessToken || ''
          console.log('🔐 Using token for UnifiedHub:', token ? 'Token provided' : 'No token')
          return token
        },
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: false,
        withCredentials: false
      })
      .configureLogging(this.config.logLevel)

    if (this.config.autoReconnect) {
      connectionBuilder.withAutomaticReconnect([0, 2000, 10000, 30000])
    }

    const connection = connectionBuilder.build()

    return connection
  }

  async connect(): Promise<void> {
    const authStore = useAuthStore.getState()
    
    console.log('🔍 UnifiedHub connect attempt - Auth state:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.user,
      hasToken: !!authStore.accessToken,
      userId: authStore.user?.userId,
      role: authStore.user?.role
    })
    
    if (!authStore.isAuthenticated || !authStore.user) {
      console.warn('⚠️ Không thể kết nối UnifiedHub: chưa đăng nhập')
      return
    }

    if (this.isConnecting) {
      console.log('⏳ Đang trong quá trình kết nối UnifiedHub...')
      return
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ UnifiedHub đã kết nối')
      return
    }

    try {
      this.isConnecting = true
      console.log('🚀 Bắt đầu kết nối UnifiedHub...')

      if (!this.connection) {
        this.connection = this.createConnection()
        this.setupEventListeners()
        this.setupConnectionEvents()
      }

      await this.connection.start()
      console.log('🎉 Kết nối UnifiedHub thành công!')
      
      this.reconnectAttempts = 0
      this.emit('connectionStateChange', true)
      
      // Auto-join role-based groups
      await this.autoJoinGroups()
      
      // Process any queued messages
      await this.processMessageQueue()
      
    } catch (error) {
      console.error('❌ Lỗi khi kết nối UnifiedHub:', error)
      this.emit('connectionStateChange', false)
      this.emit('error', `Kết nối thất bại: ${error}`)
      throw error
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      console.log('🔌 Đang ngắt kết nối UnifiedHub...')
      
      try {
        // Leave all groups before disconnecting
        await this.leaveAllGroups()
        
        await this.connection.stop()
        console.log('✅ Đã ngắt kết nối UnifiedHub')
      } catch (error) {
        console.error('❌ Lỗi khi ngắt kết nối:', error)
      } finally {
        this.connection = null
        this.joinedGroups.clear()
        this.emit('connectionStateChange', false)
      }
    }
  }

  // ===== EVENT LISTENERS SETUP =====
  
  private setupEventListeners(): void {
    if (!this.connection) return

    // Backend RealtimeEvent handler - This is the main event from your backend
    this.connection.on('RealtimeEvent', (eventWrapper: RealtimeEventWrapper) => {
      console.log('📡 RealtimeEvent received:', eventWrapper)
      this.handleRealtimeEvent(eventWrapper)
    })

    // Order & Task Events
    this.connection.on('ORDER_STATUS_CHANGED', (event: OrderStatusChangedEvent) => {
      console.log('📦 Order status changed:', event)
      this.handleOrderStatusChanged(event)
      this.emit('ORDER_STATUS_CHANGED', event)
    })

    this.connection.on('TASK_STATUS_CHANGED', (event: TaskStatusChangedEvent) => {
      console.log('📋 Task status changed:', event)
      this.handleTaskStatusChanged(event)
      this.emit('TASK_STATUS_CHANGED', event)
    })

    this.connection.on('PAYMENT_RECEIVED', (event: PaymentReceivedEvent) => {
      console.log('💰 Payment received:', event)
      this.handlePaymentReceived(event)
      this.emit('PAYMENT_RECEIVED', event)
    })

    // Communication Events
    this.connection.on('NOTIFICATION_CREATED', (event: NotificationCreatedEvent) => {
      console.log('🔔 Notification created:', event)
      this.handleNotificationCreated(event)
      this.emit('NOTIFICATION_CREATED', event)
    })

    this.connection.on('CHAT_MESSAGE_SENT', (event: ChatMessageSentEvent) => {
      console.log('💬 Chat message sent:', event)
      this.handleChatMessageSent(event)
      this.emit('CHAT_MESSAGE_SENT', event)
    })

    // User & System Events
    this.connection.on('USER_ONLINE', (event: UserStatusEvent) => {
      console.log('🟢 User online:', event)
      this.emit('USER_ONLINE', event)
    })

    this.connection.on('USER_OFFLINE', (event: UserStatusEvent) => {
      console.log('🔴 User offline:', event)
      this.emit('USER_OFFLINE', event)
    })

    this.connection.on('SYSTEM_UPDATE', (event: SystemUpdateEvent) => {
      console.log('🔧 System update:', event)
      this.handleSystemUpdate(event)
      this.emit('SYSTEM_UPDATE', event)
    })

    console.log('✅ UnifiedHub event listeners đã được setup')
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return

    this.connection.onreconnecting((error) => {
      console.log('⚡ UnifiedHub đang reconnecting...', error?.message)
      this.emit('reconnecting')
      this.emit('connectionStateChange', false)
    })

    this.connection.onreconnected((connectionId) => {
      console.log('✅ UnifiedHub đã reconnected:', connectionId)
      this.reconnectAttempts = 0
      this.emit('reconnected')
      this.emit('connectionStateChange', true)
      
      // Re-join groups after reconnection
      this.autoJoinGroups().catch(error => {
        console.error('❌ Lỗi khi re-join groups sau reconnect:', error)
      })
    })

    this.connection.onclose((error) => {
      console.log('🔌 UnifiedHub connection đã đóng:', error?.message || 'Unknown reason')
      this.emit('connectionStateChange', false)
      
      const authStore = useAuthStore.getState()
      if (authStore.isAuthenticated && this.config.autoReconnect) {
        this.handleReconnection()
      }
    })
  }

  private setupAuthStateListener(): void {
    // Listen to auth state changes for auto-connect/disconnect
    useAuthStore.subscribe((state) => {
      const isAuthenticated = !!state.accessToken && !!state.user

      if (isAuthenticated && this.config.autoConnect && !this.isConnected) {
        console.log('🔐 User login detected, auto-connecting UnifiedHub...')
        this.connect().catch(error => {
          console.error('❌ Auto-connect UnifiedHub failed:', error)
        })
      } else if (!isAuthenticated && this.isConnected) {
        console.log('🔓 User logout detected, disconnecting UnifiedHub...')
        this.disconnect()
      }
    })
  }

  private setupNetworkStatusListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network back online')
        this.isOnline = true
        
        // Reconnect if we were connected before going offline
        if (!this.isConnected && useAuthStore.getState().isAuthenticated) {
          this.connect().catch(error => {
            console.error('❌ Failed to reconnect after network restored:', error)
          })
        }
      })

      window.addEventListener('offline', () => {
        console.log('📡 Network went offline')
        this.isOnline = false
      })
    }
  }

  // ===== GROUP MANAGEMENT =====
  
  private async autoJoinGroups(): Promise<void> {
    const authStore = useAuthStore.getState()
    
    if (!authStore.user || !this.isConnected) return

    try {
      const { user } = authStore
      
      // Join role-based group
      if (user.role) {
        await this.joinGroup(`role_${user.role.toLowerCase()}`)
      }
      
      // Join user-specific group  
      await this.joinGroup(`user_${user.userId}`)
      
      // Join additional groups based on role
      await this.joinRoleSpecificGroups(user.role!)
      
    } catch (error) {
      console.error('❌ Lỗi khi auto-join groups:', error)
    }
  }

  private async joinRoleSpecificGroups(role: UserRole): Promise<void> {
    switch (role) {
      case 'Admin':
        await this.joinGroup('admin_notifications')
        await this.joinGroup('system_alerts')
        break
        
      case 'BranchManager':
        await this.joinGroup('branch_notifications')
        await this.joinGroup('customer_orders')
        break
        
      case 'Manager':
        await this.joinGroup('production_updates')
        await this.joinGroup('quality_alerts')
        break
        
      case 'Designer':
        await this.joinGroup('design_requests')
        await this.joinGroup('template_updates')
        break
        
      case 'Staff':
        await this.joinGroup('task_assignments')
        await this.joinGroup('production_tasks')
        break
        
      default:
        console.warn(`⚠️ Unknown role: ${role}`)
    }
  }

  async joinGroup(groupName: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('UnifiedHub chưa kết nối')
    }

    try {
      await this.connection.invoke('JoinGroup', groupName)
      this.joinedGroups.add(groupName)
      console.log(`✅ Đã join group: ${groupName}`)
    } catch (error) {
      console.error(`❌ Lỗi khi join group ${groupName}:`, error)
      throw error
    }
  }

  async leaveGroup(groupName: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('UnifiedHub chưa kết nối')
    }

    try {
      await this.connection.invoke('LeaveGroup', groupName)
      this.joinedGroups.delete(groupName)
      console.log(`✅ Đã leave group: ${groupName}`)
    } catch (error) {
      console.error(`❌ Lỗi khi leave group ${groupName}:`, error)
      throw error
    }
  }

  private async leaveAllGroups(): Promise<void> {
    const promises = Array.from(this.joinedGroups).map(groupName => 
      this.leaveGroup(groupName).catch(error => 
        console.error(`❌ Lỗi khi leave group ${groupName}:`, error)
      )
    )
    
    await Promise.allSettled(promises)
  }

  // ===== REALTIME EVENT HANDLER =====
  
  private handleRealtimeEvent(eventWrapper: RealtimeEventWrapper): void {
    console.log('🎯 Processing RealtimeEvent:', eventWrapper.eventType, eventWrapper)
    
    switch (eventWrapper.eventType) {
      case 'order.status.changed':
        this.handleBackendOrderStatusChanged(eventWrapper)
        break
        
      case 'task.status.changed':
        this.handleBackendTaskStatusChanged(eventWrapper)
        break
        
      case 'payment.received':
        this.handleBackendPaymentReceived(eventWrapper)
        break
        
      case 'notification.created':
        this.handleBackendNotificationCreated(eventWrapper)
        break
        
      default:
        console.log('🤷 Unknown RealtimeEvent type:', eventWrapper.eventType)
    }
  }

  private handleBackendOrderStatusChanged(eventWrapper: RealtimeEventWrapper): void {
    const { data, orderId, orderCode, timestamp } = eventWrapper
    
    // Convert backend format to our internal format
    const orderEvent: OrderStatusChangedEvent = {
      orderId: orderId || data.orderId as string,
      orderCode: orderCode || data.orderCode as string,
      oldStatus: data.oldStatus as string,
      newStatus: data.newStatus as string,
      updatedBy: data.userId as string,
      updatedAt: timestamp,
      customerMessage: data.customerMessage as string,
      internalNotes: data.internalNotes as string
    }

    console.log('📦 Converted OrderStatusChanged:', orderEvent)
    
    // Handle the event internally
    this.handleOrderStatusChanged(orderEvent)
    
    // Emit to listeners
    this.emit('ORDER_STATUS_CHANGED', orderEvent)
  }

  private handleBackendTaskStatusChanged(eventWrapper: RealtimeEventWrapper): void {
    const { data, timestamp } = eventWrapper
    
    const taskEvent: TaskStatusChangedEvent = {
      taskId: data.taskId as string,
      orderId: data.orderId as string,
      orderItemId: data.orderItemId as string,
      taskType: data.taskType as string,
      oldStatus: data.oldStatus as string,
      newStatus: data.newStatus as string,
      assignedTo: data.assignedTo as string,
      completedBy: data.completedBy as string,
      updatedAt: timestamp,
      estimatedTime: data.estimatedTime as number,
      actualTime: data.actualTime as number
    }

    console.log('📋 Converted TaskStatusChanged:', taskEvent)
    this.handleTaskStatusChanged(taskEvent)
    this.emit('TASK_STATUS_CHANGED', taskEvent)
  }

  private handleBackendPaymentReceived(eventWrapper: RealtimeEventWrapper): void {
    const { data, timestamp } = eventWrapper
    
    const paymentEvent: PaymentReceivedEvent = {
      paymentId: data.paymentId as string,
      orderId: data.orderId as string,
      amount: data.amount as number,
      paymentMethod: data.paymentMethod as string,
      customerName: data.customerName as string,
      receivedAt: timestamp,
      paymentDetails: data.paymentDetails as Record<string, unknown>
    }

    console.log('💰 Converted PaymentReceived:', paymentEvent)
    this.handlePaymentReceived(paymentEvent)
    this.emit('PAYMENT_RECEIVED', paymentEvent)
  }

  private handleBackendNotificationCreated(eventWrapper: RealtimeEventWrapper): void {
    const { data, timestamp } = eventWrapper
    
    const notificationEvent: NotificationCreatedEvent = {
      id: data.id as string,
      title: data.title as string,
      body: data.body as string,
      type: data.type as string,
      actionUrl: data.actionUrl as string,
      receiverId: data.receiverId as string,
      createdAt: timestamp,
      priority: (data.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') || 'MEDIUM',
      category: data.category as string
    }

    console.log('🔔 Converted NotificationCreated:', notificationEvent)
    this.handleNotificationCreated(notificationEvent)
    this.emit('NOTIFICATION_CREATED', notificationEvent)
  }

  // ===== EVENT HANDLERS =====
  
  private handleOrderStatusChanged(event: OrderStatusChangedEvent): void {
    if (!this.config.enableToasts) return

    const statusMessages: Record<string, string> = {
      'CONFIRMED': '✅ Đơn hàng đã được xác nhận',
      'PROCESSING': '⚡ Đơn hàng đang được xử lý', 
      'MANUFACTURING': '🏭 Đơn hàng đang được sản xuất',
      'QUALITY_CHECK': '🔍 Đơn hàng đang kiểm tra chất lượng',
      'READY_FOR_DELIVERY': '📦 Đơn hàng sẵn sàng giao',
      'DELIVERED': '🎉 Đơn hàng đã được giao thành công',
      'CANCELLED': '❌ Đơn hàng đã bị hủy'
    }

    const message = statusMessages[event.newStatus] || `Đơn hàng cập nhật: ${event.newStatus}`
    
    toast.success(`Đơn hàng #${event.orderId}`, {
      description: message,
      duration: 5000,
      action: {
        label: 'Xem chi tiết',
        onClick: () => {
          // Navigate to order detail
          console.log('Navigate to order:', event.orderId)
        }
      }
    })
  }

  private handleTaskStatusChanged(event: TaskStatusChangedEvent): void {
    if (!this.config.enableToasts) return

    const statusMessages: Record<string, string> = {
      'ASSIGNED': '📋 Task đã được giao',
      'IN_PROGRESS': '⚡ Task đang thực hiện',
      'COMPLETED': '✅ Task đã hoàn thành',
      'FAILED': '❌ Task thất bại',
      'CANCELLED': '⏸️ Task đã bị hủy'
    }

    const message = statusMessages[event.newStatus] || `Task cập nhật: ${event.newStatus}`
    
    toast.info(`Task ${event.taskType}`, {
      description: message,
      duration: 4000
    })
  }

  private handlePaymentReceived(event: PaymentReceivedEvent): void {
    if (!this.config.enableToasts) return

    toast.success('💰 Thanh toán thành công', {
      description: `${event.customerName} đã thanh toán ${event.amount.toLocaleString('vi-VN')}đ`,
      duration: 6000,
      action: {
        label: 'Xem chi tiết',
        onClick: () => {
          console.log('Navigate to payment:', event.paymentId)
        }
      }
    })
  }

  private handleNotificationCreated(event: NotificationCreatedEvent): void {
    // Show browser notification if enabled
    if (this.config.enableNotifications) {
      notificationService.showNotification({
        title: event.title,
        body: event.body,
        tag: event.id,
        requireInteraction: event.priority === 'URGENT',
        data: {
          notificationId: event.id,
          actionUrl: event.actionUrl
        }
      }).catch(error => {
        console.error('❌ Lỗi khi hiển thị notification:', error)
      })
    }

    // Show toast notification
    if (this.config.enableToasts) {
      const priorityIcons: Record<string, string> = {
        'LOW': 'ℹ️',
        'MEDIUM': '⚠️',
        'HIGH': '🔥',
        'URGENT': '🚨'
      }

      const icon = priorityIcons[event.priority] || 'ℹ️'
      
      toast.message(`${icon} ${event.title}`, {
        description: event.body,
        duration: event.priority === 'URGENT' ? 10000 : 5000,
        action: event.actionUrl ? {
          label: 'Xem chi tiết',
          onClick: () => {
            console.log('Navigate to:', event.actionUrl)
          }
        } : undefined
      })
    }
  }

  private handleChatMessageSent(event: ChatMessageSentEvent): void {
    const authStore = useAuthStore.getState()
    
    // Only show notification if message is from another user
    if (event.senderId !== authStore.user?.userId) {
      if (this.config.enableNotifications) {
        notificationService.showChatMessageNotification(
          event.senderName,
          event.message,
          event.roomId
        ).catch(error => {
          console.error('❌ Lỗi khi hiển thị chat notification:', error)
        })
      }
    }
  }

  private handleSystemUpdate(event: SystemUpdateEvent): void {
    const severityIcons: Record<string, string> = {
      'INFO': 'ℹ️',
      'WARNING': '⚠️', 
      'CRITICAL': '🚨'
    }

    const icon = severityIcons[event.severity] || 'ℹ️'

    toast.message(`${icon} Cập nhật hệ thống`, {
      description: event.message,
      duration: event.severity === 'CRITICAL' ? 15000 : 8000,
      action: {
        label: 'Đọc thêm',
        onClick: () => {
          console.log('Show system update details:', event)
        }
      }
    })
  }

  // ===== RECONNECTION HANDLING =====
  
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ Đã hết số lần thử reconnect')
      this.emit('error', 'Không thể kết nối lại sau nhiều lần thử')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    )

    console.log(`🔄 Thử reconnect lần ${this.reconnectAttempts} sau ${delay}ms...`)

    setTimeout(() => {
      this.connect().catch(error => {
        console.error(`❌ Reconnect attempt ${this.reconnectAttempts} failed:`, error)
        this.handleReconnection() // Try again
      })
    }, delay)
  }

  // ===== OFFLINE MESSAGE QUEUE =====
  
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return

    console.log(`📤 Xử lý ${this.messageQueue.length} messages trong queue...`)
    
    const queuedMessages = [...this.messageQueue]
    this.messageQueue = []

    for (const { event, data } of queuedMessages) {
      try {
        // Process the queued message/event
        console.log('📨 Processing queued message:', event, data)
        // Add your logic here to handle queued messages
      } catch (error) {
        console.error('❌ Lỗi khi xử lý queued message:', error)
      }
    }
  }

  // ===== EVENT MANAGEMENT (TYPE SAFE) =====
  
  on<K extends keyof UnifiedHubEventMap>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback as EventCallback<keyof UnifiedHubEventMap>)
  }

  off<K extends keyof UnifiedHubEventMap>(event: K, callback: EventCallback<K>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback as EventCallback<keyof UnifiedHubEventMap>)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof UnifiedHubEventMap>(event: K, ...args: UnifiedHubEventMap[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          (callback as EventCallback<K>)(...args)
        } catch (error) {
          console.error(`❌ Lỗi trong event listener cho '${event}':`, error)
        }
      })
    }
  }

  // ===== PUBLIC API =====
  
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  get connectionState(): string {
    return this.connection?.state?.toString() || 'Disconnected'
  }

  get joinedGroupsList(): string[] {
    return Array.from(this.joinedGroups)
  }

  getConnectionInfo(): {
    isConnected: boolean
    state: string
    reconnectAttempts: number
    joinedGroups: string[]
    isOnline: boolean
    config: UnifiedHubConfig
  } {
    return {
      isConnected: this.isConnected,
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      joinedGroups: this.joinedGroupsList,
      isOnline: this.isOnline,
      config: this.config
    }
  }

  updateConfig(newConfig: Partial<UnifiedHubConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ UnifiedHub config updated:', this.config)
  }

  // Manual controls for testing/debugging
  async forceConnect(): Promise<void> {
    console.log('🔧 Force connecting UnifiedHub...')
    await this.connect()
  }

  async forceDisconnect(): Promise<void> {
    console.log('🔧 Force disconnecting UnifiedHub...')
    await this.disconnect()
  }

  // Cleanup method
  destroy(): void {
    console.log('🧹 Destroying UnifiedHub service...')
    this.listeners.clear()
    this.messageQueue = []
    this.joinedGroups.clear()
    
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }
}

// ===== SINGLETON INSTANCE =====
export const unifiedHubService = new UnifiedHubService()

// ===== EXPORT TYPES FOR EXTERNAL USE =====
export type {
  UnifiedHubEventMap,
  EventCallback,
  OrderStatusChangedEvent,
  TaskStatusChangedEvent,
  PaymentReceivedEvent,
  NotificationCreatedEvent,
  ChatMessageSentEvent,
  UserStatusEvent,
  SystemUpdateEvent,
  UnifiedHubConfig
}