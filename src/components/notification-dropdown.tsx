import { useState, useEffect } from 'react'
import { Bell, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'
import { useNotification } from '@/services/notification/notification.service'
import { NotificationResponseDto as SignalRNotification } from '@/services/notification/notification-signalr.service'
import { NotificationType } from '@/@types/notification.types'
import { cn } from '@/lib/utils/utils'

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsReadLocally,
    clearNotifications
  } = useNotificationSignalR()

  const { showSignalRNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen && notifications.length > 0) {
      const latestNotification = notifications[0]
      if (latestNotification && !latestNotification.isRead) {
        // Check if this is a newly received notification
        const createdAt = typeof latestNotification.createdAt === 'string' 
          ? new Date(latestNotification.createdAt)
          : latestNotification.createdAt
        const isVeryRecent = createdAt.getTime() > Date.now() - 5000 // 5 seconds
        if (isVeryRecent) {
          const toastNotification = {
            id: latestNotification.id,
            title: latestNotification.notificationTitle || 'Thông báo mới',
            body: latestNotification.notificationContent || '',
            type: getNotificationTypeFromString(latestNotification.type),
            userId: latestNotification.receiverId || '',
            isRead: latestNotification.isRead,
            createdAt: typeof latestNotification.createdAt === 'string' 
              ? latestNotification.createdAt 
              : latestNotification.createdAt.toISOString(),
            data: latestNotification.metadata ? JSON.parse(latestNotification.metadata) : undefined
          }
          showSignalRNotification(toastNotification)
        }
      }
    }
  }, [notifications, isOpen, showSignalRNotification])

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadLocally(notificationId)
  }

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead)
    unreadNotifications.forEach((notification) => {
      markAsReadLocally(notification.id)
    })
  }

  const handleClearAll = () => {
    clearNotifications()
  }

  const getNotificationTypeFromString = (type?: string): NotificationType => {
    if (!type) return NotificationType.SYSTEM
    
    const typeMap: Record<string, NotificationType> = {
      'CHAT_MESSAGE': NotificationType.CHAT_MESSAGE,
      'ORDER_UPDATE': NotificationType.ORDER_UPDATE,
      'APPOINTMENT_REMINDER': NotificationType.APPOINTMENT_REMINDER,
      'USER_ACTION': NotificationType.USER_ACTION,
      'PROMOTION': NotificationType.PROMOTION,
      'SYSTEM': NotificationType.SYSTEM
    }
    
    return typeMap[type.toUpperCase()] || NotificationType.SYSTEM
  }

  const getNotificationIcon = (type?: string) => {
    const notificationType = getNotificationTypeFromString(type)
    switch (notificationType) {
      case NotificationType.CHAT_MESSAGE:
        return '💬'
      case NotificationType.ORDER_UPDATE:
        return '📦'
      case NotificationType.APPOINTMENT_REMINDER:
        return '📅'
      case NotificationType.USER_ACTION:
        return '👤'
      case NotificationType.PROMOTION:
        return '🎉'
      case NotificationType.SYSTEM:
      default:
        return '🔔'
    }
  }

  const formatRelativeTime = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return date.toLocaleDateString('vi-VN')
  }

  const renderNotificationItem = (notification: SignalRNotification) => (
    <DropdownMenuItem
      key={notification.id}
      className={cn(
        'flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50',
        !notification.isRead && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
      onClick={() => handleMarkAsRead(notification.id)}
    >
      <div className='flex items-start gap-3 w-full'>
        <span className='text-lg flex-shrink-0'>{getNotificationIcon(notification.type)}</span>
        <div className='flex-1 min-w-0'>
          <p className={cn('text-sm font-medium truncate', !notification.isRead && 'font-semibold')}>
            {notification.notificationTitle || 'Thông báo'}
          </p>
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {notification.notificationContent || 'Không có nội dung'}
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className='flex-shrink-0'>
            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
          </div>
        )}
      </div>
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className={cn('relative', className)} disabled={!isConnected}>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-80 p-0' sideOffset={8}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h4 className='font-semibold'>Thông báo</h4>
          <div className='flex items-center gap-2'>
            {!isConnected && <AlertCircle className='h-4 w-4 text-orange-500' />}
            {unreadCount > 0 && (
              <Button variant='ghost' size='sm' onClick={handleMarkAllAsRead} className='text-xs'>
                <Check className='h-4 w-4 mr-1' />
                Đánh dấu tất cả
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant='ghost' size='sm' onClick={handleClearAll} className='text-xs text-red-600'>
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isInitializing && (
          <div className='p-8 text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>Đang kết nối...</p>
          </div>
        )}

        {/* Not connected state */}
        {!isConnected && !isInitializing && (
          <div className='p-8 text-center'>
            <AlertCircle className='h-8 w-8 text-orange-500 mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>Không có kết nối đến server thông báo</p>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length > 0 && isConnected && (
          <ScrollArea className='max-h-96'>
            <div className='py-1'>{notifications.map(renderNotificationItem)}</div>
          </ScrollArea>
        )}

        {/* Empty state */}
        {notifications.length === 0 && !isInitializing && isConnected && (
          <div className='p-8 text-center'>
            <Bell className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>Không có thông báo nào</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
