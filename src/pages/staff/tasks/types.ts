// =====================================================================
// File: src/pages/staff/tasks/types.ts
// Mô tả: Định nghĩa các kiểu dữ liệu đã được map, dành riêng cho UI.
// =====================================================================
import { PresetType } from '@/@types/designer.types' // Đảm bảo import đúng đường dẫn

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MaternityDressTaskUI {
  id: string
  name: string
  description: string
  status: TaskStatus
  sequenceOrder: number
  image: string | null
  note: string | null
}

export interface MilestoneUI {
  name: string
  description: string
  sequenceOrder: number
  maternityDressTasks: MaternityDressTaskUI[]
}

export interface StaffTaskUI {
  id: string
  milestones: MilestoneUI
  preset: PresetType
}

// Interface mới để group các OrderTask theo preset.id
export interface ProductTaskGroup {
  preset: PresetType
  milestones: MilestoneUI[]
  orderItemId: string // ID của order item để update task status
}
