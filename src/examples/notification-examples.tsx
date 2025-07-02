import { useEffect } from 'react'
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'
import { NotificationResponseDto } from '@/services/notification/notification-signalr.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, BellRing, Check, Trash2, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Combined example component
 */
export function NotificationExamples() {
  useEffect(() => {
    console.log('🔔 NotificationExamples component mounted')
  }, [])

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Notification System Examples</h1>
        <p className='text-muted-foreground mt-2'>
          Examples of how to use the real-time notification system. Make sure you're logged in to receive notifications.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <NotificationStatus />
        <NotificationList />
      </div>

      <div className='mt-8 p-4 border rounded-lg bg-muted/50'>
        <h3 className='text-lg font-semibold mb-2'>How it works:</h3>
        <ul className='text-sm text-muted-foreground space-y-1'>
          <li>• The notification service automatically connects when you log in</li>
          <li>• Real-time notifications are received via SignalR WebSocket</li>
          <li>• Browser notifications are shown (if permission granted)</li>
          <li>• Toast notifications appear in the UI</li>
          <li>• Notifications are stored locally and can be managed</li>
          <li>• Connection is automatically maintained with reconnection logic</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component hiển thị notification status và controls
 */
export function NotificationStatus() {
  const { isConnected, connectionState, connectionInfo, connect, disconnect, forceConnect, forceDisconnect } =
    useNotificationSignalR({
      autoConnect: true,
      onReceiveNotification: (notification: NotificationResponseDto) => {
        // Show toast when receiving new notification
        toast.success(`🔔 ${notification.notificationTitle}`, {
          description: notification.notificationContent,
          duration: 5000
        })
      },
      onConnectionStateChange: (connected: boolean) => {
        if (connected) {
          toast.success('🎉 Connected to notification server!')
        } else {
          toast.error('❌ Disconnected from notification server')
        }
      },
      onError: (error: string) => {
        toast.error(`❌ Notification Error: ${error}`)
      }
    })

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {isConnected ? <Wifi className='h-5 w-5 text-green-500' /> : <WifiOff className='h-5 w-5 text-red-500' />}
          Notification Status
        </CardTitle>
        <CardDescription>Real-time notification connection status</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Connection:</span>
          <Badge variant={isConnected ? 'default' : 'destructive'}>{connectionState}</Badge>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Auto-connect:</span>
          <Badge variant={connectionInfo.autoConnectEnabled ? 'default' : 'secondary'}>
            {connectionInfo.autoConnectEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Reconnect attempts:</span>
          <Badge variant='outline'>{connectionInfo.reconnectAttempts}</Badge>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            size='sm'
            onClick={isConnected ? disconnect : connect}
            variant={isConnected ? 'destructive' : 'default'}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button size='sm' variant='secondary' onClick={forceConnect}>
            Force Connect
          </Button>

          <Button size='sm' variant='secondary' onClick={forceDisconnect}>
            Force Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Component hiển thị danh sách notifications
 */
export function NotificationList() {
  const { notifications, unreadCount, markAsReadLocally, removeNotification, clearNotifications } =
    useNotificationSignalR({
      autoConnect: true,
      onReceiveNotification: (notification: NotificationResponseDto) => {
        console.log('🔔 New notification received in list:', notification)
      }
    })

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Notifications
          {unreadCount > 0 && (
            <Badge variant='destructive' className='ml-2'>
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Real-time notifications from server</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='text-sm text-muted-foreground'>{notifications.length} notifications total</div>
          <Button size='sm' variant='outline' onClick={clearNotifications} disabled={notifications.length === 0}>
            Clear All
          </Button>
        </div>

        <div className='space-y-2 max-h-96 overflow-y-auto'>
          {notifications.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              No notifications yet. Connect to start receiving notifications.
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsReadLocally(notification.id)}
                onRemove={() => removeNotification(notification.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Component cho từng notification item
 */
interface NotificationItemProps {
  notification: NotificationResponseDto
  onMarkAsRead: () => void
  onRemove: () => void
}

function NotificationItem({ notification, onMarkAsRead, onRemove }: NotificationItemProps) {
  const formattedDate = new Date(notification.createdAt).toLocaleString()

  return (
    <div className={`p-3 border rounded-lg ${notification.isRead ? 'bg-muted/50' : 'bg-card'}`}>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h4 className='text-sm font-medium truncate'>{notification.notificationTitle || 'No title'}</h4>
            {!notification.isRead && (
              <Badge variant='destructive' className='shrink-0'>
                <BellRing className='h-3 w-3' />
              </Badge>
            )}
            {notification.type && (
              <Badge variant='outline' className='shrink-0'>
                {notification.type}
              </Badge>
            )}
          </div>

          {notification.notificationContent && (
            <p className='text-xs text-muted-foreground mt-1'>{notification.notificationContent}</p>
          )}

          <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
            <span>{formattedDate}</span>
            {notification.actionUrl && <span className='text-blue-500'>Has action</span>}
          </div>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          {!notification.isRead && (
            <Button size='sm' variant='ghost' onClick={onMarkAsRead} className='h-6 w-6 p-0'>
              <Check className='h-3 w-3' />
            </Button>
          )}
          <Button
            size='sm'
            variant='ghost'
            onClick={onRemove}
            className='h-6 w-6 p-0 text-destructive hover:text-destructive'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      </div>
    </div>
  )
}
