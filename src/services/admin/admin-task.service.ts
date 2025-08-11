import { useMutation, useQueryClient, useQueries } from '@tanstack/react-query'
import adminTaskAPI from '@/apis/admin-task.api'
import {
  AdminOrderItemWithTasks,
  AdminAssignChargeRequest,
  AdminUpdateTaskStatusRequest,
  AdminTaskStatus
} from '@/@types/admin-task.types'
import { toast } from 'sonner'

const adminTaskQueryKeys = {
  all: ['adminTasks'] as const,
  orderItems: () => [...adminTaskQueryKeys.all, 'orderItems'] as const,
  orderItem: (id: string) => [...adminTaskQueryKeys.orderItems(), id] as const
}

export const useAdminOrderItemsWithTasks = (orderItemIds: string[], enabled: boolean) => {
  const queries = useQueries({
    queries: orderItemIds.map((id) => ({
      queryKey: adminTaskQueryKeys.orderItem(id),
      queryFn: async () => {
        const response = await adminTaskAPI.getOrderItemWithTasks(id)
        if (response.data.statusCode === 200) {
          return response.data.data as AdminOrderItemWithTasks
        }
        throw new Error(response.data.message || 'Failed to fetch admin order item tasks')
      },
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000
    }))
  })

  return queries
}

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
