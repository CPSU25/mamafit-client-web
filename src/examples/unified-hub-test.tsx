import React from 'react'
import { 
  unifiedHubService, 
  useUnifiedHubConnection, 
  useNotificationUpdates,
  type OrderStatusChangedEvent,
  type TaskStatusChangedEvent,
  type PaymentReceivedEvent,
  type UserStatusEvent,
  type SystemUpdateEvent,
  type ChatMessageSentEvent
} from '@/services/signalr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Bell, 
  Activity, 
  Settings,
  Plug,
  Unplug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

export default function UnifiedHubTestPage() {
  const [lastUpdate, setLastUpdate] = React.useState<string>('')
  
  // Connection status
  const { 
    isConnected, 
    connectionState, 
    reconnectAttempts, 
    connectionInfo 
  } = useUnifiedHubConnection()

  // Notifications
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotificationUpdates({
    onNotificationReceived: (notification) => {
      setLastUpdate(`Notification: ${notification.title} - ${new Date().toLocaleTimeString()}`)
    }
  })

  // Manual controls
  const handleForceConnect = async () => {
    try {
      await unifiedHubService.forceConnect()
      setLastUpdate(`Force connect - ${new Date().toLocaleTimeString()}`)
    } catch (error) {
      setLastUpdate(`Force connect failed: ${error} - ${new Date().toLocaleTimeString()}`)
    }
  }

  const handleForceDisconnect = async () => {
    await unifiedHubService.forceDisconnect()
    setLastUpdate(`Force disconnect - ${new Date().toLocaleTimeString()}`)
  }

  const handleUpdateConfig = () => {
    unifiedHubService.updateConfig({
      enableToasts: true,
      enableNotifications: true,
      logLevel: 0 // Debug level
    })
    setLastUpdate(`Config updated - ${new Date().toLocaleTimeString()}`)
  }

  const getStatusIcon = () => {
    return isConnected ? (
      <Wifi className="h-5 w-5 text-green-500" />
    ) : (
      <WifiOff className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = () => {
    const variant = isConnected ? 'default' : 'destructive'
    const text = isConnected ? 'Connected' : 'Disconnected'
    return <Badge variant={variant}>{text}</Badge>
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <XCircle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'LOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  // Listen to all events for debugging
  React.useEffect(() => {
    const handleOrderUpdate = (event: OrderStatusChangedEvent) => {
      setLastUpdate(`Order Update: ${event.orderId} -> ${event.newStatus} - ${new Date().toLocaleTimeString()}`)
    }

    const handleTaskUpdate = (event: TaskStatusChangedEvent) => {
      setLastUpdate(`Task Update: ${event.taskId} -> ${event.newStatus} - ${new Date().toLocaleTimeString()}`)
    }

    const handlePayment = (event: PaymentReceivedEvent) => {
      setLastUpdate(`Payment: ${event.amount}đ for order ${event.orderId} - ${new Date().toLocaleTimeString()}`)
    }

    const handleUserOnline = (event: UserStatusEvent) => {
      setLastUpdate(`User Online: ${event.userName} - ${new Date().toLocaleTimeString()}`)
    }

    const handleUserOffline = (event: UserStatusEvent) => {
      setLastUpdate(`User Offline: ${event.userName} - ${new Date().toLocaleTimeString()}`)
    }

    const handleSystemUpdate = (event: SystemUpdateEvent) => {
      setLastUpdate(`System Update: ${event.title} (${event.severity}) - ${new Date().toLocaleTimeString()}`)
    }

    const handleChatMessage = (event: ChatMessageSentEvent) => {
      setLastUpdate(`Chat: ${event.senderName} in room ${event.roomId} - ${new Date().toLocaleTimeString()}`)
    }

    const handleConnectionChange = (connected: boolean) => {
      setLastUpdate(`Connection: ${connected ? 'Connected' : 'Disconnected'} - ${new Date().toLocaleTimeString()}`)
    }

    const handleError = (error: string) => {
      setLastUpdate(`Error: ${error} - ${new Date().toLocaleTimeString()}`)
    }

    // Subscribe to all events
    unifiedHubService.on('ORDER_STATUS_CHANGED', handleOrderUpdate)
    unifiedHubService.on('TASK_STATUS_CHANGED', handleTaskUpdate)
    unifiedHubService.on('PAYMENT_RECEIVED', handlePayment)
    unifiedHubService.on('USER_ONLINE', handleUserOnline)
    unifiedHubService.on('USER_OFFLINE', handleUserOffline)
    unifiedHubService.on('SYSTEM_UPDATE', handleSystemUpdate)
    unifiedHubService.on('CHAT_MESSAGE_SENT', handleChatMessage)
    unifiedHubService.on('connectionStateChange', handleConnectionChange)
    unifiedHubService.on('error', handleError)

    return () => {
      // Cleanup listeners
      unifiedHubService.off('ORDER_STATUS_CHANGED', handleOrderUpdate)
      unifiedHubService.off('TASK_STATUS_CHANGED', handleTaskUpdate)
      unifiedHubService.off('PAYMENT_RECEIVED', handlePayment)
      unifiedHubService.off('USER_ONLINE', handleUserOnline)
      unifiedHubService.off('USER_OFFLINE', handleUserOffline)
      unifiedHubService.off('SYSTEM_UPDATE', handleSystemUpdate)
      unifiedHubService.off('CHAT_MESSAGE_SENT', handleChatMessage)
      unifiedHubService.off('connectionStateChange', handleConnectionChange)
      unifiedHubService.off('error', handleError)
    }
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UnifiedHub Test</h1>
          <p className="text-muted-foreground">
            Test và monitor UnifiedHub SignalR service
          </p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Connection Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge()}
              <div className="text-sm text-muted-foreground">
                State: {connectionState}
              </div>
              {reconnectAttempts > 0 && (
                <div className="text-sm text-orange-500">
                  Reconnect attempts: {reconnectAttempts}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionInfo.joinedGroups.length}</div>
            <div className="text-xs text-muted-foreground">
              {connectionInfo.joinedGroups.join(', ') || 'No groups'}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <div className="text-xs text-muted-foreground">
              {notifications.length} total notifications
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Controls</CardTitle>
            <CardDescription>
              Test connection và configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleForceConnect} 
                disabled={isConnected}
                size="sm"
              >
                <Plug className="h-4 w-4 mr-2" />
                Force Connect
              </Button>
              <Button 
                onClick={handleForceDisconnect} 
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                <Unplug className="h-4 w-4 mr-2" />
                Force Disconnect
              </Button>
            </div>
            
            <Button 
              onClick={handleUpdateConfig} 
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Config
            </Button>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Last Update</h4>
              <div className="text-sm bg-muted p-2 rounded text-muted-foreground">
                {lastUpdate || 'No updates yet...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Info</CardTitle>
            <CardDescription>
              Detailed connection information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <pre className="text-xs">
                {JSON.stringify(connectionInfo, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Real-time notifications từ UnifiedHub
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={markAllAsRead} 
              size="sm" 
              variant="outline"
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button 
              onClick={clearNotifications} 
              size="sm" 
              variant="outline"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No notifications yet. Try triggering some events from the backend.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        {getPriorityIcon(notification.priority)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}