import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderTaskAPI from '@/apis/order-task.api'
import { OrderTask } from '@/@types/order-task.types'
import { ProductTaskGroup, MilestoneUI, TaskStatus } from '@/pages/staff/tasks/types'
import { toast } from 'sonner'

const orderTasksQueryKeys = {
  all: ['orderTasks'] as const
}

/**
 * Hàm chuyển đổi dữ liệu từ API response (OrderTask[]) sang định dạng UI cần (ProductTaskGroup[]).
 * Group các OrderTask theo preset.id để loại bỏ việc trùng lặp dữ liệu.
 */
const transformDataForUI = (data: OrderTask[]): ProductTaskGroup[] => {
  if (!data || !Array.isArray(data)) {
    console.warn('transformDataForUI: Invalid data received:', data)
    return []
  }

  // Group OrderTasks by preset.id
  const groupedByPreset = data.reduce(
    (acc, orderTask) => {
      if (!orderTask.preset?.id) {
        console.warn('OrderTask missing preset:', orderTask)
        return acc
      }

      const presetId = orderTask.preset.id

      if (!acc[presetId]) {
        acc[presetId] = {
          preset: orderTask.preset,
          milestones: [],
          orderItemId: orderTask.id // Sử dụng id của OrderTask làm orderItemId
        }
      }

      // Transform milestone data - sử dụng 'milestones' thay vì 'milestone'
      const milestoneUI: MilestoneUI = {
        name: orderTask.milestones.name,
        description: orderTask.milestones.description,
        sequenceOrder: orderTask.milestones.sequenceOrder,
        maternityDressTasks: Array.isArray(orderTask.milestones.maternityDressTasks)
          ? orderTask.milestones.maternityDressTasks.map((task) => ({
              id: task.id,
              name: task.name,
              description: task.description,
              status: task.status as TaskStatus,
              sequenceOrder: task.sequenceOrder,
              image: task.image,
              note: task.note
            }))
          : []
      }

      // Check if this milestone already exists for this preset
      const existingMilestone = acc[presetId].milestones.find(
        (m) => m.sequenceOrder === milestoneUI.sequenceOrder && m.name === milestoneUI.name
      )

      if (!existingMilestone) {
        acc[presetId].milestones.push(milestoneUI)
      }

      return acc
    },
    {} as Record<string, ProductTaskGroup>
  )

  // Convert to array and sort milestones by sequenceOrder
  return Object.values(groupedByPreset).map((group) => ({
    ...group,
    milestones: group.milestones.sort((a, b) => a.sequenceOrder - b.sequenceOrder)
  }))
}
/**
 * Custom hook để lấy danh sách công việc của nhân viên được group theo preset.
 */
export const useGetOrderTasks = () => {
  return useQuery<OrderTask[], unknown, ProductTaskGroup[]>({
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
    select: (data: OrderTask[]): ProductTaskGroup[] => {
      console.log('Raw data before transform:', data) // Debug log
      const transformed = transformDataForUI(data)
      console.log('Transformed data:', transformed) // Debug log
      return transformed
    },
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

/**
 * Hook để cập nhật trạng thái của một task cụ thể
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dressTaskId,
      orderItemId,
      status
    }: {
      dressTaskId: string
      orderItemId: string
      status: TaskStatus
    }) => {
      console.log('Updating task status:', { dressTaskId, orderItemId, status })
      const response = await orderTaskAPI.updateTaskStatus(dressTaskId, orderItemId, { status })

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái task')
    },
    onSuccess: (_, variables) => {
      // Invalidate và refetch lại danh sách tasks
      queryClient.invalidateQueries({ queryKey: orderTasksQueryKeys.all })

      // Hiển thị thông báo thành công
      const statusText =
        variables.status === 'IN_PROGRESS'
          ? 'bắt đầu'
          : variables.status === 'COMPLETED'
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
