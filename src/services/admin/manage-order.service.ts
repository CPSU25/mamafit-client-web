import { AssignCharge, AssignTask } from '@/@types/manage-order.types'
import ManageOrderAPI, { OrderQueryParams, OrderStatusUpdate } from '@/apis/manage-order.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), 'list', params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  designGroup: (designRequestId: string) => [...orderKeys.all, 'design-group', designRequestId] as const
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

// Get all orders created from a given designRequestId
export const useOrdersByDesignRequest = (designRequestId?: string) => {
  return useQuery({
    enabled: Boolean(designRequestId),
    queryKey: orderKeys.designGroup(designRequestId || 'unknown'),
    queryFn: async () => {
      if (!designRequestId) return { data: [] as unknown as never } as never
      const response = await ManageOrderAPI.getOrdersByDesignRequest(designRequestId)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch orders by design request')
    }
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { id: string; body: OrderStatusUpdate }) => {
      const response = await ManageOrderAPI.updateOrderStatus(params.id, params.body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update order status')
    },
    onSuccess: (_, variables) => {
      // Invalidate và refetch orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })

      toast.success('Cập nhật trạng thái đơn hàng thành công!')
    },
    onError: () => {
      toast.error('Cập nhật trạng thái đơn hàng thất bại!')
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { orderItemId: string; body: AssignTask }) => {
      const response = await ManageOrderAPI.assignTask(params.orderItemId, params.body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign task')
    },
    onSuccess: () => {
      // Invalidate orders và related tasks
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] })

      toast.success('Giao nhiệm vụ thành công!')
    },
    onError: () => {
      toast.error('Giao nhiệm vụ thất bại!')
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: AssignCharge[]) => {
      const response = await ManageOrderAPI.assignCharge(body)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign charge')
    },
    onSuccess: () => {
      // Invalidate orders và related tasks
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['staff-tasks'] })
      queryClient.invalidateQueries({ queryKey: [orderKeys.details()] })
      toast.success('Phân công nhiệm vụ thành công!')
    },
    onError: () => {
      toast.error('Phân công nhiệm vụ thất bại!')
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
