// =====================================================================
// File: src/pages/staff/tasks/types.ts
// Mô tả: Định nghĩa các kiểu dữ liệu đã được map, dành riêng cho UI.
// =====================================================================
import { PresetType } from '@/@types/designer.types' // Đảm bảo import đúng đường dẫn
import { MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { StaffOrderItem } from '@/@types/staff-task.types'

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'PASS' | 'FAIL' | 'LOCKED'
export type QualityCheckStatus = 'PASS' | 'FAIL'

export interface MaternityDressTaskUI {
  id: string
  name: string
  description: string
  status: TaskStatus
  sequenceOrder: number
  image: string | null
  note: string | null
  deadline?: string
  estimateTimeSpan?: number
  // Optional fields để debug
  uniqueKey?: string
  orderItemId?: string
  severity?: boolean // Thêm trường severity để đánh dấu lỗi nghiêm trọng
}

export interface MilestoneUI {
  name: string
  description: string
  sequenceOrder: number
  maternityDressTasks: MaternityDressTaskUI[]
  // Kiểm tra xem milestone này có phải là QualityCheck không
  isQualityCheck?: boolean
}

export interface StaffTaskUI {
  id: string
  milestones: MilestoneUI
  preset: PresetType
}

// Interface cho AddOnOption
export enum ItemServiceType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  PATTERN = 'PATTERN'
}
export interface AddOnOption {
  id: string
  addOnId: string
  value?: string
  name: string
  description: string
  price: number
  itemServiceType: ItemServiceType
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  position: {
    id: string
    name: string
    image: string | null
  }
  size: {
    id: string
    name: string
  }
}

// Interface cho OrderItem - cập nhật để phù hợp với API response
export interface OrderItemTask {
  id: string
  parentOrderItemId: string | null
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  warrantyRound: number
  maternityDressDetail: unknown | null
  preset: PresetType // Thêm preset object
  presetId: string
  itemType: string
  price: number
  quantity: number
  warrantyDate: string | null
  addOnOptions?: AddOnOption[] // AddOnOptions nằm trong orderItem
}

// Interface để biểu diễn một order item với các milestone và task được giao cho nhân viên
export interface ProductTaskGroup {
  measurement: MeasurementType
  orderCode: string
  orderStatus: OrderStatus
  preset: PresetType | null // Có thể null cho READY_TO_BUY items
  milestones: MilestoneUI[]
  maternityDressDetail: MaternityDressDetailType | null // Có thể null cho PRESET items
  orderItemId: string // ID của order item để update task status
  orderId: string // ID của order để tạo shipping
  addressId?: string
  orderItem: StaffOrderItem // Sử dụng StaffOrderItem thay vì OrderItemTask để phù hợp với API
}

export interface MeasurementType {
  bust: number
  waist: number
  hip: number
  chestAround: number
  coat: number
  shoulder: number
  legLength: number
  neck: number
  dressLength: number
  isLocked: boolean
  createdAt: string
  updatedAt: string
  id: string
  orderItemId: string
  pantsWaist: number
  shoulderWidth: number
  sleeveLength: number
  stomach: number
  thigh: number
  weekOfPregnancy: number
  weight: number
}
