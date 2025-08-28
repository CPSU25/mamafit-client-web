import { OrderItemType, OrderType } from './manage-order.types'

export enum TicketType {
  WARRANTY_SERVICE = 'WARRANTY_SERVICE',
  DELIVERY_SERVICE = 'DELIVERY_SERVICE',
  OTHER = 'OTHER'
}
export interface OrderOfTicket extends OrderType {
  items: OrderItemType[]
  address?: string
}
export interface TicketList {
  id: string
  title: string
  images: string[]
  videos: string[]
  type: TicketType
  description: string
  order: OrderOfTicket
  status?: string | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string | null
}
