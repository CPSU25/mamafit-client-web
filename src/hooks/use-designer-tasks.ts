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
    onMutate: async ({ taskId, body }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['designer-tasks'] })

      // Snapshot previous values
      const previousData = queryClient.getQueryData(['designer-tasks'])

      // Optimistic update
      queryClient.setQueryData(['designer-tasks'], (old: unknown) => {
        if (!old || typeof old !== 'object' || !('data' in old)) return old
        
        const oldData = old as { data: { data: unknown[] } }
        if (!oldData.data?.data || !Array.isArray(oldData.data.data)) return old

        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((request: unknown) => {
              if (!request || typeof request !== 'object' || !('milestones' in request)) return request
              
              const requestData = request as { milestones: unknown[] }
              if (!Array.isArray(requestData.milestones)) return request

              return {
                ...requestData,
                milestones: requestData.milestones.map((milestone: unknown) => {
                  if (!milestone || typeof milestone !== 'object' || !('maternityDressTasks' in milestone)) return milestone
                  
                  const milestoneData = milestone as { maternityDressTasks: unknown[] }
                  if (!Array.isArray(milestoneData.maternityDressTasks)) return milestone

                  return {
                    ...milestoneData,
                    maternityDressTasks: milestoneData.maternityDressTasks.map((task: unknown) => {
                      if (!task || typeof task !== 'object' || !('id' in task)) return task
                      
                      const taskData = task as { id: string; status: string }
                      if (taskData.id === taskId) {
                        return { ...taskData, status: body.status }
                      }
                      return task
                    })
                  }
                })
              }
            })
          }
        }
      })

      return { previousData }
    },
    onSuccess: (data, variables) => {
      console.log('✅ Task status updated successfully:', { data, variables })
      
      // Invalidate và refetch designer tasks
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
      
      // Force refetch để đảm bảo data fresh
      queryClient.refetchQueries({ queryKey: ['designer-tasks'] })
      
      toast.success('Cập nhật trạng thái task thành công!')
    },
    onError: (error: Error, _variables, context) => {
      console.error('❌ Error updating task status:', error)
      
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['designer-tasks'], context.previousData)
      }
      
      toast.error(`Lỗi cập nhật task: ${error.message}`)
    },
    onSettled: () => {
      // Đảm bảo data luôn fresh sau khi hoàn thành
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
    }
  })
}

export function useSendPresetToCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      images: string[]
      type: 'SYSTEM' 
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
