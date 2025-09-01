// =====================================================================
// File: src/services/staff/staff-task.service.ts
// Mô tả: Service quản lý nhiệm vụ cho Staff
// =====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import staffTaskAPI from '@/apis/staff-order-task.api'
import globalAPI from '@/apis/global.api'
import { StaffOrderTaskItem, UpdateTaskStatusRequest, StaffTaskStatus } from '@/@types/staff-task.types'
import { ProductTaskGroup, MilestoneUI } from '@/pages/staff/manage-task/tasks/types'
import { toast } from 'sonner'

/**
 * Query keys cho staff tasks
 */
const staffTaskQueryKeys = {
  all: ['staffTasks'] as const,
  lists: () => [...staffTaskQueryKeys.all, 'list'] as const,
  byOrderItem: (orderItemId: string) => ['staff-order-task', orderItemId] as const
}

/**
 * Transform dữ liệu từ API response sang UI format
 */
const transformStaffDataForUI = (data: StaffOrderTaskItem[]): ProductTaskGroup[] => {
  if (!data || !Array.isArray(data)) {
    return []
  }

  return data
    .map((staffOrderTaskItem) => {
      // Kiểm tra cả preset và maternityDressDetail
      const hasPreset = staffOrderTaskItem.orderItem?.preset
      const hasMaternityDressDetail = staffOrderTaskItem.orderItem?.maternityDressDetail

      if (!hasPreset && !hasMaternityDressDetail) {
        console.warn('Order item has neither preset nor maternityDressDetail:', staffOrderTaskItem.orderItem?.id)
        return null
      }

      // Transform milestones
      const milestonesUI: MilestoneUI[] = staffOrderTaskItem.milestones.map((milestone) => {
        const isQualityCheck =
          milestone.name.toLowerCase().includes('quality') ||
          milestone.name.toLowerCase().includes('kiểm tra') ||
          milestone.name.toLowerCase().includes('quality check')

        // Transform tasks
        const maternityDressTasks = Array.isArray(milestone.maternityDressTasks)
          ? milestone.maternityDressTasks.map((task) => {
              const uniqueTaskKey = `${task.id}_${staffOrderTaskItem.orderItem.id}`

              return {
                id: task.id,
                uniqueKey: uniqueTaskKey,
                name: task.name,
                description: task.description,
                status: task.status,
                sequenceOrder: task.sequenceOrder,
                image: task.image,
                note: task.note,
                deadline: task.deadline,
                estimateTimeSpan: task.estimateTimeSpan,
                orderItemId: staffOrderTaskItem.orderItem.id
              }
            })
          : []

        return {
          name: milestone.name,
          description: milestone.description,
          sequenceOrder: milestone.sequenceOrder,
          isQualityCheck,
          maternityDressTasks
        }
      })

      const result = {
        preset: staffOrderTaskItem.orderItem.preset || null, // Có thể null cho READY_TO_BUY
        milestones: milestonesUI.sort((a, b) => a.sequenceOrder - b.sequenceOrder),
        orderItemId: staffOrderTaskItem.orderItem.id,
        orderId: staffOrderTaskItem.orderItem.orderId,
        orderStatus: staffOrderTaskItem.orderStatus,
        orderCode: staffOrderTaskItem.orderCode, // Thêm orderCode vào kết quả
        measurement: staffOrderTaskItem.measurement, // Thêm measurement
        addressId: staffOrderTaskItem.addressId, // Thêm addressId
        orderItem: staffOrderTaskItem.orderItem, // Thêm orderItem để component có thể truy cập addOnOptions
        maternityDressDetail: staffOrderTaskItem.orderItem.maternityDressDetail || null // Thêm maternityDressDetail
      }

      return result
    })
    .filter(Boolean) as ProductTaskGroup[]
}

/**
 * Hook lấy danh sách order items được giao cho staff
 */
export const useStaffGetOrderTasks = () => {
  return useQuery<StaffOrderTaskItem[], unknown, ProductTaskGroup[]>({
    queryKey: staffTaskQueryKeys.lists(),
    queryFn: async () => {
      const response = await staffTaskAPI.getOrderTask()

      if (response.data.statusCode === 200) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch staff order tasks')
    },
    // Transform dữ liệu cho staff
    select: (data: StaffOrderTaskItem[]): ProductTaskGroup[] => {
      return transformStaffDataForUI(data)
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })
}

/**
 * Hook lấy thông tin chi tiết task của một orderItem (staff)
 */
export const useStaffGetOrderTaskByOrderItemId = (orderItemId: string) => {
  return useQuery<StaffOrderTaskItem[], unknown, ProductTaskGroup | null>({
    queryKey: staffTaskQueryKeys.byOrderItem(orderItemId), // Sử dụng key thống nhất
    queryFn: async () => {
      const response = await staffTaskAPI.getOrderTaskByOrderItemId(orderItemId)
      if (response.data.statusCode === 200) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch staff order task details')
    },
    select: (data: StaffOrderTaskItem[]): ProductTaskGroup | null => {
      if (!data || data.length === 0) return null
      const transformed = transformStaffDataForUI(data)
      return transformed[0] || null
    },
    enabled: !!orderItemId,
    staleTime: 0, // Đặt về 0 để luôn fresh
    refetchOnMount: true,
    refetchOnWindowFocus: true
  })
}

export const useStaffUpdateTaskStatus = () => {
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
      status: StaffTaskStatus
      image?: string
      note?: string
    }) => {
      const body: UpdateTaskStatusRequest = { status }

      if (status === 'DONE' || status === 'PASS' || status === 'FAIL') {
        if (image) body.image = image
        if (note) body.note = note
      }

      const response = await staffTaskAPI.updateTaskStatus(dressTaskId, orderItemId, body)

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái task')
    },
    onMutate: async ({ dressTaskId, orderItemId, status, image, note }) => {
      console.log('onMutate called:', { dressTaskId, orderItemId, status })

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: staffTaskQueryKeys.lists() })
      await queryClient.cancelQueries({ queryKey: staffTaskQueryKeys.byOrderItem(orderItemId) })

      // Snapshot previous values
      const previousListData = queryClient.getQueryData<ProductTaskGroup[]>(staffTaskQueryKeys.lists())
      const previousDetailData = queryClient.getQueryData<ProductTaskGroup>(staffTaskQueryKeys.byOrderItem(orderItemId))

      console.log('Previous data:', {
        previousListData: previousListData?.length,
        previousDetailData: !!previousDetailData
      })

      // SỬA LỖI: Kiểm tra milestones tồn tại trước khi map
      if (previousDetailData && previousDetailData.milestones && Array.isArray(previousDetailData.milestones)) {
        const updatedDetailData = {
          ...previousDetailData,
          milestones: previousDetailData.milestones.map((milestone) => {
            // Kiểm tra maternityDressTasks tồn tại
            if (!milestone.maternityDressTasks || !Array.isArray(milestone.maternityDressTasks)) {
              return milestone
            }

            return {
              ...milestone,
              maternityDressTasks: milestone.maternityDressTasks.map((task) => {
                if (task.id === dressTaskId) {
                  console.log('Updating task optimistically:', { taskId: task.id, newStatus: status })
                  return {
                    ...task,
                    status: status,
                    image: image || task.image,
                    note: note || task.note
                  }
                }
                return task
              })
            }
          })
        }

        queryClient.setQueryData(staffTaskQueryKeys.byOrderItem(orderItemId), updatedDetailData)
        console.log('Optimistic update applied for detail data')
      } else {
        console.warn('Previous detail data or milestones not found:', previousDetailData)
      }

      // SỬA LỖI: Kiểm tra list data trước khi map
      if (previousListData && Array.isArray(previousListData)) {
        const updatedListData = previousListData.map((productGroup) => {
          if (productGroup.orderItemId === orderItemId) {
            // Kiểm tra milestones tồn tại
            if (!productGroup.milestones || !Array.isArray(productGroup.milestones)) {
              return productGroup
            }

            return {
              ...productGroup,
              milestones: productGroup.milestones.map((milestone) => {
                // Kiểm tra maternityDressTasks tồn tại
                if (!milestone.maternityDressTasks || !Array.isArray(milestone.maternityDressTasks)) {
                  return milestone
                }

                return {
                  ...milestone,
                  maternityDressTasks: milestone.maternityDressTasks.map((task) => {
                    if (task.id === dressTaskId) {
                      return {
                        ...task,
                        status: status,
                        image: image || task.image,
                        note: note || task.note
                      }
                    }
                    return task
                  })
                }
              })
            }
          }
          return productGroup
        })

        queryClient.setQueryData(staffTaskQueryKeys.lists(), updatedListData)
        console.log('Optimistic update applied for list data')
      } else {
        console.warn('Previous list data not found or not array:', previousListData)
      }

      return { previousListData, previousDetailData, orderItemId }
    },
    onSuccess: (data, variables) => {
      console.log('onSuccess called:', data, variables)

      const statusText =
        variables.status === 'IN_PROGRESS'
          ? 'bắt đầu'
          : variables.status === 'DONE'
            ? 'hoàn thành'
            : variables.status === 'PASS'
              ? 'hoàn thành (PASS)'
              : variables.status === 'FAIL'
                ? 'hoàn thành (FAIL)'
                : variables.status === 'PENDING'
                  ? 'chuyển về chờ'
                  : 'cập nhật'

      toast.success(`Đã ${statusText} nhiệm vụ thành công!`)

      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.byOrderItem(variables.orderItemId) })
    },
    onError: (error: unknown, variables, context) => {
      console.error('onError called:', error, variables)

      // Revert optimistic update
      if (context?.previousListData) {
        queryClient.setQueryData(staffTaskQueryKeys.lists(), context.previousListData)
      }
      if (context?.previousDetailData && context?.orderItemId) {
        queryClient.setQueryData(staffTaskQueryKeys.byOrderItem(context.orderItemId), context.previousDetailData)
      }

      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái task'
      toast.error(`Lỗi: ${errorMessage}`)
    },
    onSettled: (_, __, variables) => {
      console.log('onSettled called')
      // Đảm bảo data luôn fresh
      queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.lists() })
      if (variables) {
        queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.byOrderItem(variables.orderItemId) })
      }
    }
  })
}

/**
 * Hook lấy current sequence của milestone (staff)
 */
export const useStaffGetCurrentSequence = (orderItemId: string) => {
  return useQuery({
    queryKey: ['staff-current-sequence', orderItemId],
    queryFn: async () => {
      const response = await globalAPI.getCurrentSequence(orderItemId)
      if (response.data.statusCode === 200) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch current sequence')
    },
    enabled: !!orderItemId,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    refetchOnMount: false, // Không refetch khi mount
    refetchOnWindowFocus: false, // Không refetch khi focus window
    refetchOnReconnect: false, // Không refetch khi reconnect
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: 1000
  })
}

/**
 * Hook để hoàn thành nhanh tất cả task cho demo
 * Chỉ sử dụng cho mục đích demo, không nên dùng trong production
 */
export const useStaffCompleteAllTasksForDemo = () => {
  const queryClient = useQueryClient()
  const updateTaskStatusMutation = useStaffUpdateTaskStatus()

  return useMutation({
    mutationFn: async ({
      orderItemId,
      milestones,
      currentSequence
    }: {
      orderItemId: string
      milestones: MilestoneUI[]
      currentSequence?: { milestone: number; task: number } | null
    }) => {
      // Xác định milestone hiện tại cần hoàn thành
      let targetMilestone: MilestoneUI | null = null
      
      if (currentSequence && currentSequence.milestone > 0) {
        // Nếu có currentSequence, hoàn thành milestone hiện tại
        targetMilestone = milestones.find(m => m.sequenceOrder === currentSequence.milestone) || null
      } else {
        // Nếu không có currentSequence, tìm milestone đầu tiên chưa hoàn thành
        targetMilestone = milestones.find(m => {
          const hasIncompleteTasks = m.maternityDressTasks.some(task => 
            task.status !== 'DONE' && task.status !== 'PASS' && task.status !== 'FAIL'
          )
          return hasIncompleteTasks
        }) || null
      }

      if (!targetMilestone) {
        throw new Error('Không tìm thấy milestone cần hoàn thành')
      }

      // Lấy tất cả task trong milestone hiện tại cần update
      const tasksToComplete = targetMilestone.maternityDressTasks.filter((task) => 
        task.status !== 'DONE' && task.status !== 'PASS' && task.status !== 'FAIL'
      )

      if (tasksToComplete.length === 0) {
        throw new Error(`Milestone "${targetMilestone.name}" đã hoàn thành tất cả task`)
      }

      // Update từng task một cách tuần tự
      const results = []
      for (const task of tasksToComplete) {
        try {
          // Xác định status phù hợp cho từng loại task
          let targetStatus: StaffTaskStatus = 'DONE'
          
          // Nếu là Quality Check task, sử dụng PASS
          if (targetMilestone.name.toLowerCase().includes('quality') || 
              targetMilestone.name.toLowerCase().includes('kiểm tra')) {
            targetStatus = 'PASS'
          }

          const result = await updateTaskStatusMutation.mutateAsync({
            dressTaskId: task.id,
            orderItemId,
            status: targetStatus,
            note: `Hoàn thành nhanh cho demo - ${new Date().toLocaleString('vi-VN')}`
          })
          results.push(result)
          
          // Delay nhỏ để tránh spam API
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Error updating task ${task.id}:`, error)
          // Tiếp tục với task tiếp theo thay vì dừng
        }
      }

      return {
        results,
        milestoneName: targetMilestone.name,
        completedTasks: results.length
      }
    },
    onSuccess: (data, variables) => {
      toast.success(`Đã hoàn thành nhanh ${data.completedTasks} nhiệm vụ trong milestone "${data.milestoneName}" cho demo!`)
      
      // Invalidate tất cả queries liên quan
      queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.byOrderItem(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: ['staff-current-sequence', variables.orderItemId] })
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi hoàn thành nhanh'
      toast.error(`Lỗi: ${errorMessage}`)
    }
  })
}
