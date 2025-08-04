// =====================================================================
// File: src/pages/staff/tasks/types.ts
// Mô tả: Định nghĩa các kiểu dữ liệu đã được map, dành riêng cho UI.
// =====================================================================
import { PresetType } from '@/@types/designer.types' // Đảm bảo import đúng đường dẫn

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'PASS' | 'FAIL'
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
  preset: PresetType
  milestones: MilestoneUI[]
  orderItemId: string // ID của order item để update task status
}
