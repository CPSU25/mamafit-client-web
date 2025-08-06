// =====================================================================
// File: src/pages/staff/tasks/types.ts
// Mô tả: Định nghĩa các kiểu dữ liệu đã được map, dành riêng cho UI.
// =====================================================================
import { PresetType } from '@/@types/designer.types' // Đảm bảo import đúng đường dẫn

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

// Interface để biểu diễn một order item với các milestone và task được giao cho nhân viên
export interface ProductTaskGroup {
  measurement: MeasurementType 
  orderCode: string 
  preset: PresetType
  milestones: MilestoneUI[]
  orderItemId: string // ID của order item để update task status
  orderId: string // ID của order để tạo shipping
  addressId?: string
}

export interface MeasurementType{
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