import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderTaskAPI from '@/apis/order-task.api'
import { OrderTaskItem } from '@/@types/order-task.types'
import { ProductTaskGroup, MilestoneUI, TaskStatus } from '@/pages/staff/manage-task/tasks/types'
import { toast } from 'sonner'

const orderTasksQueryKeys = {
  all: ['orderTasks'] as const,
  byOrderItem: (orderItemId: string) => [...orderTasksQueryKeys.all, 'orderItem', orderItemId] as const
}

/**
 * Hàm chuyển đổi dữ liệu từ API response (OrderTaskItem[]) sang định dạng UI cần (ProductTaskGroup[]).
 * Mỗi OrderTaskItem sẽ tạo ra một ProductTaskGroup riêng biệt.
 */
const transformDataForUI = (data: OrderTaskItem[]): ProductTaskGroup[] => {
  if (!data || !Array.isArray(data)) {
    console.warn('transformDataForUI: Invalid data received:', data)
    return []
  }

  // Chuyển đổi mỗi OrderTaskItem thành một ProductTaskGroup
  return data
    .map((orderTaskItem) => {
      if (!orderTaskItem.orderItem?.preset) {
        console.warn('OrderTaskItem missing preset:', orderTaskItem)
        return null
      }

      // Transform milestones data
      const milestonesUI: MilestoneUI[] = orderTaskItem.milestones.map((milestone) => ({
        name: milestone.name,
        description: milestone.description,
        sequenceOrder: milestone.sequenceOrder,
        maternityDressTasks: Array.isArray(milestone.maternityDressTasks)
          ? milestone.maternityDressTasks.map((task) => ({
              id: task.id,
              name: task.name,
              description: task.description,
              status: task.status as TaskStatus,
              sequenceOrder: task.sequenceOrder,
              image: task.image,
              note: task.note
            }))
          : []
      }))

      return {
        preset: orderTaskItem.orderItem.preset,
        milestones: milestonesUI.sort((a, b) => a.sequenceOrder - b.sequenceOrder),
        orderItemId: orderTaskItem.orderItem.id
      }
    })
    .filter(Boolean) as ProductTaskGroup[]
}
/**
 * Custom hook để lấy danh sách các order item mà nhân viên được giao task.
 * Mỗi order item sẽ được hiển thị riêng biệt với các milestone và task tương ứng.
 */
export const useGetOrderTasks = () => {
  return useQuery<OrderTaskItem[], unknown, ProductTaskGroup[]>({
    queryKey: orderTasksQueryKeys.all,
    queryFn: async () => {
      const response = await orderTaskAPI.getOrderTask()
      console.log('API Response:', response.data) // Debug log
      // The API returns { data: [], statusCode, message, code } structure
      if (response.data.statusCode === 200) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch order tasks')
    },
    // Sử dụng `select` để transform dữ liệu, component sẽ nhận được dữ liệu đã được group theo preset.
    select: (data: OrderTaskItem[]): ProductTaskGroup[] => {
      console.log('Raw data before transform:', data) // Debug log
      const transformed = transformDataForUI(data)
      console.log('Transformed data:', transformed) // Debug log
      return transformed
    },
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

/**
 * Hook để lấy thông tin chi tiết task của một orderItem cụ thể
 */
export const useGetOrderTaskByOrderItemId = (orderItemId: string) => {
  return useQuery<OrderTaskItem[], unknown, ProductTaskGroup | null>({
    queryKey: orderTasksQueryKeys.byOrderItem(orderItemId),
    queryFn: async () => {
      const response = await orderTaskAPI.getOrderTaskByOrderItemId(orderItemId)
      console.log('API Response for orderItem:', response.data)
      if (response.data.statusCode === 200) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch order task details')
    },
    select: (data: OrderTaskItem[]): ProductTaskGroup | null => {
      if (!data || data.length === 0) return null
      const transformed = transformDataForUI(data)
      return transformed[0] || null // Chỉ trả về item đầu tiên vì chỉ có 1 orderItem
    },
    enabled: !!orderItemId,
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

/**
 * Hook để cập nhật trạng thái của một task cụ thể - hỗ trợ image và note khi hoàn thành
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dressTaskId,
      orderItemId,
      status,
      image,
      note
    }: {
      dressTaskId: string
      orderItemId: string
      status: TaskStatus
      image?: string
      note?: string
    }) => {
      console.log('Updating task status:', { dressTaskId, orderItemId, status, image, note })

      const body: { status: TaskStatus; image?: string; note?: string } = { status }

      // Chỉ thêm image và note khi hoàn thành task
      if (status === 'DONE') {
        if (image) body.image = image
        if (note) body.note = note
      }

      const response = await orderTaskAPI.updateTaskStatus(dressTaskId, orderItemId, body)

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái task')
    },
    onSuccess: (_, variables) => {
      // Invalidate và refetch lại danh sách tasks
      queryClient.invalidateQueries({ queryKey: orderTasksQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: orderTasksQueryKeys.byOrderItem(variables.orderItemId) })

      // Hiển thị thông báo thành công
      const statusText =
        variables.status === 'IN_PROGRESS'
          ? 'bắt đầu'
          : variables.status === 'DONE'
            ? 'hoàn thành'
            : variables.status === 'PENDING'
              ? 'chuyển về chờ'
              : 'cập nhật'

      toast.success(`Đã ${statusText} nhiệm vụ thành công!`)
    },
    onError: (error: unknown) => {
      console.error('Lỗi khi cập nhật trạng thái task:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái task'
      toast.error(`Lỗi: ${errorMessage}`)
    },
    retry: (failureCount, error: unknown) => {
      // Không retry cho lỗi 4xx
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}
