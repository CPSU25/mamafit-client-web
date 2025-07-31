import { PresetType } from './designer.types'
import { DesignRequestType } from './manage-order.types'

export interface OrderTask {
  id: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  maternityDressDetail?: unknown
  preset?: PresetType
  designRequest?: DesignRequestType
  milestones: MilestoneOfTask // Đổi tên từ milestone thành milestones
  orderId?: string
  maternityDressDetailId?: string
  presetId?: string
  itemType?: string
  price: number
  quantity: number
  warrantyDate?: string
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
  maternityDressTasks: MaternityDressTask[] // Đây phải là array
}
