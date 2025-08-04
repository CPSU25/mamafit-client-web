import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  ShieldX,
  Play,
  Pause,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { TaskStatus, QualityCheckStatus } from '@/pages/staff/manage-task/tasks/types'
import { useStaffGetOrderTaskByOrderItemId } from '@/services/staff/staff-task.service'

interface TaskDetailDialogProps {
  orderItemId: string | null // Thay đổi từ task object sang orderItemId
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskStatusChange: (
    taskId: string,
    status: TaskStatus,
    orderItemId?: string,
    options?: {
      image?: string
      note?: string
    }
  ) => void
  isUpdating?: boolean
}

export function TaskDetailDialog({
  orderItemId,
  open,
  onOpenChange,
  onTaskStatusChange,
  isUpdating = false
}: TaskDetailDialogProps) {
  // Fetch fresh data từ React Query cho orderItem này
  const { data: task, isLoading, isError } = useStaffGetOrderTaskByOrderItemId(orderItemId || '')

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center space-y-2'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='text-muted-foreground'>Đang tải chi tiết...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (isError || !task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center space-y-2'>
              <p className='text-red-500'>Không thể tải chi tiết công việc</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const totalTasks = task.milestones.reduce((sum, milestone) => sum + milestone.maternityDressTasks.length, 0)
  const completedTasks = task.milestones.reduce(
    (sum, milestone) =>
      sum +
      milestone.maternityDressTasks.filter((t) => t.status === 'DONE' || t.status === 'PASS' || t.status === 'FAIL')
        .length,
    0
  )
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return 'Hoàn thành'
      case 'IN_PROGRESS':
        return 'Đang thực hiện'
      case 'PENDING':
        return 'Chờ thực hiện'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return 'Không xác định'
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

  const isQualityCheckMilestone = (milestoneName: string) => {
    return milestoneName.toLowerCase().includes('quality') || milestoneName.toLowerCase().includes('kiểm tra')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>{task.preset.styleName}</DialogTitle>
          <DialogDescription>Chi tiết công việc Order Item: {task.orderItemId}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Product Overview */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <img
                  src={task.preset.images[0]}
                  alt={task.preset.styleName}
                  className='w-24 h-24 rounded-lg object-cover shadow-sm'
                />
                <div className='flex-1 space-y-2'>
                  <h3 className='text-lg font-semibold'>{task.preset.styleName}</h3>
                  <p className='text-lg font-bold text-primary'>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(task.preset.price)}
                  </p>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm text-muted-foreground'>Tiến độ: {progress}%</span>
                    <span className='text-sm text-muted-foreground'>
                      {completedTasks}/{totalTasks} nhiệm vụ hoàn thành
                    </span>
                  </div>
                  <Progress value={progress} className='w-full' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones and Tasks */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Quy trình thực hiện ({task.milestones.length} giai đoạn)
            </h3>

            {task.milestones
              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
              .map((milestone, index) => {
                const milestoneCompleted = milestone.maternityDressTasks.filter(
                  (t) => t.status === 'DONE' || t.status === 'PASS' || t.status === 'FAIL'
                ).length
                const milestoneTotal = milestone.maternityDressTasks.length
                const milestoneProgress = milestoneTotal > 0 ? (milestoneCompleted / milestoneTotal) * 100 : 0
                const isQualityCheck = isQualityCheckMilestone(milestone.name)

                return (
                  <Card key={`milestone-${index}`} className='overflow-hidden'>
                    <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-lg'>
                          {milestone.sequenceOrder}. {milestone.name}
                          {isQualityCheck && (
                            <Badge variant='outline' className='ml-2'>
                              <ShieldCheck className='w-3 h-3 mr-1' />
                              Quality Check
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge variant='outline'>
                          {milestoneCompleted}/{milestoneTotal} nhiệm vụ
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>{milestone.description}</p>
                      <Progress value={milestoneProgress} className='w-full' />
                    </CardHeader>
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        {milestone.maternityDressTasks
                          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                          .map((taskItem) => (
                            <div
                              key={taskItem.id}
                              className='flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              <div className='flex items-start gap-3 flex-1'>
                                <Badge variant='outline' className='text-xs font-mono mt-1'>
                                  #{taskItem.sequenceOrder}
                                </Badge>
                                <div className='flex-1'>
                                  <h4 className='font-medium'>{taskItem.name}</h4>
                                  <p className='text-sm text-muted-foreground'>{taskItem.description}</p>

                                  {/* View Mode */}
                                  <div className='mt-2 space-y-2'>
                                    {taskItem.note && <p className='text-xs text-blue-600'>Ghi chú: {taskItem.note}</p>}

                                    {taskItem.image && (
                                      <div className='flex items-center gap-2'>
                                        <ImageIcon className='h-4 w-4 text-muted-foreground' />
                                        <img
                                          src={taskItem.image}
                                          alt='Task result'
                                          className='w-16 h-16 rounded object-cover'
                                        />
                                      </div>
                                    )}

                                    {isQualityCheck && (taskItem.status === 'PASS' || taskItem.status === 'FAIL') && (
                                      <div className='flex items-center gap-2'>
                                        <span className='text-sm text-muted-foreground'>Kết quả:</span>
                                        {getQualityStatusBadge(taskItem.status as QualityCheckStatus)}
                                      </div>
                                    )}

                                    {/* Quick Action Buttons */}
                                    <div className='flex gap-2 mt-3'>
                                      {taskItem.status === 'PENDING' && (
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={() =>
                                            onTaskStatusChange(taskItem.id, 'IN_PROGRESS', task.orderItemId)
                                          }
                                          disabled={isUpdating}
                                          className='gap-2'
                                        >
                                          <Play className='h-4 w-4' />
                                          Bắt đầu
                                        </Button>
                                      )}

                                      {taskItem.status === 'IN_PROGRESS' && (
                                        <>
                                          <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() => onTaskStatusChange(taskItem.id, 'PENDING', task.orderItemId)}
                                            disabled={isUpdating}
                                            className='gap-2'
                                          >
                                            <Pause className='h-4 w-4' />
                                            Tạm dừng
                                          </Button>

                                          {isQualityCheck ? (
                                            // Quality Check tasks có 2 nút PASS/FAIL
                                            <>
                                              <Button
                                                size='sm'
                                                onClick={() =>
                                                  onTaskStatusChange(taskItem.id, 'PASS', task.orderItemId)
                                                }
                                                disabled={isUpdating}
                                                className='bg-green-600 hover:bg-green-700 gap-2'
                                              >
                                                <CheckCircle2 className='h-4 w-4' />
                                                Pass
                                              </Button>
                                              <Button
                                                size='sm'
                                                onClick={() =>
                                                  onTaskStatusChange(taskItem.id, 'FAIL', task.orderItemId)
                                                }
                                                disabled={isUpdating}
                                                className='bg-red-600 hover:bg-red-700 gap-2'
                                              >
                                                <Clock className='h-4 w-4' />
                                                Fail
                                              </Button>
                                            </>
                                          ) : (
                                            // Task thường có nút Hoàn thành
                                            <Button
                                              size='sm'
                                              onClick={() => onTaskStatusChange(taskItem.id, 'DONE', task.orderItemId)}
                                              disabled={isUpdating}
                                              className='bg-green-600 hover:bg-green-700 gap-2'
                                            >
                                              <CheckCircle2 className='h-4 w-4' />
                                              Hoàn thành
                                            </Button>
                                          )}
                                        </>
                                      )}

                                      {(taskItem.status === 'DONE' ||
                                        taskItem.status === 'PASS' ||
                                        taskItem.status === 'FAIL') && (
                                        <Badge variant='default' className='gap-1 self-start'>
                                          <CheckCircle2 className='h-3 w-3' />
                                          Đã xong
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className='flex items-center gap-3'>
                                <Badge className={`${getStatusColor(taskItem.status)} border`}>
                                  {getStatusText(taskItem.status)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
