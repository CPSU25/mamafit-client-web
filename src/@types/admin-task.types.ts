// =====================================================================
// File: src/@types/admin/admin-task.types.ts
// Mô tả: Định nghĩa types riêng cho Admin Task Management
// API: /order-items/:id - structure có tasks trong milestone, detail trong task
// =====================================================================

import { PresetType } from './designer.types'
import { MaternityDressDetailType } from './inventory.type'
import { DesignRequestType } from './manage-order.types'

/**
 * Admin Task Status - Admin có thể quản lý nhiều status hơn staff
 */
export type AdminTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PASS' | 'FAIL' | 'DONE'

/**
 * Admin Task Detail - Chứa thông tin chi tiết của task khi được thực hiện
 * Đây là structure đặc biệt của admin, khác với staff
 */
export interface AdminTaskDetail {
  image: string | null
  note: string | null
  chargeId: string | null // ID của người được giao việc
  chargeName: string | null // Tên người được giao việc
  status: AdminTaskStatus
  createdAt: string
  createdBy: string
  updatedBy: string
  updatedAt: string | null
}

/**
 * Admin Task - Task trong hệ thống admin có structure khác staff
 * Task này có detail object chứa status, note, image
 */
export interface AdminTask {
  id: string
  name: string
  description: string
  sequenceOrder: number
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string | null
  detail: AdminTaskDetail // Đây là điểm khác biệt chính với staff
}

/**
 * Admin Milestone - Chứa array tasks (khác với staff dùng maternityDressTasks)
 */
export interface AdminMilestone {
  id: string
  name: string
  description: string
  applyFor: string[]
  sequenceOrder: number
  createdAt: string
  updatedAt: string
  createdBy: string
  tasks: AdminTask[] // Array tasks - khác với staff
}

/**
 * Admin Order Item với Milestones - Response từ API /order-items/:id
 */
export interface AdminOrderItemWithTasks {
  id: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  maternityDressDetail?: MaternityDressDetailType
  preset?: PresetType
  designRequest?: DesignRequestType
  orderId: string
  maternityDressDetailId?: string
  presetId?: string
  itemType: 'PRESET' | 'READY_TO_BUY' | 'CUSTOM'
  price: number
  quantity: number
  warrantyDate?: string
  milestones: AdminMilestone[] // Array milestones với tasks
}

/**
 * Request để assign charge cho milestone
 */
export interface AdminAssignChargeRequest {
  chargeId: string
  orderItemIds: string[]
  milestoneId: string
}

/**
 * Request để update task status trong admin
 */
export interface AdminUpdateTaskStatusRequest {
  status: AdminTaskStatus
  image?: string
  note?: string
  chargeId?: string
}

/**
 * Response wrapper cho admin task operations
 */
export interface AdminTaskResponse<T> {
  data: T
  message: string
  statusCode: number
  code: string
}
