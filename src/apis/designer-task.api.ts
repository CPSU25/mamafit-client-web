import { DesignerOrderTaskItemList } from '@/@types/designer-task.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { UpdateTaskStatusRequest } from '@/@types/staff-task.types'
import { api } from '@/lib/axios/axios'

const designerTaskAPI = {
  getDesignRequestTask: () => api.get<ListBaseResponse<DesignerOrderTaskItemList[]>>('/order-item-tasks'),

  getDesignRequestTaskOrderItemId: (orderItemId: string) =>
    api.get<ItemBaseResponse<DesignerOrderTaskItemList[]>>(`/order-item-tasks/order-item/${orderItemId}`),

  updateTaskStatus: (dressTaskId: string, orderItemId: string, body: UpdateTaskStatusRequest) =>
    api.put<ItemBaseResponse<{ message: string }>>(`/order-item-tasks/${dressTaskId}/${orderItemId}`, body)
}

export default designerTaskAPI
