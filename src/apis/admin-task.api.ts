// =====================================================================
// File: src/apis/admin-task.api.ts
// Mô tả: API riêng cho Admin Task Management
// Endpoint: /order-items/:id
// =====================================================================

import { api } from '@/lib/axios/axios'
import {
  AdminOrderItemWithTasks,
  AdminAssignChargeRequest,
  AdminUpdateTaskStatusRequest,
  AdminTaskResponse
} from '@/@types/admin-task.types'

/**
 * Admin Task API - Chỉ dành cho admin
 * Sử dụng endpoint /order-items/:id khác với staff
 */
const adminTaskAPI = {
  /**
   * Lấy chi tiết order item với milestones và tasks (cho admin)
   * @param orderItemId ID của order item
   */
  getOrderItemWithTasks: (orderItemId: string) =>
    api.get<AdminTaskResponse<AdminOrderItemWithTasks>>(`/order-items/${orderItemId}`),

  /**
   * Giao việc milestone cho user (admin assign charge)
   * @param assignments Array assignments cho milestones
   */
  assignCharge: (assignments: AdminAssignChargeRequest[]) =>
    api.post<AdminTaskResponse<[]>>('/order-items/assign-charge', assignments),

  /**
   * Cập nhật status của checklist (admin check list status)
   * @param body Request body với orderItemId và task IDs
   */
  updateCheckListStatus: (body: { maternityDressTaskIds: string[]; orderItemId: string; status: string }) =>
    api.put<AdminTaskResponse<[]>>('/order-items/check-list-status', body),

  /**
   * Cập nhật task status (nếu admin cần update trực tiếp)
   * @param taskId ID của task
   * @param orderItemId ID của order item
   * @param body Request body
   */
  updateTaskStatus: (taskId: string, orderItemId: string, body: AdminUpdateTaskStatusRequest) =>
    api.put<AdminTaskResponse<{ message: string }>>(`/admin-tasks/${taskId}/${orderItemId}`, body)
}

export default adminTaskAPI
