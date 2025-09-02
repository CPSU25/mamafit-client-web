// components/quality-check-failed-manager.tsx
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useStaffUpdateTaskStatus } from '@/services/staff/staff-task.service'

interface QualityCheckFailedTask {
  id: string
  name: string
  description?: string
  sequenceOrder: number
  note: string // Note chứa các failed tasks được nối bằng "|"
  deadline?: string
}

interface QualityCheckFailedSubTask {
  id: string // Generated unique ID
  name: string // Task name từ note
  isCompleted: boolean
}

interface QualityCheckFailedManagerProps {
  task: QualityCheckFailedTask
  orderItemId: string
  onSubmitSuccess: () => void
  isDisabled?: boolean
}

export const QualityCheckFailedManager: React.FC<QualityCheckFailedManagerProps> = ({
  task,
  orderItemId,
  onSubmitSuccess,
  isDisabled = false
}) => {
  const [subTasks, setSubTasks] = useState<QualityCheckFailedSubTask[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const updateTaskStatusMutation = useStaffUpdateTaskStatus()
  const [minuteTick, setMinuteTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setMinuteTick((t) => (t + 1) % 60000), 60_000)
    return () => clearInterval(id)
  }, [])

  // Parse note để tạo sub-tasks
  useEffect(() => {
    if (task.note) {
      const taskNames = task.note.split('|').filter((name) => name.trim())
      const parsedSubTasks: QualityCheckFailedSubTask[] = taskNames.map((name, index) => ({
        id: `${task.id}-subtask-${index}`,
        name: name.trim(),
        isCompleted: false
      }))
      setSubTasks(parsedSubTasks)
    }
  }, [task.note, task.id])

  // Cập nhật trạng thái sub-task
  const updateSubTaskStatus = (subTaskId: string, isCompleted: boolean) => {
    setSubTasks((prev) => prev.map((subTask) => (subTask.id === subTaskId ? { ...subTask, isCompleted } : subTask)))
  }

  // Kiểm tra có thể submit không (tất cả sub-tasks đều PASS)
  const canSubmit = () => {
    return subTasks.length > 0 && subTasks.every((subTask) => subTask.isCompleted) && !isDisabled
  }

  // Xử lý submit - chỉ có thể PASS
  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error('Vui lòng hoàn thành tất cả các nhiệm vụ sửa chữa')
      return
    }

    setShowConfirmDialog(true)
  }

  // Xác nhận submit
  const handleConfirmSubmit = async () => {
    try {
      // Update task status thành DONE với note mới
      const completedNote = `Đã hoàn thành sửa chữa: ${subTasks.map((st) => st.name).join(', ')}`

      await updateTaskStatusMutation.mutateAsync({
        dressTaskId: task.id,
        orderItemId,
        status: 'DONE',
        note: completedNote
      })

      toast.success('Hoàn thành Quality Check Failed! Tất cả vấn đề đã được sửa chữa.')
      setShowConfirmDialog(false)
      onSubmitSuccess()
    } catch (error) {
      console.error('Error completing Quality Check Failed:', error)
      toast.error('Có lỗi xảy ra khi hoàn thành Quality Check Failed')
    }
  }

  // Tính toán thống kê
  const completedSubTasks = subTasks.filter((subTask) => subTask.isCompleted).length
  const totalSubTasks = subTasks.length

  if (totalSubTasks === 0) {
    return (
      <Card className='overflow-hidden border-orange-200 py-0'>
        <CardHeader className='bg-gradient-to-r from-orange-50 to-amber-50 p-5'>
          <CardTitle className='flex items-center gap-2 text-orange-800'>
            <RefreshCw className='h-5 w-5' />
            Quality Check Failed - Không có nhiệm vụ sửa chữa
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <p className='text-muted-foreground'>Không tìm thấy danh sách nhiệm vụ cần sửa chữa.</p>
        </CardContent>
      </Card>
    )
  }

  // Deadline tổng (nếu task QC Failed có deadline riêng)
  void minuteTick
  const headerDeadline = task.deadline ? (
    <Badge className='bg-violet-600 text-white ml-2'>
      {(() => {
        const d = dayjs(task.deadline!)
        const diff = d.diff(dayjs(), 'minute')
        const abs = Math.abs(diff)
        const h = Math.floor(abs / 60)
        const m = abs % 60
        const label = h > 0 ? `${h}h ${m}m` : `${m}m`
        return `${diff < 0 ? 'Quá hạn' : 'Còn'} ${label} • ${d.format('HH:mm DD/MM')}`
      })()}
    </Badge>
  ) : null

  return (
    <Card className='overflow-hidden border-orange-200 py-0'>
      <CardHeader className='bg-gradient-to-r from-orange-50 to-amber-50 p-5'>
        <CardTitle className='flex items-center gap-2 text-orange-800'>
          <RefreshCw className='h-5 w-5' />
          Quality Check Failed - Sửa chữa các vấn đề
          {headerDeadline}
        </CardTitle>
        <div className='flex items-center gap-4 text-sm flex-wrap'>
          <Badge variant='outline' className='border-orange-200'>
            {completedSubTasks}/{totalSubTasks} nhiệm vụ đã hoàn thành
          </Badge>
          {completedSubTasks > 0 && (
            <Badge className='bg-green-100 text-green-800 border-green-200'>
              <CheckCircle2 className='h-3 w-3 mr-1' />
              {completedSubTasks} đã sửa
            </Badge>
          )}
        </div>
        <p className='text-sm text-orange-700 mt-2'>
          Hoàn thành tất cả các nhiệm vụ sửa chữa dưới đây để tiếp tục quy trình sản xuất.
        </p>
      </CardHeader>

      <CardContent className='p-6'>
        <div className='space-y-4'>
          {/* Task Info */}
          <div className='bg-amber-50 p-4 rounded-lg border border-amber-200'>
            <div className='flex items-start gap-3'>
              <Badge variant='outline' className='text-xs font-mono mt-1'>
                #{task.sequenceOrder}
              </Badge>
              <div className='flex-1'>
                <h4 className='font-medium text-gray-900'>{task.name}</h4>
                {task.description && <p className='text-sm text-gray-600 mt-1'>{task.description}</p>}
              </div>
            </div>
          </div>

          {/* Sub-tasks từ note */}
          <div className='space-y-3'>
            <h5 className='font-medium text-gray-900'>Danh sách nhiệm vụ cần sửa chữa:</h5>

            {subTasks.map((subTask) => (
              <div
                key={subTask.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  subTask.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className='flex items-center gap-3'>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id={`subtask-${subTask.id}`}
                      checked={subTask.isCompleted}
                      onCheckedChange={(checked) => {
                        updateSubTaskStatus(subTask.id, !!checked)
                      }}
                      disabled={isDisabled}
                      className='data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
                    />
                    <label
                      htmlFor={`subtask-${subTask.id}`}
                      className={`text-sm font-medium cursor-pointer ${
                        subTask.isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                      } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle2 className='inline h-4 w-4 mr-1' />
                      {subTask.name}
                    </label>
                  </div>

                  {subTask.isCompleted && <Badge className='bg-green-600 text-white text-xs ml-auto'>Đã sửa ✓</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className='mt-6 pt-4 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {canSubmit() ? (
                <span className='text-green-600 font-medium'>
                  ✓ Đã hoàn thành tất cả nhiệm vụ sửa chữa. Có thể submit.
                </span>
              ) : (
                <span>Cần hoàn thành {totalSubTasks - completedSubTasks} nhiệm vụ còn lại để có thể submit.</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || updateTaskStatusMutation.isPending}
              className={`gap-2 ${canSubmit() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              <ShieldCheck className='h-4 w-4' />
              {updateTaskStatusMutation.isPending ? 'Đang xử lý...' : 'Hoàn thành sửa chữa'}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-orange-600'>
              <AlertCircle className='h-5 w-5' />
              Xác nhận hoàn thành sửa chữa
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hoàn thành tất cả các nhiệm vụ sửa chữa không?
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0' />
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-orange-800'>
                    ⚠️ Trách nhiệm và cam kết
                  </p>
                  <ul className='text-xs text-orange-700 space-y-1'>
                    <li>• Tôi đã kiểm tra kỹ tất cả các vấn đề đã được sửa chữa</li>
                    <li>• Tôi chịu trách nhiệm về chất lượng sản phẩm sau khi sửa chữa</li>
                    <li>• Tôi cam kết rằng sản phẩm đã đạt tiêu chuẩn chất lượng</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='bg-gray-50 rounded-lg p-3'>
              <p className='text-sm font-medium text-gray-800 mb-2'>Các nhiệm vụ đã hoàn thành:</p>
              <ul className='text-xs text-gray-600 space-y-1'>
                {subTasks.map((subTask) => (
                  <li key={subTask.id} className='flex items-center gap-2'>
                    <CheckCircle2 className='h-3 w-3 text-green-600' />
                    {subTask.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setShowConfirmDialog(false)}
              disabled={updateTaskStatusMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={updateTaskStatusMutation.isPending}
              className='bg-orange-600 hover:bg-orange-700 text-white'
            >
              {updateTaskStatusMutation.isPending ? (
                <>
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <ShieldCheck className='h-4 w-4 mr-2' />
                  Xác nhận hoàn thành
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
