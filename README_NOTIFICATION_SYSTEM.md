# Notification System Implementation

This document describes the implementation of the real-time notification system using SignalR for the MamaFit application.

## Features

- ✅ Real-time notification delivery via SignalR
- ✅ Desktop and toast notification support
- ✅ Unread notification count with badge display
- ✅ Notification history with pagination
- ✅ Mark notifications as read functionality
- ✅ Auto-connect/disconnect based on authentication
- ✅ Responsive notification dropdown UI
- ✅ Multiple notification types with icons

## Architecture

### Components

1. **NotificationSignalRService** - Core SignalR connection and communication
2. **useNotificationSignalR** - React hook for notification state management
3. **NotificationDropdown** - UI component for displaying notifications
4. **NotificationService** - Integration with desktop/toast notifications

### Files Added/Modified

```
src/
├── @types/
│   └── notification.types.ts          # TypeScript types
├── components/
│   └── notification-dropdown.tsx      # Notification UI component
├── hooks/
│   └── use-notification-signalr.ts    # React hook
├── services/
│   └── notification/
│       ├── notification-signalr.service.ts  # SignalR service
│       └── notification.service.ts          # Updated with SignalR integration
└── layouts/
    └── system.layout.tsx              # Updated to include NotificationDropdown
```

## Setup

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```bash
# Option 1: Specific notification hub URL
VITE_API_NOTIFICATION_HUB=https://your-api-server.com

# Option 2: Use the same as your base API URL
VITE_API_BASE_URL=https://your-api-server.com
```

The system will use `VITE_API_NOTIFICATION_HUB` if available, otherwise falls back to `VITE_API_BASE_URL`.

### 2. Server-Side Hub URL

The client connects to `/notificationHub` endpoint, which should match your server's hub configuration:

```csharp
app.MapHub<NotificationHub>("/notificationHub");
```

## Usage

### Basic Usage

The notification system is automatically integrated into the main layout. Just ensure your user is authenticated:

```tsx
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    isConnected,
    loadNotifications,
    markAsRead,
    getUnreadCount
  } = useNotificationSignalR()

  // Component will automatically connect when authenticated
  // and show notifications in the header dropdown
}
```

### Manual Notification Display

To show custom notifications:

```tsx
import { useNotification } from '@/services/notification/notification.service'

function MyComponent() {
  const { showSignalRNotification } = useNotification()
  
  const handleShowNotification = () => {
    const notification = {
      id: 'custom-1',
      title: 'Custom Notification',
      body: 'This is a custom notification',
      type: NotificationType.SYSTEM,
      userId: 'user-id',
      isRead: false,
      createdAt: new Date().toISOString()
    }
    
    showSignalRNotification(notification)
  }
}
```

## Notification Types

The system supports multiple notification types with appropriate icons:

```typescript
enum NotificationType {
  SYSTEM = 0,           // 🔔
  CHAT_MESSAGE = 1,     // 💬
  ORDER_UPDATE = 2,     // 📦
  APPOINTMENT_REMINDER = 3, // 📅
  USER_ACTION = 4,      // 👤
  PROMOTION = 5         // 🎉
}
```

## Server Integration

### Sending Notifications from Server

Use the static methods in your NotificationHub to send notifications:

```csharp
// Send to a specific user
await NotificationHub.SendNotificationToUserAsync(hubContext, userId, notification);

// Send to multiple users
await NotificationHub.SendNotificationToMultipleUsersAsync(hubContext, userIds, notification);

// Update unread count
await NotificationHub.SendUnreadCountToUserAsync(hubContext, userId, count);
```

### Example Controller Usage

```csharp
[ApiController]
public class NotificationController : ControllerBase
{
    private readonly IHubContext<NotificationHub> _hubContext;
    
    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] NotificationDto notification)
    {
        // Save notification to database
        // ...
        
        // Send real-time notification
        await NotificationHub.SendNotificationToUserAsync(_hubContext, notification.UserId, notification);
        
        return Ok();
    }
}
```

## Features Details

### 1. Real-time Connection

- Automatically connects when user logs in
- Automatically disconnects when user logs out
- Handles connection errors gracefully
- Shows connection status in UI

### 2. Notification Display

- **Desktop Notifications**: Browser native notifications (requires permission)
- **Toast Notifications**: In-app toast messages using Sonner
- **Dropdown List**: Comprehensive notification history

### 3. Unread Count Badge

- Shows unread count in header bell icon
- Updates in real-time
- Supports 99+ display for large numbers

### 4. State Management

- Prevents duplicate notifications
- Handles pagination for large notification lists
- Optimistic UI updates for mark-as-read
- Automatic retry on connection failures

## Customization

### Styling

The notification dropdown uses your existing design system:

```tsx
// Modify notification-dropdown.tsx
<DropdownMenuContent 
  align="end" 
  className="w-80 p-0"  // Customize width and padding
  sideOffset={8}
>
```

### Notification Icons

Customize notification type icons in the `getNotificationIcon` function:

```tsx
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.CHAT_MESSAGE:
      return '💬'  // Change to any emoji or icon
    // ... more cases
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check environment variables
   - Verify server URL and hub endpoint
   - Check authentication token

2. **Notifications Not Appearing**
   - Check browser notification permissions
   - Verify SignalR connection status
   - Check console for errors

3. **Duplicate Notifications**
   - System has built-in duplicate prevention
   - Check server-side notification logic

### Debug Mode

Enable detailed logging by checking browser console for messages prefixed with:
- 🚀 Connection events
- 🔔 Received notifications
- ✅ Success operations
- ❌ Error messages

## Performance Considerations

- Notifications are paginated (10 per page by default)
- Old processed message IDs are cleaned up automatically
- Connection reuses existing SignalR infrastructure
- Optimistic UI updates for better user experience

## Security

- Uses JWT token authentication
- Only authenticated users can connect
- Server validates user permissions for all operations
- All notification operations require valid user context 