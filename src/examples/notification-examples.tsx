import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'
import { useNotification } from '@/services/notification/notification.service'
import { NotificationType } from '@/@types/notification.types'
import { Bell, RefreshCw, Check, Loader2 } from 'lucide-react'

/**
 * Example component demonstrating the notification system usage
 * This is for development/testing purposes
 */
export function NotificationExamples() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    isConnected,
    loadNotifications,
    markAsRead,
    getUnreadCount,
    clearError
  } = useNotificationSignalR()

  const { showSignalRNotification, requestPermission, hasPermission } = useNotification()

  // Example: Create a mock notification for testing
  const createMockNotification = (type: NotificationType) => {
    const mockNotifications = {
      [NotificationType.SYSTEM]: {
        title: 'System Update',
        body: 'The system has been updated with new features!'
      },
      [NotificationType.CHAT_MESSAGE]: {
        title: 'New Message',
        body: 'You have received a new chat message from Sarah'
      },
      [NotificationType.ORDER_UPDATE]: {
        title: 'Order Update',
        body: 'Your order #12345 has been shipped and is on the way'
      },
      [NotificationType.APPOINTMENT_REMINDER]: {
        title: 'Appointment Reminder',
        body: 'You have an appointment tomorrow at 2:00 PM'
      },
      [NotificationType.USER_ACTION]: {
        title: 'Profile Updated',
        body: 'Your profile information has been successfully updated'
      },
      [NotificationType.PROMOTION]: {
        title: 'Special Offer!',
        body: '50% off on all maternity dresses this weekend only!'
      }
    }

    const mock = mockNotifications[type]
    const notification = {
      id: `mock-${Date.now()}`,
      title: mock.title,
      body: mock.body,
      type,
      userId: 'current-user',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: { source: 'example', type: 'mock' }
    }

    showSignalRNotification(notification)
  }

  const handleRequestPermission = async () => {
    try {
      await requestPermission()
    } catch (error) {
      console.error('Failed to request notification permission:', error)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Notification System Examples
        </h1>
        <p className="text-muted-foreground">
          Demonstrate and test the real-time notification system
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
            <Badge variant="outline">
              Unread: {unreadCount}
            </Badge>
            {!hasPermission && (
              <Button onClick={handleRequestPermission} size="sm" variant="outline">
                Request Notification Permission
              </Button>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <Button onClick={clearError} size="sm" variant="outline" className="mt-2">
                Clear Error
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={() => createMockNotification(NotificationType.SYSTEM)}
              variant="outline"
            >
              🔔 System
            </Button>
            <Button 
              onClick={() => createMockNotification(NotificationType.CHAT_MESSAGE)}
              variant="outline"
            >
              💬 Chat
            </Button>
            <Button 
              onClick={() => createMockNotification(NotificationType.ORDER_UPDATE)}
              variant="outline"
            >
              📦 Order
            </Button>
            <Button 
              onClick={() => createMockNotification(NotificationType.APPOINTMENT_REMINDER)}
              variant="outline"
            >
              📅 Appointment
            </Button>
            <Button 
              onClick={() => createMockNotification(NotificationType.USER_ACTION)}
              variant="outline"
            >
              👤 User Action
            </Button>
            <Button 
              onClick={() => createMockNotification(NotificationType.PROMOTION)}
              variant="outline"
            >
              🎉 Promotion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Notification Management
            <div className="flex gap-2">
              <Button 
                onClick={() => loadNotifications(1, 10)} 
                size="sm" 
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reload
              </Button>
              <Button 
                onClick={getUnreadCount} 
                size="sm" 
                variant="outline"
              >
                Get Count
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && notifications.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 border rounded-lg ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                        {notification.isRead ? 'Read' : 'Unread'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  ... and {notifications.length - 5} more notifications
                </p>
              )}
              
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={() => loadNotifications(Math.floor(notifications.length / 10) + 1, 10)}
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try connecting to the server or creating test notifications
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Real Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Real notifications come from the server via SignalR. Check the notification dropdown 
              in the header (bell icon) to see all notifications in a proper UI.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Environment Setup</h4>
            <p className="text-sm text-muted-foreground">
              Make sure you have <code className="bg-muted px-1 rounded">VITE_API_NOTIFICATION_HUB</code> or 
              <code className="bg-muted px-1 rounded">VITE_API_BASE_URL</code> set in your environment variables.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Integration</h4>
            <p className="text-sm text-muted-foreground">
              The notification system is automatically integrated into the main layout. 
              No additional setup required for basic usage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 