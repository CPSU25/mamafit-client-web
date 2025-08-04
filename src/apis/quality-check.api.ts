// quality-check.api.ts
import { api } from '@/lib/axios/axios'

export type QualityCheckStatus = 'PASS' | 'FAIL'

export interface QualityCheckSubmitRequest {
  maternityDressTaskIds: string[]
  orderItemId: string
  status: QualityCheckStatus
  severity: boolean
}

export interface QualityCheckSubmitResponse {
  success: boolean
  message: string
  data?: unknown
}

export interface QualityCheckTaskStatus {
  taskId: string
  status: 'PASS' | 'FAIL' | null
  severity: boolean
}

export interface QualityCheckSubmitPayload {
  taskStatuses: QualityCheckTaskStatus[]
  orderItemId: string
}

// Submit Quality Check với logic chia theo PASS/FAIL
export const submitQualityCheckStatus = async (
  payload: QualityCheckSubmitPayload
): Promise<QualityCheckSubmitResponse> => {
  const { taskStatuses, orderItemId } = payload

  // Phân loại tasks theo status
  const passedTasks = taskStatuses.filter((task) => task.status === 'PASS')
  const failedTasks = taskStatuses.filter((task) => task.status === 'FAIL')

  // Kiểm tra có task nào severity = true không
  const hasSeverityTasks = failedTasks.some((task) => task.severity)

  try {
    const results = []

    // Trường hợp 1: Tất cả tasks đều PASS
    if (failedTasks.length === 0 && passedTasks.length > 0) {
      const response = await api.put('/order-items/check-list-status', {
        maternityDressTaskIds: passedTasks.map((task) => task.taskId),
        orderItemId,
        status: 'PASS' as QualityCheckStatus,
        severity: false
      })
      results.push(response.data)
    }

    // Trường hợp 2: Có cả PASS và FAIL
    else if (passedTasks.length > 0 && failedTasks.length > 0) {
      // Submit PASS tasks trước
      const passResponse = await api.put('/order-items/check-list-status', {
        maternityDressTaskIds: passedTasks.map((task) => task.taskId),
        orderItemId,
        status: 'PASS' as QualityCheckStatus,
        severity: false
      })
      results.push(passResponse.data)

      // Submit FAIL tasks
      const failResponse = await api.put('/order-items/check-list-status', {
        maternityDressTaskIds: failedTasks.map((task) => task.taskId),
        orderItemId,
        status: 'FAIL' as QualityCheckStatus,
        severity: hasSeverityTasks
      })
      results.push(failResponse.data)
    }

    // Trường hợp 3: Chỉ có FAIL tasks
    else if (failedTasks.length > 0) {
      const failResponse = await api.put('/order-items/check-list-status', {
        maternityDressTaskIds: failedTasks.map((task) => task.taskId),
        orderItemId,
        status: 'FAIL' as QualityCheckStatus,
        severity: hasSeverityTasks
      })
      results.push(failResponse.data)
    }

    // Tổng hợp kết quả
    const allSuccessful = results.every((result) => result.success)

    return {
      success: allSuccessful,
      message: allSuccessful ? 'Quality Check submitted successfully' : 'Some requests failed',
      data: {
        results,
        summary: {
          totalTasks: taskStatuses.length,
          passedTasks: passedTasks.length,
          failedTasks: failedTasks.length,
          hasSeverity: hasSeverityTasks
        }
      }
    }
  } catch (error) {
    console.error('Error submitting quality check:', error)
    throw error
  }
}
