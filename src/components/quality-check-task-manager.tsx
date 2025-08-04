// components/quality-check-task-manager.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useQualityCheckSubmit } from '@/services/staff/quality-check.service'
import { QualityCheckTaskStatus } from '@/apis/quality-check.api'

interface QualityCheckTask {
  id: string
  name: string
  description?: string
  sequenceOrder: number
}

interface QualityCheckTaskManagerProps {
  tasks: QualityCheckTask[]
  orderItemId: string
  onSubmitSuccess: (hasFailures: boolean, hasSeverity: boolean) => void
  isDisabled?: boolean
}

export const QualityCheckTaskManager: React.FC<QualityCheckTaskManagerProps> = ({
  tasks,
  orderItemId,
  onSubmitSuccess,
  isDisabled = false
}) => {
  const [taskStatuses, setTaskStatuses] = useState<QualityCheckTaskStatus[]>([])
  const qualityCheckMutation = useQualityCheckSubmit()

  // Khởi tạo state cho các task
  useEffect(() => {
    const initialStatuses: QualityCheckTaskStatus[] = tasks.map((task) => ({
      taskId: task.id,
      status: null,
      severity: false
    }))
    setTaskStatuses(initialStatuses)
  }, [tasks])

  // Cập nhật status cho một task
  const updateTaskStatus = (taskId: string, status: 'PASS' | 'FAIL' | null) => {
    setTaskStatuses((prev) =>
      prev.map((item) =>
        item.taskId === taskId ? { ...item, status, severity: status === 'PASS' ? false : item.severity } : item
      )
    )
  }

  // Cập nhật severity cho một task
  const updateTaskSeverity = (taskId: string, severity: boolean) => {
    setTaskStatuses((prev) => prev.map((item) => (item.taskId === taskId ? { ...item, severity } : item)))
  }

  // Kiểm tra có thể submit không
  const canSubmit = () => {
    return taskStatuses.every((status) => status.status !== null) && !isDisabled
  }

  // Xử lý submit
  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error('Vui lòng hoàn thành đánh giá tất cả các task')
      return
    }

    try {
      const response = await qualityCheckMutation.mutateAsync({
        taskStatuses,
        orderItemId
      })

      if (response.success && response.data) {
        // Tính lại summary từ taskStatuses
        const summary = {
          totalTasks: taskStatuses.length,
          passedTasks: taskStatuses.filter((t) => t.status === 'PASS').length,
          failedTasks: taskStatuses.filter((t) => t.status === 'FAIL').length,
          hasSeverity: taskStatuses.some((t) => t.status === 'FAIL' && t.severity)
        }
        const hasFailures = summary.failedTasks > 0
        const hasSeverity = summary.hasSeverity

        // Hiển thị thông báo phù hợp
        if (hasFailures) {
          if (hasSeverity) {
            toast.warning('Quality Check hoàn thành. Có lỗi nghiêm trọng - Preset Production sẽ được reset.', {
              description: `${summary.passedTasks} task PASS, ${summary.failedTasks} task FAIL (có severity)`
            })
          } else {
            toast.warning('Quality Check hoàn thành. Có lỗi không nghiêm trọng - Các milestone tiếp theo sẽ bị khóa.', {
              description: `${summary.passedTasks} task PASS, ${summary.failedTasks} task FAIL`
            })
          }
        } else {
          toast.success('Quality Check hoàn thành thành công!', {
            description: `Tất cả ${summary.totalTasks} task đều PASS`
          })
        }

        // Gọi callback để xử lý logic tiếp theo
        onSubmitSuccess(hasFailures, hasSeverity)
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi submit Quality Check')
      }
    } catch (error) {
      console.error('Error submitting quality check:', error)
      toast.error('Có lỗi xảy ra khi submit Quality Check')
    }
  }

  // Tính toán thống kê
  const completedTasks = taskStatuses.filter((status) => status.status !== null).length
  const passedTasks = taskStatuses.filter((status) => status.status === 'PASS').length
  const failedTasks = taskStatuses.filter((status) => status.status === 'FAIL').length
  const severityTasks = taskStatuses.filter((status) => status.status === 'FAIL' && status.severity).length

  return (
    <Card className='overflow-hidden border-orange-200'>
      <CardHeader className='bg-gradient-to-r from-orange-50 to-amber-50'>
        <CardTitle className='flex items-center gap-2 text-orange-800'>
          <ShieldCheck className='h-5 w-5' />
          Quality Check - Đánh giá chất lượng
        </CardTitle>
        <div className='flex items-center gap-4 text-sm flex-wrap'>
          <Badge variant='outline' className='border-orange-200'>
            {completedTasks}/{tasks.length} task đã đánh giá
          </Badge>
          {passedTasks > 0 && (
            <Badge className='bg-green-100 text-green-800 border-green-200'>
              <CheckCircle2 className='h-3 w-3 mr-1' />
              {passedTasks} PASS
            </Badge>
          )}
          {failedTasks > 0 && (
            <Badge className='bg-red-100 text-red-800 border-red-200'>
              <XCircle className='h-3 w-3 mr-1' />
              {failedTasks} FAIL
            </Badge>
          )}
          {severityTasks > 0 && (
            <Badge className='bg-red-200 text-red-900 border-red-300'>
              <AlertTriangle className='h-3 w-3 mr-1' />
              {severityTasks} nghiêm trọng
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='p-6'>
        <div className='space-y-4'>
          {tasks
            .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
            .map((task) => {
              const currentStatus = taskStatuses.find((status) => status.taskId === task.id)
              const isPass = currentStatus?.status === 'PASS'
              const isFail = currentStatus?.status === 'FAIL'
              const hasSeverity = currentStatus?.severity || false

              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    isPass
                      ? 'border-green-200 bg-green-50'
                      : isFail
                        ? hasSeverity
                          ? 'border-red-300 bg-red-50'
                          : 'border-orange-200 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                  } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className='space-y-3'>
                    {/* Task Info */}
                    <div className='flex items-start gap-3'>
                      <Badge variant='outline' className='text-xs font-mono mt-1'>
                        #{task.sequenceOrder}
                      </Badge>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900'>{task.name}</h4>
                        {task.description && <p className='text-sm text-gray-600 mt-1'>{task.description}</p>}
                      </div>
                      {currentStatus?.status && (
                        <Badge
                          className={
                            isPass
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {currentStatus.status}
                        </Badge>
                      )}
                    </div>

                    {/* Status Selection */}
                    <div className='flex items-center gap-6 ml-12'>
                      {/* PASS Checkbox */}
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id={`pass-${task.id}`}
                          checked={isPass}
                          onCheckedChange={(checked) => {
                            updateTaskStatus(task.id, checked ? 'PASS' : null)
                          }}
                          disabled={isDisabled}
                          className='data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
                        />
                        <label
                          htmlFor={`pass-${task.id}`}
                          className={`text-sm font-medium cursor-pointer ${
                            isPass ? 'text-green-700' : 'text-gray-700'
                          } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                        >
                          <CheckCircle2 className='inline h-4 w-4 mr-1' />
                          PASS - Đạt chất lượng
                        </label>
                      </div>

                      {/* FAIL Checkbox */}
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id={`fail-${task.id}`}
                          checked={isFail}
                          onCheckedChange={(checked) => {
                            updateTaskStatus(task.id, checked ? 'FAIL' : null)
                          }}
                          disabled={isDisabled}
                          className='data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600'
                        />
                        <label
                          htmlFor={`fail-${task.id}`}
                          className={`text-sm font-medium cursor-pointer ${
                            isFail ? 'text-red-700' : 'text-gray-700'
                          } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                        >
                          <XCircle className='inline h-4 w-4 mr-1' />
                          FAIL - Không đạt chất lượng
                        </label>
                      </div>
                    </div>

                    {/* Severity Selection (chỉ hiện khi FAIL) */}
                    {isFail && (
                      <div className='ml-12 p-3 bg-red-50 border border-red-200 rounded-md'>
                        <div className='flex items-center space-x-2'>
                          <Checkbox
                            id={`severity-${task.id}`}
                            checked={hasSeverity}
                            onCheckedChange={(checked) => {
                              updateTaskSeverity(task.id, !!checked)
                            }}
                            disabled={isDisabled}
                            className='data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700'
                          />
                          <label
                            htmlFor={`severity-${task.id}`}
                            className={`text-sm font-medium cursor-pointer ${
                              hasSeverity ? 'text-red-800' : 'text-red-700'
                            } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                          >
                            <AlertTriangle className='inline h-4 w-4 mr-1' />
                            Mức độ nghiêm trọng cao (cần reset Preset Production)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Submit Button */}
        <div className='mt-6 pt-4 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {canSubmit() ? (
                <span className='text-green-600 font-medium'>✓ Đã hoàn thành đánh giá tất cả task. Có thể submit.</span>
              ) : (
                <span>Cần hoàn thành đánh giá {tasks.length - completedTasks} task còn lại để có thể submit.</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || qualityCheckMutation.isPending}
              className={`gap-2 ${
                canSubmit() ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className='h-4 w-4' />
              {qualityCheckMutation.isPending ? 'Đang xử lý...' : 'Submit Quality Check'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
