import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderTaskAPI from '@/apis/staff-order-task.api'
import { toast } from 'sonner'

export function useDesignerTasks() {
  return useQuery({
    queryKey: ['designer-tasks'],
    queryFn: () => orderTaskAPI.getOrderTasks(),
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
    }) => orderTaskAPI.updateTaskStatus(taskId, orderItemId, body),
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
