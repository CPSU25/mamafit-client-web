import { PresetType } from './designer.types'
import { DesignRequestType } from './manage-order.types'

// Cấu trúc chính cho một order task item
export interface OrderTaskItem {
  orderItem: OrderItem
  milestones: MilestoneOfTask[]
}

// Thông tin chi tiết của order item
export interface OrderItem {
  id: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  maternityDressDetail?: unknown
  preset?: PresetType
  designRequest?: DesignRequestType
  orderId: string
  maternityDressDetailId?: string
  presetId?: string
  itemType: 'PRESET' | 'READY_TO_BUY' | 'CUSTOM'
  price: number
  quantity: number
  warrantyDate?: string
}

// Backward compatibility - deprecated, sử dụng OrderTaskItem thay thế
export interface OrderTask extends OrderItem {
  milestones: MilestoneOfTask[]
}

export type StatusTask = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MaternityDressTask {
  id: string
  name: string
  description: string
  sequenceOrder: number
  note: string | null
  image: string | null
  status: StatusTask
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface MilestoneOfTask {
  name: string
  description: string
  applyFor: string[]
  sequenceOrder: number
  maternityDressTasks: MaternityDressTask[]
}
