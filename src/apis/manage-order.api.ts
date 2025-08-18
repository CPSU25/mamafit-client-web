import {
  AssignCharge,
  AssignTask,
  checkListStatus,
  FindOrderBySKUAndCodeResponse,
  OrderById,
  OrderItemById,
  OrderStatus,
  OrderType,
  PaymentStatus
} from '@/@types/manage-order.types'
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
  getOrderById: (id: string) => api.get<ItemBaseResponse<OrderById>>(`/order/${id}`),
  getOrderDetailById: (id: string) => api.get<ItemBaseResponse<OrderItemById>>(`/order-items/${id}`),
  updateOrder: (id: string, body: OrderType) => api.put<ItemBaseResponse<OrderType>>(`/order/${id}`, body),
  updateOrderStatus: (id: string, params: OrderStatusUpdate) =>
    api.put<ItemBaseResponse<OrderType>>(`/order/${id}/status?${params}`),
  deleteOrder: (id: string) => api.delete<ItemBaseResponse<[]>>(`/order/${id}`),

  //update status and assign task, charge
  assignTask: (orderItemId: string, body: AssignTask) =>
    api.post<ItemBaseResponse<[]>>(`/order-item/assign-task/${orderItemId}`, body), //không sài
  assignCharge: (body: AssignCharge[]) => api.post<ItemBaseResponse<[]>>(`/order-items/assign-charge`, body),
  checkListStatus: (body: checkListStatus) => api.put<ItemBaseResponse<[]>>(`/order-items/check-list-status`, body),

  // Orders created from a Design Request (grouped by designRequestId)
  getOrdersByDesignRequest: (designRequestId: string) =>
    api.get<ItemBaseResponse<OrderType[]>>(`/order/order-group-designRequest/${designRequestId}`),

  //Find order by SKU and OrderCode
  findOrder: (sku: string, orderCode: string) =>
    api.get<ItemBaseResponse<FindOrderBySKUAndCodeResponse>>(`/order/by-sku-and-code?sku=${sku}&code=${orderCode}`)
}

export default ManageOrderAPI
