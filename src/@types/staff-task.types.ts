// =====================================================================
// File: src/@types/staff/staff-task.types.ts
// Mô tả: Định nghĩa types riêng cho Staff Task Management
// API: /order-item-tasks - structure có maternityDressTasks, status/note/image nằm ngoài
// =====================================================================

import { MeasurementType } from '@/pages/staff/manage-task/tasks/types'
import { PresetType } from './designer.types'
import { OrderStatus } from './manage-order.types'

/**
 * Staff Task Status - Staff chỉ quản lý các status cơ bản
 */
export type StaffTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'PASS' | 'FAIL' | 'LOCKED'

/**
 * Staff MaternityDress Task - Task structure cho staff
 * Khác với admin: status, note, image nằm trực tiếp trong task (không có detail object)
 */
export interface StaffMaternityDressTask {
  id: string
  name: string
  description: string
  sequenceOrder: number
  estimateTimeSpan?: number
  deadline?: string
  note: string | null
  image: string | null
  status: StaffTaskStatus // Trực tiếp trong task, không có detail object
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

/**
 * Staff Milestone - Chứa maternityDressTasks (khác với admin dùng tasks)
 */
export interface StaffMilestone {
  name: string
  description: string
  applyFor: string[]
  sequenceOrder: number
  maternityDressTasks: StaffMaternityDressTask[] // Array maternityDressTasks - khác với admin
}

/**
 * Staff Order Item - Base order item info
 */
export interface StaffOrderItem {
  id: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  maternityDressDetail?: unknown
  orderId: string
  addOnOptions?: string[]
  preset?: PresetType
  maternityDressDetailId?: string
  presetId?: string
  itemType: 'PRESET' | 'READY_TO_BUY' | 'CUSTOM'
  price: number
  quantity: number
  warrantyDate?: string
}

/**
 * Staff Order Task Item - Response từ API /order-item-tasks
 */
export interface StaffOrderTaskItem {
  orderCode: string
  orderStatus: OrderStatus
  measurement: MeasurementType
  orderItem: StaffOrderItem
  milestones: StaffMilestone[]
  addressId?: string // Thêm addressId vào response type
}

/**
 * Request để update task status trong staff
 */
export interface UpdateTaskStatusRequest {
  status: StaffTaskStatus
  image?: string // Chỉ cần khi hoàn thành task
  note?: string // Chỉ cần khi hoàn thành task
}

/**
 * Response wrapper cho staff task operations
 */
export interface TaskResponse<T> {
  data: T
  message: string
  statusCode: number
  code: string
}
