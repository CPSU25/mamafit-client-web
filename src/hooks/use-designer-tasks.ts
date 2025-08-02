import { useQuery } from '@tanstack/react-query'
import orderTaskAPI from '@/apis/order-task.api'

export function useDesignerTasks() {
  return useQuery({
    queryKey: ['designer-tasks'],
    queryFn: () => orderTaskAPI.getOrderTask(),
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}
