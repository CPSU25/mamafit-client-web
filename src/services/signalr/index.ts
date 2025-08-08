export { unifiedHubService } from './unified-hub.service'
export { 
  useUnifiedHubConnection,
  useUnifiedHubEvent,
  useOrderUpdates,
  useTaskUpdates,
  useNotificationUpdates,
  useChatUpdates,
  useUserStatus,
  useSystemUpdates,
  useUnifiedHubAutoConnect,
  useRealtimeSync,
  useGroupManagement
} from './unified-hub.hooks'

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
} from './unified-hub.service'
