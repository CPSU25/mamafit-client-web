import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { ChatRoom, ChatMessage, CreateRoomRequest, SendMessageRequest, GetMessagesRequest } from '@/@types/chat.types'
import { api } from '@/lib/axios/axios'

const chatAPI = {
  // Room Management
  createRoom: (body: CreateRoomRequest) => api.post<ItemBaseResponse<ChatRoom>>('/Chat/rooms', body),

  getMyRooms: () => api.get<ItemBaseResponse<ChatRoom[]>>('/Chat/my-rooms'),

  getUserRooms: (userId: string) => api.get<ItemBaseResponse<ChatRoom[]>>(`/Chat/users/${userId}/rooms`),

  getRoomById: (roomId: string) => api.get<ItemBaseResponse<ChatRoom>>(`/Chat/rooms/${roomId}`),

  // Message Management
  getRoomMessages: (params: GetMessagesRequest) => {
    const { roomId, index = 1, pageSize = 20 } = params
    return api.get<ListBaseResponse<ChatMessage>>(`/Chat/rooms/${roomId}/messages`, { params: { index, pageSize } })
  },

  sendMessage: (body: SendMessageRequest) => api.post<ItemBaseResponse<ChatMessage>>('/Chat/messages', body)
}

export default chatAPI
