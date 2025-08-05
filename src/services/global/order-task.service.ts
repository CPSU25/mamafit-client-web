// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import orderTaskAPI from '@/apis/staff-order-task.api'
// import { OrderTaskItem } from '@/@types/order-task.types'
// import { ProductTaskGroup, MilestoneUI, TaskStatus } from '@/pages/staff/manage-task/tasks/types'
// import { toast } from 'sonner'

// const orderTasksQueryKeys = {
//   all: ['orderTasks'] as const,
//   lists: () => [...orderTasksQueryKeys.all, 'list'] as const,
//   byOrderItem: (orderItemId: string) => [...orderTasksQueryKeys.all, 'orderItem', orderItemId] as const
// }

// /**
//  * Hàm chuyển đổi dữ liệu từ API response (OrderTaskItem[]) sang định dạng UI cần (ProductTaskGroup[]).
//  * Mỗi OrderTaskItem sẽ tạo ra một ProductTaskGroup riêng biệt.
//  */
// const transformDataForUI = (data: OrderTaskItem[]): ProductTaskGroup[] => {
//   if (!data || !Array.isArray(data)) {
//     console.warn('transformDataForUI: Invalid data received:', data)
//     return []
//   }

//   // Chuyển đổi mỗi OrderTaskItem thành một ProductTaskGroup
//   return data
//     .map((orderTaskItem) => {
//       if (!orderTaskItem.orderItem?.preset) {
//         console.warn('OrderTaskItem missing preset:', orderTaskItem)
//         return null
//       }

//       // Transform milestones data with QualityCheck detection
//       const milestonesUI: MilestoneUI[] = orderTaskItem.milestones.map((milestone) => {
//         const isQualityCheck =
//           milestone.name.toLowerCase().includes('quality') ||
//           milestone.name.toLowerCase().includes('kiểm tra') ||
//           milestone.name.toLowerCase().includes('quality check')

//         return {
//           name: milestone.name,
//           description: milestone.description,
//           sequenceOrder: milestone.sequenceOrder,
//           isQualityCheck,
//           maternityDressTasks: Array.isArray(milestone.maternityDressTasks)
//             ? milestone.maternityDressTasks.map((task) => ({
//                 id: task.id,
//                 name: task.name,
//                 description: task.description,
//                 // Giữ nguyên status từ API, có thể là PASS/FAIL hoặc DONE/PENDING/IN_PROGRESS
//                 status: task.status as TaskStatus,
//                 sequenceOrder: task.sequenceOrder,
//                 image: task.image,
//                 note: task.note
//               }))
//             : []
//         }
//       })

//       return {
//         preset: orderTaskItem.orderItem.preset,
//         milestones: milestonesUI.sort((a, b) => a.sequenceOrder - b.sequenceOrder),
//         orderItemId: orderTaskItem.orderItem.id
//       }
//     })
//     .filter(Boolean) as ProductTaskGroup[]
// }
// /**
//  * Custom hook để lấy danh sách các order item mà nhân viên được giao task.
//  * Mỗi order item sẽ được hiển thị riêng biệt với các milestone và task tương ứng.
//  */
// // export const useGetOrderTasks = () => {
// //   return useQuery<OrderTaskItem[], unknown, ProductTaskGroup[]>({
// //     queryKey: orderTasksQueryKeys.lists(),
// //     queryFn: async () => {
// //       const response = await orderTaskAPI.getOrderTask()
// //       console.log('API Response:', response.data) // Debug log
// //       // The API returns { data: [], statusCode, message, code } structure
// //       if (response.data.statusCode === 200) {
// //         return response.data.data || []
// //       }
// //       throw new Error(response.data.message || 'Failed to fetch order tasks')
// //     },
// //     // Sử dụng `select` để transform dữ liệu, component sẽ nhận được dữ liệu đã được group theo preset.
// //     select: (data: OrderTaskItem[]): ProductTaskGroup[] => {
// //       console.log('Raw data before transform:', data) // Debug log
// //       const transformed = transformDataForUI(data)
// //       console.log('Transformed data:', transformed) // Debug log
// //       return transformed
// //     },
// //     staleTime: 5 * 60 * 1000 // 5 phút
// //   })
// // }

// /**
//  * Hook để lấy thông tin chi tiết task của một orderItem cụ thể
//  */
// // export const useGetOrderTaskByOrderItemId = (orderItemId: string) => {
// //   return useQuery<OrderTaskItem[], unknown, ProductTaskGroup | null>({
// //     queryKey: orderTasksQueryKeys.byOrderItem(orderItemId),
// //     queryFn: async () => {
// //       const response = await orderTaskAPI.getOrderTaskByOrderItemId(orderItemId)
// //       console.log('API Response for orderItem:', response.data)
// //       if (response.data.statusCode === 200) {
// //         return response.data.data || []
// //       }
// //       throw new Error(response.data.message || 'Failed to fetch order task details')
// //     },
// //     select: (data: OrderTaskItem[]): ProductTaskGroup | null => {
// //       if (!data || data.length === 0) return null
// //       const transformed = transformDataForUI(data)
// //       return transformed[0] || null // Chỉ trả về item đầu tiên vì chỉ có 1 orderItem
// //     },
// //     enabled: !!orderItemId,
// //     staleTime: 5 * 60 * 1000 // 5 phút
// //   })
// // }

// /**
//  * Hook để cập nhật trạng thái của một task cụ thể - hỗ trợ image và note khi hoàn thành
//  * Quality Check tasks sẽ có status PASS/FAIL thay vì DONE
//  */
// export const useUpdateTaskStatus = () => {
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
//       status: TaskStatus
//       image?: string
//       note?: string
//     }) => {
//       console.log('Updating task status:', { dressTaskId, orderItemId, status, image, note })

//       const body: { status: TaskStatus; image?: string; note?: string } = { status }

//       // Thêm image và note khi task hoàn thành (DONE, PASS, FAIL)
//       if (status === 'DONE' || status === 'PASS' || status === 'FAIL') {
//         if (image) body.image = image
//         if (note) body.note = note
//       }

//       const response = await orderTaskAPI.updateTaskStatus(dressTaskId, orderItemId, body)

//       if (response.data.statusCode === 200) {
//         return response.data
//       }
//       throw new Error(response.data.message || 'Không thể cập nhật trạng thái task')
//     },
//     onMutate: async ({ dressTaskId, orderItemId, status, image, note }) => {
//       // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
//       await queryClient.cancelQueries({ queryKey: orderTasksQueryKeys.lists() })
//       await queryClient.cancelQueries({ queryKey: orderTasksQueryKeys.byOrderItem(orderItemId) })

//       // Snapshot the previous value
//       const previousListData = queryClient.getQueryData<ProductTaskGroup[]>(orderTasksQueryKeys.lists())
//       const previousDetailData = queryClient.getQueryData<ProductTaskGroup>(
//         orderTasksQueryKeys.byOrderItem(orderItemId)
//       )

//       // Optimistically update to the new value - LIST DATA
//       if (previousListData) {
//         const updatedListData = previousListData.map((productGroup) => {
//           if (productGroup.orderItemId === orderItemId) {
//             return {
//               ...productGroup,
//               milestones: productGroup.milestones.map((milestone) => ({
//                 ...milestone,
//                 maternityDressTasks: milestone.maternityDressTasks.map((task) => {
//                   if (task.id === dressTaskId) {
//                     return {
//                       ...task,
//                       status,
//                       ...(image && { image }),
//                       ...(note && { note })
//                     }
//                   }
//                   return task
//                 })
//               }))
//             }
//           }
//           return productGroup
//         })
//         queryClient.setQueryData(orderTasksQueryKeys.lists(), updatedListData)
//       }

//       // Optimistically update to the new value - DETAIL DATA
//       if (previousDetailData && previousDetailData.orderItemId === orderItemId) {
//         const updatedDetailData = {
//           ...previousDetailData,
//           milestones: previousDetailData.milestones.map((milestone) => ({
//             ...milestone,
//             maternityDressTasks: milestone.maternityDressTasks.map((task) => {
//               if (task.id === dressTaskId) {
//                 return {
//                   ...task,
//                   status,
//                   ...(image && { image }),
//                   ...(note && { note })
//                 }
//               }
//               return task
//             })
//           }))
//         }
//         queryClient.setQueryData(orderTasksQueryKeys.byOrderItem(orderItemId), updatedDetailData)
//       }

//       // Return a context object with the snapshotted value
//       return { previousListData, previousDetailData, orderItemId }
//     },
//     onSuccess: (_, variables) => {
//       // Hiển thị thông báo thành công
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

//       toast.success(`Đã ${statusText} nhiệm vụ thành công!`)
//     },
//     onError: (error: unknown, _, context) => {
//       console.error('Lỗi khi cập nhật trạng thái task:', error)

//       // Revert the optimistic update
//       if (context?.previousListData) {
//         queryClient.setQueryData(orderTasksQueryKeys.lists(), context.previousListData)
//       }
//       if (context?.previousDetailData && context?.orderItemId) {
//         queryClient.setQueryData(orderTasksQueryKeys.byOrderItem(context.orderItemId), context.previousDetailData)
//       }

//       const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái task'
//       toast.error(`Lỗi: ${errorMessage}`)
//     },
//     onSettled: (_, __, variables) => {
//       // Always refetch after error or success to ensure we have the latest data
//       queryClient.invalidateQueries({ queryKey: orderTasksQueryKeys.lists() })
//       queryClient.invalidateQueries({ queryKey: orderTasksQueryKeys.byOrderItem(variables.orderItemId) })
//     },
//     retry: (failureCount, error: unknown) => {
//       // Không retry cho lỗi 4xx
//       const status = (error as { response?: { status?: number } })?.response?.status
//       if (status && status >= 400 && status < 500) {
//         return false
//       }
//       return failureCount < 2
//     }
//   })
// }
