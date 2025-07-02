// Notification related types matching server-side DTOs

export interface NotificationDto {
  id: string
  title: string
  body: string
  type: NotificationType
  userId: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export interface NotificationResponseDto {
  id: string
  title: string
  body: string
  type: NotificationType
  userId: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export interface NotificationCreateDto {
  title: string
  body: string
  type: NotificationType
  userId: string
  data?: Record<string, unknown>
}

export enum NotificationType {
  SYSTEM = 0,
  CHAT_MESSAGE = 1,
  ORDER_UPDATE = 2,
  APPOINTMENT_REMINDER = 3,
  USER_ACTION = 4,
  PROMOTION = 5
}

// SignalR specific types
export interface NotificationSignalRMessage {
  id: string
  title: string
  body: string
  type: NotificationType
  userId: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

// Pagination for notifications
export interface NotificationPaginationParams {
  index: number
  pageSize: number
  filter?: NotificationType | null
}

// Notification state for UI
export interface NotificationState {
  notifications: NotificationResponseDto[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
}

// Hook return type
export interface UseNotificationReturn {
  // State
  notifications: NotificationResponseDto[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  isConnected: boolean

  // Actions
  loadNotifications: (page?: number, pageSize?: number) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  getUnreadCount: () => Promise<void>
  clearError: () => void

  // Connection management
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}
