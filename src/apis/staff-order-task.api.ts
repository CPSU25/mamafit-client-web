// =====================================================================
// File: src/apis/staff-task.api.ts (renamed from order-task.api.ts)
// Mô tả: API riêng cho Staff Task Management
// Endpoint: /order-item-tasks
// =====================================================================

import { StaffOrderTaskItem, StaffUpdateTaskStatusRequest, StaffTaskResponse } from '@/@types/staff/staff-task.types'
import { api } from '@/lib/axios/axios'

/**
 * Staff Task API - Chỉ dành cho staff
 * Sử dụng endpoint /order-item-tasks khác với admin
 */
const staffTaskAPI = {
  /**
   * Lấy danh sách order items được giao cho staff
   */
  getOrderTasks: () => api.get<StaffTaskResponse<StaffOrderTaskItem[]>>('/order-item-tasks'),

  /**
   * Lấy thông tin chi tiết task theo orderItemId (cho staff)
   * @param orderItemId ID của order item
   */
  getOrderTaskByOrderItemId: (orderItemId: string) =>
    api.get<StaffTaskResponse<StaffOrderTaskItem[]>>(`/order-item-tasks/order-item/${orderItemId}`),

  /**
   * Cập nhật task status (cho staff)
   * @param dressTaskId ID của maternity dress task
   * @param orderItemId ID của order item
   * @param body Request body
   */
  updateTaskStatus: (dressTaskId: string, orderItemId: string, body: StaffUpdateTaskStatusRequest) =>
    api.put<StaffTaskResponse<{ message: string }>>(`/order-item-tasks/${dressTaskId}/${orderItemId}`, body)
}

export default staffTaskAPI
