import { MessageType } from '@/@types/chat.types'

export interface ChatUser {
  id: string
  username: string
  fullName: string
  profile: string
  title: string
  messages: Convo[]
}

export interface Convo {
  message: string
  timestamp: Date
  sender: string
  type?: MessageType | number
}
