import { useMutation, useQueryClient } from '@tanstack/react-query'
import ghtkAPI from '@/apis/ghtk.api'
import { toast } from 'sonner'

// Query keys cho GHTK
export const ghtkKeys = {
  all: ['ghtk'] as const,
  orders: () => [...ghtkKeys.all, 'orders'] as const,
  order: (orderId: string) => [...ghtkKeys.orders(), orderId] as const
}

export const useCreateShipping = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ghtkAPI.createShipping,
    mutationKey: ['create-shipping'],
    onSuccess: (response, orderId) => {
      if (response.data.success) {
        // Invalidate các queries liên quan đến order
        queryClient.invalidateQueries({ queryKey: ['order', orderId] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        // Cache thông tin shipping order
        queryClient.setQueryData(ghtkKeys.order(orderId), response.data.order)
        toast.success('Tạo đơn giao hàng thành công!')
      } else {
        toast.error(response.data.message || 'Không thể tạo đơn giao hàng')
      }
    },
    onError: (error) => {
      console.error('Error creating shipping:', error)
      toast.error('Có lỗi xảy ra khi tạo đơn giao hàng')
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}
