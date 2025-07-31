import { OrderTask } from '@/@types/order-task.types'
import { api } from '@/lib/axios/axios'

// Response type cho order-item-tasks API
interface OrderTaskResponse {
  data: OrderTask[]
  message: string
  statusCode: number
  code: string
}

// Request body cho update task status
interface UpdateTaskStatusRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

const orderTaskAPI = {
  getOrderTask: () => api.get<OrderTaskResponse>('/order-item-tasks'),

  updateTaskStatus: (dressTaskId: string, orderItemId: string, body: UpdateTaskStatusRequest) =>
    api.put<{ message: string; statusCode: number; code: string }>(
      `/order-item-tasks/${dressTaskId}/${orderItemId}`,
      body
    )
}

export default orderTaskAPI
