// services/staff/quality-check.service.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitQualityCheckStatus } from '@/apis/quality-check.api'
import { toast } from 'sonner'

// Hook để xử lý Quality Check submit
export const useQualityCheckSubmit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitQualityCheckStatus,
    onSuccess: (_data, payload) => {
      // Invalidate relevant queries để refresh data
      queryClient.invalidateQueries({
        queryKey: ['staff-order-task', payload.orderItemId]
      })
      queryClient.invalidateQueries({
        queryKey: ['staff-tasks']
      })
    },
    onError: (error) => {
      console.error('Quality Check submit error:', error)
      toast.error('Có lỗi xảy ra khi submit Quality Check')
    }
  })
}

// Hook để xử lý post-submit logic
export const useQualityCheckPostSubmitHandler = () => {
  const queryClient = useQueryClient()

  const handlePostSubmit = async (orderItemId: string, hasFailures: boolean, hasSeverity: boolean) => {
    try {
      if (hasFailures) {
        if (hasSeverity) {
          // Trường hợp có severity = true: Backend sẽ reset Preset Production
          // Chỉ cần reload data để lấy state mới
          await queryClient.invalidateQueries({
            queryKey: ['staff-order-task', orderItemId]
          })

          return {
            action: 'reset_preset_production',
            message: 'Preset Production đã được reset do có lỗi nghiêm trọng'
          }
        } else {
          // Trường hợp có FAIL nhưng không severity: Khóa các milestone tiếp theo
          await queryClient.invalidateQueries({
            queryKey: ['staff-order-task', orderItemId]
          })

          return {
            action: 'lock_next_milestones',
            message: 'Các milestone tiếp theo đã bị khóa, chờ admin assign người khác'
          }
        }
      } else {
        // Trường hợp tất cả PASS: Tiếp tục workflow bình thường
        await queryClient.invalidateQueries({
          queryKey: ['staff-order-task', orderItemId]
        })

        return {
          action: 'continue_workflow',
          message: 'Quality Check hoàn thành, có thể tiếp tục các milestone tiếp theo'
        }
      }
    } catch (error) {
      console.error('Post-submit handling error:', error)
      return {
        action: 'error',
        message: 'Có lỗi xảy ra trong quá trình xử lý sau submit'
      }
    }
  }

  return { handlePostSubmit }
}
