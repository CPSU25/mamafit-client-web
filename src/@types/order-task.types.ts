import { PresetType } from './designer.types'
import { DesignRequestType } from './manage-order.types'
export interface OrderTaskItem {
  orderItem: OrderItem
  milestones: MilestoneOfTask[]
}

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
