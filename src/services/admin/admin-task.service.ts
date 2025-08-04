// =====================================================================
// File: src/services/admin/admin-task.service.ts
// Mô tả: Service riêng cho Admin Task Management
// Chỉ xử lý data structure của admin, không có mapping với staff
// =====================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminTaskAPI from '@/apis/admin-task.api'
import {
  AdminOrderItemWithTasks,
  AdminAssignChargeRequest,
  AdminUpdateTaskStatusRequest,
  AdminTaskStatus
} from '@/@types/admin/admin-task.types'
import { toast } from 'sonner'

/**
 * Query keys cho admin tasks - tách biệt với staff
 */
const adminTaskQueryKeys = {
  all: ['adminTasks'] as const,
  orderItems: () => [...adminTaskQueryKeys.all, 'orderItems'] as const,
  orderItem: (id: string) => [...adminTaskQueryKeys.orderItems(), id] as const
}

/**
 * Hook lấy thông tin order item với milestones và tasks (cho admin)
 * Trả về đúng structure admin: milestones có tasks, task có detail
 */
export const useAdminOrderItemWithTasks = (orderItemId: string) => {
  return useQuery<AdminOrderItemWithTasks>({
    queryKey: adminTaskQueryKeys.orderItem(orderItemId),
    queryFn: async () => {
      const response = await adminTaskAPI.getOrderItemWithTasks(orderItemId)

      if (response.data.statusCode === 200) {
        // Trả về trực tiếp data, không transform gì cả
        // Data đã đúng format admin: milestones.tasks[].detail{status, note, image}
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch admin order item tasks')
    },
    enabled: !!orderItemId,
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

/**
 * Hook assign charge cho milestones (admin only)
 */
export const useAdminAssignCharge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assignments: AdminAssignChargeRequest[]) => {
      const response = await adminTaskAPI.assignCharge(assignments)

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign charge')
    },
    onSuccess: (_, variables) => {
      // Invalidate các order items liên quan
      variables.forEach((assignment) => {
        assignment.orderItemIds.forEach((orderItemId) => {
          queryClient.invalidateQueries({
            queryKey: adminTaskQueryKeys.orderItem(orderItemId)
          })
        })
      })

      toast.success(`Đã giao thành công ${variables.length} milestone cho nhân viên`)
    },
    onError: (error: unknown) => {
      console.error('Error assigning charge:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể giao việc'
      toast.error(`Lỗi: ${errorMessage}`)
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

/**
 * Hook update check list status (admin only)
 */
export const useAdminUpdateCheckListStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: { maternityDressTaskIds: string[]; orderItemId: string; status: string }) => {
      const response = await adminTaskAPI.updateCheckListStatus(body)

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update check list status')
    },
    onSuccess: (_, variables) => {
      // Invalidate order item liên quan
      queryClient.invalidateQueries({
        queryKey: adminTaskQueryKeys.orderItem(variables.orderItemId)
      })

      toast.success('Đã cập nhật trạng thái checklist thành công')
    },
    onError: (error: unknown) => {
      console.error('Error updating check list status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
      toast.error(`Lỗi: ${errorMessage}`)
    }
  })
}

/**
 * Hook update task status cho admin (nếu cần)
 */
export const useAdminUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      orderItemId,
      status,
      image,
      note,
      chargeId
    }: {
      taskId: string
      orderItemId: string
      status: AdminTaskStatus
      image?: string
      note?: string
      chargeId?: string
    }) => {
      const body: AdminUpdateTaskStatusRequest = { status }
      if (image) body.image = image
      if (note) body.note = note
      if (chargeId) body.chargeId = chargeId

      const response = await adminTaskAPI.updateTaskStatus(taskId, orderItemId, body)

      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update admin task status')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminTaskQueryKeys.orderItem(variables.orderItemId)
      })

      const statusText = variables.status === 'COMPLETED' ? 'hoàn thành' : 'cập nhật'
      toast.success(`Đã ${statusText} nhiệm vụ thành công`)
    },
    onError: (error: unknown) => {
      console.error('Error updating admin task status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật task'
      toast.error(`Lỗi: ${errorMessage}`)
    }
  })
}
