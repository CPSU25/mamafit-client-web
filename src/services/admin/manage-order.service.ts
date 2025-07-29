import { AssignCharge, AssignTask } from '@/@types/manage-order.types'
import ManageOrderAPI, { OrderQueryParams, OrderStatusUpdate } from '@/apis/manage-order.api'
import { useMutation, useQuery } from '@tanstack/react-query'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), 'list', params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const
}

export const useOrders = (params: OrderQueryParams) => {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: async () => {
      const response = await ManageOrderAPI.getOrders(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch orders')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await ManageOrderAPI.getOrderById(id)
      if (response.data.statusCode === 200) {
        console.log(response.data)
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch order')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async (params: { id: string; body: OrderStatusUpdate }) => {
      const response = await ManageOrderAPI.updateOrderStatus(params.id, params.body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update order status')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}
export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await ManageOrderAPI.getOrderDetailById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch order detail')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useAssignTask = () => {
  return useMutation({
    mutationFn: async (params: { orderItemId: string; body: AssignTask }) => {
      const response = await ManageOrderAPI.assignTask(params.orderItemId, params.body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign task')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useAssignCharge = () => {
  return useMutation({
    mutationFn: async (body: AssignCharge) => {
      const response = await ManageOrderAPI.assignCharge(body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign charge')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}
