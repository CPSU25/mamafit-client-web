import { toast } from 'sonner'
import { notificationSignalRService } from './notification-signalr.service'
import { NotificationResponseDto } from '@/@types/notification.types'

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  silent?: boolean
  requireInteraction?: boolean
  actions?: Array<{ title: string; action: string }>
  data?: Record<string, unknown>
}

export class NotificationService {
  private permission: NotificationPermission = 'default'
  private isSupported: boolean

  constructor() {
    this.isSupported = 'Notification' in window
    if (this.isSupported) {
      this.permission = Notification.permission
    }
  }

  // Kiểm tra và yêu cầu quyền notification
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Browser không hỗ trợ Notification API')
      return 'denied'
    }

    if (this.permission === 'granted') {
      return 'granted'
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission
  }

  // Hiển thị desktop notification
  private showDesktopNotification(options: NotificationOptions): Notification | null {
    if (!this.isSupported || this.permission !== 'granted') {
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/images/mamafit-logo.svg',
        tag: options.tag,
        silent: options.silent || false,
        requireInteraction: options.requireInteraction || false,
        data: options.data
      })

      // Auto close sau 5 giây nếu không có requireInteraction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Lỗi khi hiển thị desktop notification:', error)
      return null
    }
  }

  // Hiển thị toast notification với Sonner
  private showToastNotification(options: NotificationOptions): void {
    const toastOptions = {
      description: options.body,
      duration: 4000,
      action: options.actions?.[0]
        ? {
            label: options.actions[0].title,
            onClick: () => {
              // Handle action click nếu cần
              console.log('Toast action clicked:', options.actions?.[0])
            }
          }
        : undefined
    }

    toast.message(options.title, toastOptions)
  }

  // Method chính để hiển thị notification
  async showNotification(options: NotificationOptions): Promise<void> {
    // Kiểm tra permission trước
    if (this.permission === 'default') {
      // Tự động yêu cầu permission nếu chưa có
      await this.requestPermission()
    }

    // Ưu tiên desktop notification nếu có permission, ngược lại dùng toast
    if (this.permission === 'granted') {
      this.showDesktopNotification(options)
    } else {
      // Chỉ hiển thị toast nếu không có desktop permission
      this.showToastNotification(options)
    }
  }

  // Method tiện ích cho tin nhắn chat
  async showChatMessageNotification(
    senderName: string,
    message: string,
    roomId: string,
    avatar?: string
  ): Promise<void> {
    const options: NotificationOptions = {
      title: `Tin nhắn mới từ ${senderName}`,
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      icon: avatar || '/images/mamafit-logo.svg',
      tag: `chat-${roomId}`, // Dùng tag để group notifications từ cùng một room
      requireInteraction: false,
      data: {
        type: 'chat_message',
        roomId,
        senderId: senderName
      }
    }

    await this.showNotification(options)
  }

  // Method tiện ích cho SignalR notifications
  async showSignalRNotification(notification: NotificationResponseDto): Promise<void> {
    const options: NotificationOptions = {
      title: notification.title,
      body: notification.body,
      icon: '/images/mamafit-logo.svg',
      tag: `signalr-${notification.id}`,
      requireInteraction: false,
      data: {
        type: 'signalr_notification',
        notificationId: notification.id,
        notificationType: notification.type,
        ...notification.data
      }
    }

    await this.showNotification(options)
  }

  // Check permission status
  get hasPermission(): boolean {
    return this.permission === 'granted'
  }

  get isNotificationSupported(): boolean {
    return this.isSupported
  }

  get permissionStatus(): NotificationPermission {
    return this.permission
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// Export hooks for React components
export const useNotification = () => {
  const requestPermission = async () => {
    const permission = await notificationService.requestPermission()
    return permission
  }

  const showNotification = async (options: NotificationOptions) => {
    await notificationService.showNotification(options)
  }

  const showChatNotification = async (senderName: string, message: string, roomId: string, avatar?: string) => {
    await notificationService.showChatMessageNotification(senderName, message, roomId, avatar)
  }

  const showSignalRNotification = async (notification: NotificationResponseDto) => {
    await notificationService.showSignalRNotification(notification)
  }

  return {
    requestPermission,
    showNotification,
    showChatNotification,
    showSignalRNotification,
    hasPermission: notificationService.hasPermission,
    isSupported: notificationService.isNotificationSupported,
    permissionStatus: notificationService.permissionStatus,
    // SignalR service integration
    signalRService: notificationSignalRService
  }
}
