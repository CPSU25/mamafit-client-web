// =====================================================================
// File: src/services/staff/staff-task.service.ts
// Mô tả: Service quản lý nhiệm vụ cho Staff
// =====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import staffTaskAPI from '@/apis/staff-order-task.api'
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
      if (!staffOrderTaskItem.orderItem?.preset) {
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
        preset: staffOrderTaskItem.orderItem.preset,
        milestones: milestonesUI.sort((a, b) => a.sequenceOrder - b.sequenceOrder),
        orderItemId: staffOrderTaskItem.orderItem.id
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

/**
 * Hook cập nhật task status (staff)
 */
// export const useStaffUpdateTaskStatus = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async ({
//       dressTaskId,
//       orderItemId,
//       status,
//       image,
//       note
//     }: {
//       dressTaskId: string
//       orderItemId: string
//       status: StaffTaskStatus
//       image?: string
//       note?: string
//     }) => {
//       const body: StaffUpdateTaskStatusRequest = { status }

//       // Thêm image và note khi task hoàn thành (DONE, PASS, FAIL)
//       if (status === 'DONE' || status === 'PASS' || status === 'FAIL') {
//         if (image) body.image = image
//         if (note) body.note = note
//       }

//       const response = await staffTaskAPI.updateTaskStatus(dressTaskId, orderItemId, body)

//       if (response.data.statusCode === 200) {
//         return response.data
//       }
//       throw new Error(response.data.message || 'Không thể cập nhật trạng thái task')
//     },
//     onMutate: async ({ dressTaskId, orderItemId, status, image, note }) => {
//       // Cancel outgoing refetches để tránh race condition
//       await queryClient.cancelQueries({ queryKey: staffTaskQueryKeys.lists() })
//       await queryClient.cancelQueries({ queryKey: staffTaskQueryKeys.byOrderItem(orderItemId) })

//       // Snapshot previous values
//       const previousListData = queryClient.getQueryData<ProductTaskGroup[]>(staffTaskQueryKeys.lists())
//       const previousDetailData = queryClient.getQueryData<ProductTaskGroup>(staffTaskQueryKeys.byOrderItem(orderItemId))

//       // Optimistic update cho list data
//       if (previousListData) {
//         const updatedListData = previousListData.map((productGroup) => {
//           if (productGroup.orderItemId === orderItemId) {
//             return {
//               ...productGroup,
//               milestones: productGroup.milestones.map((milestone) => ({
//                 ...milestone,
//                 maternityDressTasks: milestone.maternityDressTasks.map((task) => {
//                   if (task.id === dressTaskId && task.orderItemId === orderItemId) {
//                     return {
//                       ...task,
//                       status: status,
//                       image: image || task.image,
//                       note: note || task.note
//                     }
//                   }
//                   return task
//                 })
//               }))
//             }
//           }
//           return productGroup
//         })

//         queryClient.setQueryData(staffTaskQueryKeys.lists(), updatedListData)
//       }

//       // Optimistic update cho detail data
//       if (previousDetailData && previousDetailData.orderItemId === orderItemId) {
//         const updatedDetailData = {
//           ...previousDetailData,
//           milestones: previousDetailData.milestones.map((milestone) => ({
//             ...milestone,
//             maternityDressTasks: milestone.maternityDressTasks.map((task) => {
//               if (task.id === dressTaskId && task.orderItemId === orderItemId) {
//                 return {
//                   ...task,
//                   status: status,
//                   image: image || task.image,
//                   note: note || task.note
//                 }
//               }
//               return task
//             })
//           }))
//         }

//         queryClient.setQueryData(staffTaskQueryKeys.byOrderItem(orderItemId), updatedDetailData)
//       }

//       return { previousListData, previousDetailData, orderItemId }
//     },
//     onSuccess: (_, variables) => {
//       const statusText =
//         variables.status === 'IN_PROGRESS'
//           ? 'bắt đầu'
//           : variables.status === 'DONE'
//             ? 'hoàn thành'
//             : variables.status === 'PASS'
//               ? 'hoàn thành (PASS)'
//               : variables.status === 'FAIL'
//                 ? 'hoàn thành (FAIL)'
//                 : variables.status === 'PENDING'
//                   ? 'chuyển về chờ'
//                   : 'cập nhật'

//       // Invalidate queries để refresh data
//       queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.lists() })
//       queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.byOrderItem(variables.orderItemId) })

//       toast.success(`Đã ${statusText} nhiệm vụ thành công!`)
//     },
//     onError: (error: unknown, _, context) => {
//       // Revert the optimistic update
//       if (context?.previousListData) {
//         queryClient.setQueryData(staffTaskQueryKeys.lists(), context.previousListData)
//       }
//       if (context?.previousDetailData && context?.orderItemId) {
//         queryClient.setQueryData(staffTaskQueryKeys.byOrderItem(context.orderItemId), context.previousDetailData)
//       }

//       const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái task'
//       toast.error(`Lỗi: ${errorMessage}`)
//     },
//     onSettled: (_, __, variables) => {
//       // Đảm bảo data luôn fresh
//       queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.lists() })
//       if (variables) {
//         queryClient.invalidateQueries({ queryKey: staffTaskQueryKeys.byOrderItem(variables.orderItemId) })
//       }
//     },
//     retry: (failureCount, error: unknown) => {
//       const status = (error as { response?: { status?: number } })?.response?.status
//       if (status && status >= 400 && status < 500) {
//         return false
//       }
//       return failureCount < 2
//     }
//   })
// }

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
