import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Lock,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  XCircle,
  Package
} from 'lucide-react'
import { MilestoneUI, TaskStatus, QualityCheckStatus } from '@/pages/staff/manage-task/tasks/types'
import { useStaffUpdateTaskStatus, useStaffGetCurrentSequence } from '@/services/staff/staff-task.service'
import { useQualityCheckPostSubmitHandler } from '@/services/staff/quality-check.service'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { QualityCheckTaskManager } from '@/pages/staff/manage-task/components/quality-check-task-manager'
import { QualityCheckFailedManager } from './quality-check-failed-manager'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import ghtkAPI from '@/apis/ghtk.api'
import { GHTKOrder } from '@/@types/ghtk.types'
import { DeliveryOrderSuccessDialog } from '../../components/delivery-order-success-dialog'
import { OrderStatus } from '@/@types/manage-order.types'

// Helper functions for task status display
const getStatusText = (status: TaskStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ'
    case 'IN_PROGRESS':
      return 'Đang thực hiện'
    case 'DONE':
      return 'Hoàn thành'
    case 'CANCELLED':
      return 'Đã hủy'
    case 'PASS':
      return 'Pass'
    case 'FAIL':
      return 'Fail'
    case 'LOCKED':
      return 'Bị khóa'
    default:
      return 'Không xác định'
  }
}

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'DONE':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'PASS':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'FAIL':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'LOCKED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

const getQualityStatusBadge = (status: QualityCheckStatus) => {
  switch (status) {
    case 'PASS':
      return (
        <Badge className='bg-green-100 text-green-800 border-green-200'>
          <ShieldCheck className='w-3 h-3 mr-1' />
          Pass
        </Badge>
      )
    case 'FAIL':
      return (
        <Badge className='bg-red-100 text-red-800 border-red-200'>
          <ShieldX className='w-3 h-3 mr-1' />
          Fail
        </Badge>
      )
  }
}

interface OrderItemMilestoneTrackerProps {
  milestones: MilestoneUI[]
  orderItemId: string
  orderId: string
  orderStatus: OrderStatus
}

interface TaskCompletionDialogProps {
  taskId: string
  taskName: string
  onComplete: (taskId: string, image?: string, note?: string) => void
  isLoading: boolean
}

const TaskCompletionDialog: React.FC<TaskCompletionDialogProps> = ({ taskId, taskName, onComplete, isLoading }) => {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState<string>('')
  const [note, setNote] = useState<string>('')

  const handleSubmit = () => {
    onComplete(taskId, image, note)
    setOpen(false)
    setImage('')
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-2'>
          <CheckCircle2 className='h-4 w-4' />
          Hoàn thành
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Hoàn thành nhiệm vụ</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='bg-muted p-3 rounded-lg'>
            <p className='font-medium'>{taskName}</p>
          </div>

          <div className='space-y-2'>
            <Label>Hình ảnh kết quả (tùy chọn)</Label>
            <CloudinaryImageUpload onChange={(urls) => setImage(urls[0] || '')} maxFiles={1} />
            {image && (
              <div className='mt-2'>
                <img src={image} alt='Kết quả' className='w-full h-32 object-cover rounded' />
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label>Ghi chú (tùy chọn)</Label>
            <Textarea
              placeholder='Nhập ghi chú về kết quả công việc...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Hoàn thành'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const OrderItemMilestoneTracker: React.FC<OrderItemMilestoneTrackerProps> = ({
  milestones,
  orderItemId,
  orderId,
  orderStatus
}) => {
  const updateTaskStatusMutation = useStaffUpdateTaskStatus()
  const { handlePostSubmit } = useQualityCheckPostSubmitHandler()
  const { data: currentSequence, isLoading: isLoadingCurrentSequence } = useStaffGetCurrentSequence(orderItemId)
  const queryClient = useQueryClient()

  // State cho GHTK shipping
  const [isCreatingShipping, setIsCreatingShipping] = useState(false)
  const [shippingOrder, setShippingOrder] = useState<GHTKOrder | null>(null)
  const [showShippingDialog, setShowShippingDialog] = useState(false)

  // Sắp xếp milestones theo thứ tự
  const sortedMilestones = [...milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  // Xử lý sau khi Quality Check submit thành công
  const handleQualityCheckSuccess = async (hasFailures: boolean, hasSeverity: boolean) => {
    try {
      const result = await handlePostSubmit(orderItemId, hasFailures, hasSeverity)

      // Hiển thị toast message
      if (result.action === 'continue_workflow') {
        toast.success('Quality Check hoàn thành thành công!')
      } else if (result.action === 'lock_next_milestones') {
        toast.warning('Quality Check hoàn thành. Các milestone tiếp theo đã bị khóa do có lỗi.')
      } else if (result.action === 'reset_preset_production') {
        toast.error('Quality Check hoàn thành. Preset Production đã được reset do lỗi nghiêm trọng.')
      }

      // Invalidate current sequence để cập nhật trạng thái khóa/mở khóa milestone
      queryClient.invalidateQueries({
        queryKey: ['staff-current-sequence', orderItemId]
      })
    } catch (error) {
      console.error('Error in post-submit handling:', error)
      toast.error('Có lỗi xảy ra sau khi submit Quality Check')
    }
  }

  // Kiểm tra milestone có phải Quality Check không
  const isQualityCheckMilestone = (milestoneName: string) => {
    return milestoneName.toLowerCase().includes('quality') || milestoneName.toLowerCase().includes('kiểm tra')
  }

  // Kiểm tra milestone có phải Quality Check Failed không
  const isQualityCheckFailedMilestone = (milestoneName: string) => {
    return (
      milestoneName.toLowerCase().includes('quality check failed') ||
      milestoneName.toLowerCase().includes('kiểm tra chất lượng thất bại')
    )
  }

  // Kiểm tra milestone có phải Warranty Validation không
  const isWarrantyValidationMilestone = (milestoneName: string) => {
    return (
      milestoneName.toLowerCase().includes('warranty validation') || milestoneName.toLowerCase().includes('bảo hành')
    )
  }

  // Kiểm tra milestone có phải Quality Check Warranty không
  const isQualityCheckWarrantyMilestone = (milestoneName: string) => {
    return (
      milestoneName.toLowerCase().includes('quality check warranty') ||
      milestoneName.toLowerCase().includes('kiểm tra chất lượng bảo hành')
    )
  }

  // Kiểm tra milestone có phải Packing không
  const isPackingMilestone = (milestoneName: string) => {
    const lowerName = milestoneName.toLowerCase()
    return lowerName.includes('packing') || lowerName.includes('đóng gói')
  }

  // Kiểm tra task có phải Create Shipping không
  const isCreateShippingTask = (taskName: string) => {
    const lowerName = taskName.toLowerCase()
    return lowerName.includes('create delivery order') || lowerName.includes('initiate and submit')
  }

  // Kiểm tra milestone có hoàn thành không
  const isMilestoneCompleted = (milestone: MilestoneUI) => {
    const isQualityCheck = isQualityCheckMilestone(milestone.name)
    const isQualityCheckFailed = isQualityCheckFailedMilestone(milestone.name)
    const isWarrantyValidation = isWarrantyValidationMilestone(milestone.name)
    const isQualityCheckWarranty = isQualityCheckWarrantyMilestone(milestone.name)

    if (isQualityCheckFailed) {
      // Quality Check Failed: hoàn thành khi có task DONE
      const failedTask = milestone.maternityDressTasks.find(
        (task) =>
          (task.note && task.note.includes('|')) ||
          (task.status === 'DONE' && task.note && task.note.includes('Đã hoàn thành sửa chữa'))
      )
      return failedTask && failedTask.status === 'DONE'
    } else if (isQualityCheck || isWarrantyValidation || isQualityCheckWarranty) {
      // Quality Check, Warranty Validation và Quality Check Warranty: hoàn thành khi tất cả tasks có status PASS hoặc FAIL
      return milestone.maternityDressTasks.every((task) => task.status === 'PASS' || task.status === 'FAIL')
    } else {
      // Milestone thường: hoàn thành khi tất cả tasks có status DONE, PASS, hoặc FAIL
      return milestone.maternityDressTasks.every(
        (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
      )
    }
  }

  // Kiểm tra milestone có bị khóa không dựa trên current sequence từ API
  const isMilestoneLocked = (milestone: MilestoneUI) => {
    // Nếu đang load current sequence thì tạm thời lock tất cả
    if (isLoadingCurrentSequence || currentSequence === undefined) {
      return true
    }

    // Nếu currentSequence = 0, có nghĩa là tất cả milestone đã hoàn thành 100%
    // => không khóa milestone nào cả
    if (currentSequence === 0) {
      return false
    }
    // Milestone bị khóa nếu sequenceOrder > currentSequence
    return milestone.sequenceOrder > currentSequence
  }

  const handleTaskStatusChange = (taskId: string, status: TaskStatus, image?: string, note?: string) => {
    console.log('handleTaskStatusChange called:', { taskId, status, orderItemId, image, note })
    updateTaskStatusMutation.mutate(
      {
        dressTaskId: taskId,
        orderItemId: orderItemId,
        status,
        image,
        note
      },
      {
        onSuccess: () => {
          // Invalidate current sequence để cập nhật trạng thái khóa/mở khóa milestone
          queryClient.invalidateQueries({
            queryKey: ['staff-current-sequence', orderItemId]
          })
        }
      }
    )
  }

  // Xử lý tạo đơn hàng shipping
  const handleCreateShipping = async (taskId: string) => {
    try {
      setIsCreatingShipping(true)
      const response = await ghtkAPI.createShipping(orderId)

      if (response.data.success) {
        setShippingOrder(response.data.order)
        setShowShippingDialog(true)

        // Tự động cập nhật task status thành DONE sau khi tạo shipping thành công
        updateTaskStatusMutation.mutate(
          {
            dressTaskId: taskId,
            orderItemId: orderItemId,
            status: 'DONE',
            note: `Đã tạo đơn giao hàng GHTK - Tracking ID: ${response.data.order.trackingId}`
          },
          {
            onSuccess: () => {
              // Invalidate current sequence để cập nhật trạng thái khóa/mở khóa milestone
              queryClient.invalidateQueries({
                queryKey: ['staff-current-sequence', orderItemId]
              })
            }
          }
        )

        toast.success('Tạo đơn giao hàng thành công!')
      } else {
        toast.error(response.data.message || 'Không thể tạo đơn giao hàng')
      }
    } catch (error) {
      console.error('Error creating shipping:', error)
      toast.error('Có lỗi xảy ra khi tạo đơn giao hàng')
    } finally {
      setIsCreatingShipping(false)
    }
  }

  // Cập nhật getMilestoneStatus để sử dụng logic currentSequence
  const getMilestoneStatus = (milestone: MilestoneUI) => {
    const isQualityCheckFailed = isQualityCheckFailedMilestone(milestone.name)

    // Kiểm tra milestone có hoàn thành không
    const isCompleted = isMilestoneCompleted(milestone)

    // Quality Check Failed có logic riêng, không theo sequential
    if (isQualityCheckFailed) {
      const failedTask = milestone.maternityDressTasks.find(
        (task) =>
          (task.note && task.note.includes('|')) ||
          (task.status === 'DONE' && task.note && task.note.includes('Đã hoàn thành sửa chữa'))
      )

      if (isCompleted) {
        return { status: 'completed', label: 'Hoàn thành', variant: 'default' as const }
      } else if (failedTask && failedTask.status === 'IN_PROGRESS') {
        return { status: 'in-progress', label: 'Đang thực hiện', variant: 'secondary' as const }
      } else if (failedTask && failedTask.note && failedTask.note.includes('|')) {
        // Quality Check Failed với failed tasks luôn active
        return { status: 'active', label: 'Sẵn sàng', variant: 'outline' as const }
      } else {
        return { status: 'locked', label: 'Bị khóa', variant: 'secondary' as const }
      }
    }

    // Sử dụng logic mới để kiểm tra milestone có bị khóa không
    const isLockedBySequence = isMilestoneLocked(milestone)
    // Khóa milestone hiện tại nếu đang chờ khách thanh toán phần còn lại
    const paymentLocked =
      orderStatus === OrderStatus.AWAITING_PAID_REST &&
      typeof currentSequence === 'number' &&
      milestone.sequenceOrder === currentSequence

    const resolvedLocked = isLockedBySequence || paymentLocked

    // Bỏ sequential locking vì đã được xử lý trong logic currentSequence
    const hasInProgress = milestone.maternityDressTasks.some((task) => task.status === 'IN_PROGRESS')

    if (resolvedLocked) {
      return { status: 'locked', label: 'Bị khóa', variant: 'secondary' as const }
    } else if (isCompleted) {
      return { status: 'completed', label: 'Hoàn thành', variant: 'default' as const }
    } else if (hasInProgress) {
      return { status: 'in-progress', label: 'Đang thực hiện', variant: 'secondary' as const }
    } else {
      return { status: 'active', label: 'Sẵn sàng', variant: 'outline' as const }
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            Quy trình thực hiện ({sortedMilestones.length} giai đoạn)
            {!isLoadingCurrentSequence && currentSequence !== undefined && (
              <span className='text-sm font-normal text-muted-foreground ml-2'>
                • {currentSequence === 0 ? 'Tất cả giai đoạn đã hoàn thành' : `Giai đoạn hiện tại: ${currentSequence}`}
              </span>
            )}
            {isLoadingCurrentSequence && (
              <span className='text-sm font-normal text-muted-foreground ml-2'>• Đang tải...</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {sortedMilestones.map((milestone, milestoneIndex) => {
              const milestoneStatus = getMilestoneStatus(milestone)
              const isLocked = milestoneStatus.status === 'locked'
              const isCompleted = milestoneStatus.status === 'completed'
              const isQualityCheck = isQualityCheckMilestone(milestone.name)
              const isWarrantyValidation = isWarrantyValidationMilestone(milestone.name)
              const isQualityCheckWarranty = isQualityCheckWarrantyMilestone(milestone.name)
              const isQualityCheckFailed = isQualityCheckFailedMilestone(milestone.name)

              // Khóa milestone tiếp theo nếu đang chờ khách thanh toán phần còn lại
              const isPaymentLocked =
                orderStatus === OrderStatus.AWAITING_PAID_REST &&
                typeof currentSequence === 'number' &&
                milestone.sequenceOrder === currentSequence

              const completedTasks = milestone.maternityDressTasks.filter(
                (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
              ).length
              const totalTasks = milestone.maternityDressTasks.length
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

              // Xử lý Quality Check Failed milestone
              if (isQualityCheckFailed) {
                // Tìm task có note chứa danh sách failed tasks hoặc task đã hoàn thành
                const failedTask = milestone.maternityDressTasks.find(
                  (task) =>
                    (task.note && task.note.includes('|')) ||
                    (task.status === 'DONE' && task.note && task.note.includes('Đã hoàn thành sửa chữa'))
                )

                // Nếu đã hoàn thành Quality Check Failed (status DONE)
                if (failedTask && failedTask.status === 'DONE') {
                  return (
                    <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                      {/* Connector line */}
                      {milestoneIndex < sortedMilestones.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-green-300' />
                      )}

                      <Card className='overflow-hidden border-green-200 bg-green-50'>
                        <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50'>
                          <CardTitle className='flex items-center gap-2 text-green-800'>
                            <ShieldCheck className='h-5 w-5' />
                            {milestone.sequenceOrder}. Quality Check Failed - Đã hoàn thành sửa chữa
                          </CardTitle>
                          <div className='flex items-center gap-2'>
                            <Badge className='bg-green-100 text-green-800 border-green-200'>
                              <CheckCircle2 className='h-3 w-3 mr-1' />
                              DONE - Đã sửa chữa hoàn thành
                            </Badge>
                          </div>
                          <p className='text-sm text-green-700'>{milestone.description}</p>
                          <Progress value={100} className='w-full' />
                        </CardHeader>

                        <CardContent className='p-6'>
                          {/* Task Info */}
                          <div className='bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4'>
                            <div className='flex items-start gap-3'>
                              <Badge variant='outline' className='text-xs font-mono mt-1'>
                                #{failedTask.sequenceOrder}
                              </Badge>
                              <div className='flex-1'>
                                <h4 className='font-medium text-gray-900'>{failedTask.name}</h4>
                                {failedTask.description && (
                                  <p className='text-sm text-gray-600 mt-1'>{failedTask.description}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Completed Tasks List */}
                          <div className='bg-green-100 p-4 rounded-lg border border-green-200'>
                            <div className='flex items-center gap-2 mb-3'>
                              <CheckCircle2 className='h-4 w-4 text-green-600' />
                              <span className='text-sm font-medium text-green-800'>
                                Đã hoàn thành sửa chữa tất cả vấn đề
                              </span>
                            </div>

                            {/* Hiển thị note với danh sách đã hoàn thành */}
                            {failedTask.note && (
                              <div className='space-y-2'>
                                <p className='text-xs font-medium text-green-700'>Chi tiết sửa chữa:</p>
                                <div className='bg-white/70 rounded-md p-3 border border-green-100'>
                                  <p className='text-sm text-gray-700 leading-relaxed'>{failedTask.note}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                }

                // Nếu chưa hoàn thành Quality Check Failed - chỉ hiển thị form khi có note với "|" và không bị khóa
                if (
                  failedTask &&
                  failedTask.status !== 'DONE' &&
                  failedTask.note &&
                  failedTask.note.includes('|') &&
                  !isLocked
                ) {
                  return (
                    <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                      {/* Connector line */}
                      {milestoneIndex < sortedMilestones.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-muted' />
                      )}

                      <QualityCheckFailedManager
                        task={{
                          id: failedTask.id,
                          name: failedTask.name,
                          description: failedTask.description,
                          sequenceOrder: failedTask.sequenceOrder,
                          note: failedTask.note || ''
                        }}
                        orderItemId={orderItemId}
                        onSubmitSuccess={() => {
                          // Invalidate queries thay vì reload
                          queryClient.invalidateQueries({
                            queryKey: ['staff-order-task', orderItemId]
                          })
                          queryClient.refetchQueries({
                            queryKey: ['staff-order-task', orderItemId]
                          })
                          // Invalidate current sequence để cập nhật trạng thái khóa/mở khóa milestone
                          queryClient.invalidateQueries({
                            queryKey: ['staff-current-sequence', orderItemId]
                          })
                        }}
                        isDisabled={updateTaskStatusMutation.isPending}
                      />
                    </div>
                  )
                }

                // Nếu Quality Check Failed bị khóa
                if (isLocked && failedTask) {
                  return (
                    <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                      {/* Connector line */}
                      {milestoneIndex < sortedMilestones.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-muted' />
                      )}

                      <Card className='overflow-hidden border-yellow-200 bg-yellow-50'>
                        <CardHeader className='bg-gradient-to-r from-yellow-50 to-amber-50'>
                          <CardTitle className='flex items-center gap-2 text-yellow-800'>
                            <Lock className='h-5 w-5' />
                            {milestone.sequenceOrder}. Quality Check Failed - Bị khóa
                          </CardTitle>
                          <Badge variant='secondary' className='w-fit'>
                            {milestoneStatus.label}
                          </Badge>
                          <p className='text-sm text-yellow-700'>{milestone.description}</p>
                          <p className='text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-2'>
                            ⚠️ Cần hoàn thành milestone trước để mở khóa.
                          </p>
                        </CardHeader>
                      </Card>
                    </div>
                  )
                }

                // Nếu không có failed task hoặc đã xử lý xong thì skip milestone này
                return null
              }

              // Xử lý các loại milestone có logic Quality Check (Quality Check, Warranty Validation, Quality Check Warranty)
              if ((isQualityCheck || isWarrantyValidation || isQualityCheckWarranty) && !isQualityCheckFailed) {
                // Nếu milestone bị khóa
                if (isLocked) {
                  return (
                    <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                      {/* Connector line */}
                      {milestoneIndex < sortedMilestones.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-muted' />
                      )}

                      <Card className='overflow-hidden border-yellow-200 bg-yellow-50'>
                        <CardHeader className='bg-gradient-to-r from-yellow-50 to-amber-50'>
                          <CardTitle className='flex items-center gap-2 text-yellow-800'>
                            <Lock className='h-5 w-5' />
                            {milestone.sequenceOrder}. {milestone.name} - Bị khóa
                          </CardTitle>
                          <Badge variant='secondary' className='w-fit'>
                            {milestoneStatus.label}
                          </Badge>
                          <p className='text-sm text-yellow-700'>{milestone.description}</p>
                          <p className='text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-2'>
                            {isPaymentLocked
                              ? 'Chờ khách hàng thanh toán số tiền còn lại'
                              : '⚠️ Cần hoàn thành milestone trước để mở khóa.'}
                          </p>
                        </CardHeader>
                      </Card>
                    </div>
                  )
                }

                // Kiểm tra xem milestone đã hoàn thành chưa
                const isTasksDone = milestone.maternityDressTasks.every(
                  (t) => t.status === 'PASS' || t.status === 'FAIL'
                )

                // Nếu đã hoàn thành, hiển thị readonly view
                if (isTasksDone) {
                  const passedTasks = milestone.maternityDressTasks.filter((t) => t.status === 'PASS').length
                  const failedTasks = milestone.maternityDressTasks.filter((t) => t.status === 'FAIL').length
                  const severityTasks = milestone.maternityDressTasks.filter(
                    (t) => t.status === 'FAIL' && t.severity
                  ).length

                  return (
                    <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                      {/* Connector line */}
                      {milestoneIndex < sortedMilestones.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-green-300' />
                      )}

                      <Card className='overflow-hidden border-green-200 bg-green-50'>
                        <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50'>
                          <CardTitle className='flex items-center gap-2 text-green-800'>
                            <ShieldCheck className='h-5 w-5' />
                            {milestone.sequenceOrder}. {milestone.name} - Đã hoàn thành
                          </CardTitle>
                          <div className='flex items-center gap-4 text-sm flex-wrap'>
                            <Badge className='bg-green-100 text-green-800 border-green-200'>
                              <CheckCircle2 className='h-3 w-3 mr-1' />
                              {passedTasks} PASS
                            </Badge>
                            {failedTasks > 0 && (
                              <Badge className='bg-red-100 text-red-800 border-red-200'>
                                <ShieldX className='h-3 w-3 mr-1' />
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
                          <Progress value={100} className='w-full' />
                          {milestone.description && <p className='text-sm text-green-700'>{milestone.description}</p>}
                        </CardHeader>

                        <CardContent className='p-6'>
                          <div className='space-y-4'>
                            {milestone.maternityDressTasks
                              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                              .map((taskItem) => {
                                const isPass = taskItem.status === 'PASS'
                                const isFail = taskItem.status === 'FAIL'
                                const hasSeverity = taskItem.severity || false

                                return (
                                  <div
                                    key={taskItem.id}
                                    className={`p-4 border rounded-lg ${
                                      isPass
                                        ? 'border-green-200 bg-green-50'
                                        : isFail
                                          ? hasSeverity
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-orange-200 bg-orange-50'
                                          : 'border-gray-200'
                                    }`}
                                  >
                                    <div className='space-y-3'>
                                      {/* Task Info */}
                                      <div className='flex items-start gap-3'>
                                        <Badge variant='outline' className='text-xs font-mono mt-1'>
                                          #{taskItem.sequenceOrder}
                                        </Badge>
                                        <div className='flex-1'>
                                          <h4 className='font-medium text-gray-900'>{taskItem.name}</h4>
                                          {taskItem.description && (
                                            <p className='text-sm text-gray-600 mt-1'>{taskItem.description}</p>
                                          )}
                                        </div>
                                        <Badge
                                          className={
                                            isPass
                                              ? 'bg-green-100 text-green-800 border-green-200'
                                              : 'bg-red-100 text-red-800 border-red-200'
                                          }
                                        >
                                          {taskItem.status}
                                        </Badge>
                                      </div>

                                      {/* Status Display */}
                                      <div className='flex items-center gap-6 ml-12'>
                                        <div
                                          className={`flex items-center space-x-2 ${
                                            isPass ? 'text-green-700' : 'text-gray-500'
                                          }`}
                                        >
                                          <CheckCircle2
                                            className={`h-4 w-4 ${isPass ? 'text-green-600' : 'text-gray-400'}`}
                                          />
                                          <span className='text-sm font-medium'>PASS - Đạt chất lượng</span>
                                          {isPass && <Badge className='bg-green-600 text-white text-xs'>✓</Badge>}
                                        </div>

                                        <div
                                          className={`flex items-center space-x-2 ${
                                            isFail ? 'text-red-700' : 'text-gray-500'
                                          }`}
                                        >
                                          <XCircle className={`h-4 w-4 ${isFail ? 'text-red-600' : 'text-gray-400'}`} />
                                          <span className='text-sm font-medium'>FAIL - Không đạt chất lượng</span>
                                          {isFail && <Badge className='bg-red-600 text-white text-xs'>✓</Badge>}
                                        </div>
                                      </div>

                                      {/* Severity Display (chỉ hiện khi FAIL) */}
                                      {isFail && (
                                        <div className='ml-12 p-3 bg-red-50 border border-red-200 rounded-md'>
                                          <div
                                            className={`flex items-center space-x-2 ${
                                              hasSeverity ? 'text-red-800' : 'text-red-600'
                                            }`}
                                          >
                                            <AlertTriangle
                                              className={`h-4 w-4 ${hasSeverity ? 'text-red-700' : 'text-gray-400'}`}
                                            />
                                            <span className='text-sm font-medium'>
                                              Mức độ nghiêm trọng cao (cần reset Preset Production)
                                            </span>
                                            {hasSeverity && <Badge className='bg-red-700 text-white text-xs'>✓</Badge>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                }

                // Nếu chưa hoàn thành, hiển thị QualityCheckTaskManager
                const qualityCheckTasks = milestone.maternityDressTasks.map((task) => ({
                  id: task.id,
                  name: task.name,
                  description: task.description,
                  sequenceOrder: task.sequenceOrder
                }))

                return (
                  <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                    {/* Connector line */}
                    {milestoneIndex < sortedMilestones.length - 1 && (
                      <div className='absolute left-6 top-12 w-0.5 h-16 bg-muted' />
                    )}

                    <QualityCheckTaskManager
                      tasks={qualityCheckTasks}
                      orderItemId={orderItemId}
                      onSubmitSuccess={handleQualityCheckSuccess}
                      isDisabled={updateTaskStatusMutation.isPending}
                      milestoneName={milestone.name}
                    />
                  </div>
                )
              }

              // Render milestone thường
              return (
                <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                  {/* Connector line */}
                  {milestoneIndex < sortedMilestones.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-16 ${isCompleted ? 'bg-green-300' : 'bg-muted'}`} />
                  )}

                  <div
                    className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
                      isLocked
                        ? 'bg-yellow-50/50 border-yellow-200 shadow-sm'
                        : isCompleted
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md'
                          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {/* Decorative accent line */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : isLocked
                            ? 'bg-yellow-300'
                            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                      }`}
                    />

                    <div className='p-6'>
                      <div className='flex items-start gap-4'>
                        {/* Enhanced Status Icon */}
                        <div
                          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-4 ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-green-100'
                              : isLocked
                                ? 'bg-yellow-300 text-yellow-800 ring-yellow-100'
                                : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white ring-blue-100'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className='h-7 w-7' />
                          ) : isLocked ? (
                            <Lock className='h-7 w-7' />
                          ) : (
                            <span className='font-bold text-lg'>{milestone.sequenceOrder}</span>
                          )}
                        </div>

                        <div className='flex-1'>
                          <div className='flex items-center justify-between mb-3'>
                            <div>
                              <h3
                                className={`font-bold text-xl mb-1 ${
                                  isCompleted ? 'text-green-700' : isLocked ? 'text-yellow-800' : 'text-blue-700'
                                }`}
                              >
                                {milestone.name}
                                {isLocked && (
                                  <Badge variant='secondary' className='ml-2'>
                                    {milestoneStatus.label}
                                  </Badge>
                                )}
                              </h3>
                              <p className='text-gray-600 leading-relaxed'>{milestone.description}</p>
                              {isLocked && (
                                <p className='text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-2'>
                                  {isPaymentLocked
                                    ? 'Chờ khách hàng thanh toán số tiền còn lại'
                                    : `⚠️ ${
                                        milestoneStatus.label.includes('Quality Check')
                                          ? 'Milestone này bị khóa do Quality Check có lỗi không nghiêm trọng. Chờ admin assign người khác xử lý.'
                                          : 'Cần hoàn thành milestone trước để mở khóa.'
                                      }`}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={milestoneStatus.variant}
                              className={`px-3 py-1 text-sm font-medium ${
                                isCompleted
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : isLocked
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {milestoneStatus.label}
                            </Badge>
                          </div>

                          {/* Enhanced Progress bar */}
                          <div className='mb-6'>
                            <div className='flex justify-between items-center text-sm mb-2'>
                              <span className='font-medium text-gray-700'>Tiến độ thực hiện</span>
                              <span
                                className={`font-bold px-2 py-1 rounded-md text-xs ${
                                  progress === 100
                                    ? 'bg-green-100 text-green-700'
                                    : progress > 0
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {completedTasks}/{totalTasks} nhiệm vụ
                              </span>
                            </div>
                            <div className='relative'>
                              <Progress
                                value={progress}
                                className={`h-3 ${
                                  isCompleted
                                    ? '[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-green-600'
                                    : 'hover:scale-105 transition-transform duration-200'
                                }`}
                              />
                              {progress === 100 && (
                                <div className='absolute inset-0 flex items-center justify-center'>
                                  <CheckCircle2 className='h-4 w-4 text-white drop-shadow-md' />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tasks */}
                          {!isLocked && (
                            <div className='space-y-3'>
                              {milestone.maternityDressTasks
                                .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                                .map((task) => {
                                  const taskStatus = task.status
                                  const canStart = !isLocked

                                  return (
                                    <div
                                      key={task.id}
                                      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
                                        taskStatus === 'DONE' || taskStatus === 'PASS' || taskStatus === 'FAIL'
                                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm'
                                          : taskStatus === 'IN_PROGRESS'
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                      }`}
                                    >
                                      {/* Status indicator line */}
                                      <div
                                        className={`absolute top-0 left-0 right-0 h-0.5 ${
                                          taskStatus === 'DONE' || taskStatus === 'PASS' || taskStatus === 'FAIL'
                                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                            : taskStatus === 'IN_PROGRESS'
                                              ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                                              : 'bg-gray-300'
                                        }`}
                                      />

                                      <div className='p-4'>
                                        <div className='flex flex-col space-y-3'>
                                          <div className='flex items-center gap-3'>
                                            <div
                                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                                                taskStatus === 'DONE' || taskStatus === 'PASS' || taskStatus === 'FAIL'
                                                  ? 'bg-green-100 text-green-600'
                                                  : taskStatus === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-500'
                                              }`}
                                            >
                                              {taskStatus === 'DONE' ||
                                              taskStatus === 'PASS' ||
                                              taskStatus === 'FAIL' ? (
                                                <CheckCircle2 className='h-4 w-4' />
                                              ) : taskStatus === 'IN_PROGRESS' ? (
                                                <Clock className='h-4 w-4' />
                                              ) : (
                                                <div className='h-3 w-3 rounded-full border-2 border-current' />
                                              )}
                                            </div>
                                            <div className='flex-1'>
                                              <h4 className='font-semibold text-gray-900'>{task.name}</h4>
                                              <p className='text-sm text-gray-600 mt-0.5'>Bước #{task.sequenceOrder}</p>
                                            </div>
                                            <Badge
                                              variant='outline'
                                              className={`text-xs font-medium ${getStatusColor(taskStatus)}`}
                                            >
                                              {getStatusText(taskStatus)}
                                            </Badge>
                                          </div>

                                          {task.description && (
                                            <p className='text-sm text-gray-600 pl-11'>{task.description}</p>
                                          )}

                                          {/* Show image and note if completed */}
                                          {(taskStatus === 'DONE' || taskStatus === 'PASS' || taskStatus === 'FAIL') &&
                                            (task.image || task.note) && (
                                              <div className='ml-11 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200'>
                                                <div className='flex items-center gap-2 mb-3'>
                                                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                                                  <span className='text-sm font-medium text-green-800'>
                                                    Kết quả hoàn thành
                                                  </span>
                                                </div>

                                                <div className='space-y-3'>
                                                  {task.image && (
                                                    <div className='space-y-2'>
                                                      <p className='text-xs font-medium text-green-700'>
                                                        Hình ảnh kết quả:
                                                      </p>
                                                      <div className='relative group'>
                                                        <img
                                                          src={task.image}
                                                          alt='Kết quả công việc'
                                                          className='w-full max-w-xs h-32 object-cover rounded-lg shadow-sm border border-green-200 transition-transform group-hover:scale-105'
                                                        />
                                                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg' />
                                                      </div>
                                                    </div>
                                                  )}

                                                  {task.note && (
                                                    <div className='space-y-2'>
                                                      <p className='text-xs font-medium text-green-700'>Ghi chú:</p>
                                                      <div className='bg-white/70 rounded-md p-3 border border-green-100'>
                                                        <p className='text-sm text-gray-700 leading-relaxed'>
                                                          {task.note}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {/* Action buttons cho Quality Check tasks hiển thị kết quả */}
                                          {(taskStatus === 'PASS' || taskStatus === 'FAIL') && (
                                            <div className='ml-11 p-3 bg-gray-50 border border-gray-200 rounded-md'>
                                              <div className='flex items-center gap-2'>
                                                <span className='text-sm text-muted-foreground'>
                                                  Kết quả Quality Check:
                                                </span>
                                                {getQualityStatusBadge(taskStatus as QualityCheckStatus)}
                                              </div>
                                            </div>
                                          )}

                                          <div className='flex gap-2 pl-11'>
                                            {taskStatus === 'PENDING' && canStart && (
                                              <>
                                                {/* Logic cho task Create Shipping trong Waiting For Delivery */}
                                                {isCreateShippingTask(task.name) ? (
                                                  <Button
                                                    size='sm'
                                                    variant='default'
                                                    onClick={() => handleCreateShipping(task.id)}
                                                    disabled={isCreatingShipping}
                                                    className='gap-2 bg-blue-600 hover:bg-blue-700'
                                                  >
                                                    <Package className='h-4 w-4' />
                                                    {isCreatingShipping ? 'Đang tạo...' : 'Tạo đơn giao hàng'}
                                                  </Button>
                                                ) : isPackingMilestone(milestone.name) ? (
                                                  /* Logic cho Packing milestone - cho phép DONE trực tiếp */
                                                  <TaskCompletionDialog
                                                    taskId={task.id}
                                                    taskName={task.name}
                                                    onComplete={(taskId, image, note) =>
                                                      handleTaskStatusChange(taskId, 'DONE', image, note)
                                                    }
                                                    isLoading={updateTaskStatusMutation.isPending}
                                                  />
                                                ) : (
                                                  /* Logic thông thường cho các milestone khác */
                                                  <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={() => handleTaskStatusChange(task.id, 'IN_PROGRESS')}
                                                    disabled={updateTaskStatusMutation.isPending}
                                                    className='gap-2'
                                                  >
                                                    <Play className='h-4 w-4' />
                                                    Bắt đầu
                                                  </Button>
                                                )}
                                              </>
                                            )}

                                            {taskStatus === 'IN_PROGRESS' && (
                                              <>
                                                {/* Chỉ cho phép tạm dừng với milestone thường (không phải Packing) */}
                                                {!isPackingMilestone(milestone.name) && (
                                                  <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={() => handleTaskStatusChange(task.id, 'PENDING')}
                                                    disabled={updateTaskStatusMutation.isPending}
                                                    className='gap-2'
                                                  >
                                                    <Pause className='h-4 w-4' />
                                                    Tạm dừng
                                                  </Button>
                                                )}

                                                {/* Nút Hoàn thành cho milestone thường và Packing */}
                                                {!isQualityCheck && (
                                                  <TaskCompletionDialog
                                                    taskId={task.id}
                                                    taskName={task.name}
                                                    onComplete={(taskId, image, note) =>
                                                      handleTaskStatusChange(taskId, 'DONE', image, note)
                                                    }
                                                    isLoading={updateTaskStatusMutation.isPending}
                                                  />
                                                )}
                                              </>
                                            )}

                                            {(taskStatus === 'DONE' ||
                                              taskStatus === 'PASS' ||
                                              taskStatus === 'FAIL') && (
                                              <Badge variant='default' className='gap-1'>
                                                <CheckCircle2 className='h-3 w-3' />
                                                Đã xong
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          )}

                          {isLocked && (
                            <div className='text-center py-4 text-muted-foreground'>
                              <Lock className='h-8 w-8 mx-auto mb-2 opacity-50' />
                              <p className='text-sm'>Cần hoàn thành milestone trước để mở khóa</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog hiển thị thông tin đơn hàng shipping thành công */}
      <DeliveryOrderSuccessDialog
        open={showShippingDialog}
        onOpenChange={setShowShippingDialog}
        order={shippingOrder}
        message='Đơn giao hàng đã được tạo và gửi đến GHTK thành công!'
      />
    </div>
  )
}
