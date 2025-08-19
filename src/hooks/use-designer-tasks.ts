import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import designerTaskAPI from '@/apis/designer-task.api'
import { presetApi } from '@/apis/manage-template.api'

export function useDesignerTasks() {
  return useQuery({
    queryKey: ['designer-tasks'],
    queryFn: () => designerTaskAPI.getDesignRequestTask(),
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      orderItemId,
      body
    }: {
      taskId: string
      orderItemId: string
      body: { status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'; note?: string; image?: string }
    }) => designerTaskAPI.updateTaskStatus(taskId, orderItemId, body),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái task thành công!')
      // Invalidate và refetch designer tasks
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
    },
    onError: (error: Error) => {
      toast.error(`Lỗi cập nhật task: ${error.message}`)
    }
  })
}

export function useSendPresetToCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      images: string[]
      type: 'USER'
      isDefault: boolean
      price: number
      designRequestId: string
      orderId: string
    }) => presetApi.sendPresetToDesignRequest(data),
    onSuccess: () => {
      toast.success('Đã gửi preset cho khách hàng thành công!')
      // Invalidate và refetch designer tasks để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
    },
    onError: (error: Error) => {
      toast.error(`Lỗi gửi preset: ${error.message}`)
    }
  })
}
