// Chat Room Types
export interface ChatRoom {
  id: string
  name?: string
  memberCount?: number
  lastMessage?: string // Direct string from API, not ChatMessage object
  lastMessageType?: MessageType | number // Type của tin nhắn cuối cùng
  description?: string
  lastTimestamp?: string // ISO string from API, not Date object
  lastUserId?: string
  lastUserName?: string
  createdAt?: Date | string
  members?: Member[]
}

export interface Member {
  memberId: string
  memberName: string
  avatar?: string
  title?: string
  userName?: string
}

// Message Types
export interface ChatMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  chatRoomId: string
  senderAvatar?: string
  type: MessageType
  messageTimestamp: Date
  isRead?: boolean
}

export enum MessageType {
  Text = 0,
  Image = 1,
  File = 2,
  Design_Request = 3,
  Preset = 4
}

// Helper function để convert MessageType thành display text và icon
export function getMessageTypeDisplay(type: MessageType | number) {
  const messageType = typeof type === 'number' ? type : Number(type)

  switch (messageType) {
    case MessageType.Text:
      return { label: 'Tin nhắn văn bản', icon: '💬', isSpecial: false }
    case MessageType.Image:
      return { label: 'Hình ảnh', icon: '🖼️', isSpecial: false }
    case MessageType.File:
      return { label: 'Tệp đính kèm', icon: '📎', isSpecial: false }
    case MessageType.Design_Request:
      return { label: 'Yêu cầu thiết kế', icon: '🎨', isSpecial: true }
    case MessageType.Preset:
      return { label: 'Preset thiết kế', icon: '✨', isSpecial: true }
    default:
      return { label: 'Tin nhắn', icon: '💬', isSpecial: false }
  }
}

// API Request/Response Types
export interface CreateRoomRequest {
  userId1: string
  userId2: string
}

export interface SendMessageRequest {
  Message: string
  SenderId: string
  ChatRoomId: string
  Type: MessageType
}

export interface GetMessagesRequest {
  roomId: string
  index?: number
  pageSize?: number
}

// API Response Types for Messages
export interface ApiChatMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  senderAvatar?: string | null
  messageTimestamp: string // ISO string from API
  chatRoomId: string
  type: string
}

// SignalR Event Types
export interface SignalRMessage {
  id: string
  message: string
  senderId: string
  senderName: string
  chatRoomId: string
  type: MessageType
  timestamp: Date
}

export interface TypingIndicator {
  userId: string
  userName: string
  chatRoomId: string
  isTyping: boolean
}

export interface UserStatus {
  userId: string
  isOnline: boolean
  lastSeen?: Date
}

// Store Types for Component State
export interface ChatState {
  rooms: ChatRoom[]
  messages: Record<string, ChatMessage[]>
  activeRoom: ChatRoom | null
  onlineUsers: Set<string>
  typingUsers: Record<string, string[]> // roomId -> array of typing userIds
  isConnected: boolean
  isLoading: boolean
  connectionError: string | null
  isRetrying: boolean
}
