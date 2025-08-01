import { OrderTaskItem } from '@/@types/order-task.types'
import { api } from '@/lib/axios/axios'

// Response type cho order-item-tasks API - cập nhật theo cấu trúc mới
interface OrderTaskResponse {
  data: OrderTaskItem[]
  message: string
  statusCode: number
  code: string
}

// Request body cho update task status - cập nhật theo yêu cầu mới
interface UpdateTaskStatusRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  image?: string // Chỉ cần khi hoàn thành task
  note?: string // Chỉ cần khi hoàn thành task
}

const orderTaskAPI = {
  getOrderTask: () => api.get<OrderTaskResponse>('/order-item-tasks'),

  // API mới để lấy thông tin chi tiết theo orderItemId
  getOrderTaskByOrderItemId: (orderItemId: string) =>
    api.get<OrderTaskResponse>(`/order-item-tasks/order-item/${orderItemId}`),

  updateTaskStatus: (dressTaskId: string, orderItemId: string, body: UpdateTaskStatusRequest) =>
    api.put<{ message: string; statusCode: number; code: string }>(
      `/order-item-tasks/${dressTaskId}/${orderItemId}`,
      body
    )
}

export default orderTaskAPI
