import { MilestoneByIdType, MilestoneFormData, MilestoneType, TaskFormData, TaskType } from '@/@types/admin.types'
import { StatusOrderItemResponse, StatusOrderItemTimeline } from '@/@types/manage-order.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

export interface MilestoneQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}
const ManageMilestoneAPI = {
  getMilestones: (params?: MilestoneQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    const queryString = queryParams.toString()
    const url = queryString ? `/milestone?${queryString}` : '/milestone'
    return api.get<ListBaseResponse<MilestoneType>>(url)
  },
  getMilestoneById: (id: string) => api.get<ItemBaseResponse<MilestoneByIdType>>(`/milestone/${id}`),
  createMilestone: (body: MilestoneFormData) => api.post<ItemBaseResponse<[]>>('/milestone', body),
  updateMilestone: (id: string, body: MilestoneFormData) => api.put<ItemBaseResponse<[]>>(`/milestone/${id}`, body),
  deleteMilestone: (id: string) => api.delete<ItemBaseResponse<[]>>(`/milestone/${id}`),

  getTasks: (params?: MilestoneQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    const queryString = queryParams.toString()
    const url = queryString ? `/task?${queryString}` : `/task`
    return api.get<ListBaseResponse<TaskType>>(url)
  },
  getTaskById: (id: string) => api.get<ItemBaseResponse<TaskType>>(`/task/${id}`),
  createTask: (body: TaskFormData) => api.post<ItemBaseResponse<[]>>(`/task`, body),
  updateTask: (id: string, body: TaskFormData) => api.put<ItemBaseResponse<[]>>(`/task/${id}`, body),
  deleteTask: (id: string) => api.delete<ItemBaseResponse<[]>>(`/task/${id}`),

  //get status timeline of order item
  getStatusTimelineOfOrderItem: (orderItemId: string) =>
    api.get<StatusOrderItemResponse<StatusOrderItemTimeline>>(`/milestone/order-item/${orderItemId}`)
}

export default ManageMilestoneAPI
