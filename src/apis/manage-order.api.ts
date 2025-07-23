import { AssignTask, OrderStatus, OrderType, PaymentStatus } from '@/@types/admin.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

export interface OrderQueryParams {
  index?: number
  pageSize?: number
  startDate?: Date
  endDate?: Date
}

export interface OrderStatusUpdate {
  status: OrderStatus
  paymentStatus: PaymentStatus
}
const ManageOrderAPI = {
  getOrders: (params: OrderQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params.index) queryParams.append('index', params.index.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.startDate) queryParams.append('startDate', params.startDate.toDateString())
    if (params.endDate) queryParams.append('endDate', params.endDate.toDateString())
    const queryString = queryParams.toString()
    const url = queryString ? `/order?${queryString}` : '/order'
    return api.get<ListBaseResponse<OrderType>>(url)
  },
  getOrderById: (id: string) => api.get<ItemBaseResponse<OrderType>>(`/order/${id}`),
  updateOrderStatus: (id: string, params: OrderStatusUpdate) =>
    api.put<ItemBaseResponse<OrderType>>(`/order/${id}/status?${params}`),
  assignTask: (orderItemId: string, body: AssignTask) =>
    api.post<ItemBaseResponse<[]>>(`/order-item/assign-task/${orderItemId}`, body)
}

export default ManageOrderAPI
