import { TaskResponse } from './../@types/staff-task.types'

import { StaffOrderTaskItem, UpdateTaskStatusRequest } from '@/@types/staff-task.types'
import { api } from '@/lib/axios/axios'

const staffTaskAPI = {
  getOrderTask: () => api.get<TaskResponse<StaffOrderTaskItem[]>>('/order-item-tasks'),

  getOrderTaskByOrderItemId: (orderItemId: string) =>
    api.get<TaskResponse<StaffOrderTaskItem[]>>(`/order-item-tasks/order-item/${orderItemId}`),

  updateTaskStatus: (dressTaskId: string, orderItemId: string, body: UpdateTaskStatusRequest) =>
    api.put<TaskResponse<{ message: string }>>(`/order-item-tasks/${dressTaskId}/${orderItemId}`, body)
}

export default staffTaskAPI
