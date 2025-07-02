import { useState, useEffect } from 'react'
import { Bell, Check, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'
import { useNotification } from '@/services/notification/notification.service'
import { NotificationResponseDto, NotificationType } from '@/@types/notification.types'
import { cn } from '@/lib/utils/utils'

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isConnected,
    loadNotifications,
    markAsRead,
    clearError
  } = useNotificationSignalR()

  const { showSignalRNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)

  // Load notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && isConnected && notifications.length === 0) {
      loadNotifications(1, 10)
    }
  }, [isOpen, isConnected, notifications.length, loadNotifications])

  // Show toast for new notifications (only if dropdown is closed)
  useEffect(() => {
    if (!isOpen && notifications.length > 0) {
      const latestNotification = notifications[0]
      if (latestNotification && !latestNotification.isRead) {
        // Check if this is a newly received notification
        const isVeryRecent = new Date(latestNotification.createdAt).getTime() > Date.now() - 5000 // 5 seconds
        if (isVeryRecent) {
          showSignalRNotification(latestNotification)
        }
      }
    }
  }, [notifications, isOpen, showSignalRNotification])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    for (const notification of unreadNotifications) {
      try {
        await markAsRead(notification.id)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
    
    return date.toLocaleDateString('vi-VN')
  }

  const renderNotificationItem = (notification: NotificationResponseDto) => (
    <DropdownMenuItem
      key={notification.id}
      className={cn(
        'flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50',
        !notification.isRead && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
      onClick={() => handleMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3 w-full">
        <span className="text-lg flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            !notification.isRead && 'font-semibold'
          )}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn('relative', className)}
          disabled={!isConnected}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Thông báo</h4>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="h-4 w-4 mr-1" />
                Đánh dấu tất cả
              </Button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && notifications.length === 0 && (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
          </div>
        )}

        {/* Not connected state */}
        {!isConnected && !error && (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Không có kết nối đến server thông báo
            </p>
          </div>
        )}

        {/* Notifications list */}
        {notifications.length > 0 && !error && (
          <ScrollArea className="max-h-96">
            <div className="py-1">
              {notifications.map(renderNotificationItem)}
            </div>
            
            {/* Load more button */}
            {hasMore && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => loadNotifications(Math.floor(notifications.length / 10) + 1, 10)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm'
                  )}
                </Button>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Empty state */}
        {notifications.length === 0 && !isLoading && !error && isConnected && (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Không có thông báo nào
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 