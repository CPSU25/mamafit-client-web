// Chat Room Types
export interface ChatRoom {
  id: string
  name?: string
  memberCount?: number
  lastMessage?: ChatMessage
  description?: string
  lastTimestamp?: Date
  lastUserId?: string
  lastUserName?: string
  createdAt?: Date
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
  Text = 'Text',
  Image = 'Image',
  File = 'File'
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
