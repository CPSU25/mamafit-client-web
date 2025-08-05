import { MilestoneOfTask } from './order-task.types'

export interface DesignerOrderTaskItemList {
  orderItem: OrderItemOfDesigner[]
  orderCode: string
  milestones: MilestoneOfTask[]
}

export interface OrderItemOfDesigner {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  designRequest: DesignRequestOfDesigner
  preset?: PresetOfDesigner
  addOnOptions?: string[]
  orderId: string
  presetId?: string
  itemType: 'DESIGN_REQUEST'
  price: number
  quantity: number
  warrantyDate?: string
}

export interface PresetOfDesigner {
  id: string
  name?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  type: 'SYSTEM' | 'USER '
  price: number
}
export interface DesignRequestOfDesigner {
  id: string
  userId: string
  username?: string
  description?: string
  images?: string[]
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}
