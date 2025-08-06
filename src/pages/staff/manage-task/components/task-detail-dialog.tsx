// task-detail-dialog.tsx
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
  Clock,
  Lock,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { TaskStatus, QualityCheckStatus, MilestoneUI } from '@/pages/staff/manage-task/tasks/types'
import { useStaffGetOrderTaskByOrderItemId } from '@/services/staff/staff-task.service'
import { useQualityCheckPostSubmitHandler } from '@/services/staff/quality-check.service'
import { QualityCheckTaskManager } from '@/pages/staff/manage-task/components/quality-check-task-manager'

interface TaskDetailDialogProps {
  orderItemId: string | null
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
  const { data: task, isLoading, isError, refetch } = useStaffGetOrderTaskByOrderItemId(orderItemId || '')
  const { handlePostSubmit } = useQualityCheckPostSubmitHandler()

  // Xử lý sau khi Quality Check submit thành công
  const handleQualityCheckSuccess = async (hasFailures: boolean, hasSeverity: boolean) => {
    if (orderItemId) {
      try {
        const result = await handlePostSubmit(orderItemId, hasFailures, hasSeverity)
        console.log('Quality Check post-submit result:', result)

        // Refetch data để cập nhật UI
        await refetch()
      } catch (error) {
        console.error('Error in post-submit handling:', error)
      }
    }
  }

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
              <Button onClick={() => refetch()} variant='outline'>
                Thử lại
              </Button>
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
      case 'LOCKED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
      case 'LOCKED':
        return 'Bị khóa'
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

  // Kiểm tra milestone có bị khóa không (sau Quality Check có FAIL không nghiêm trọng)
  const isMilestoneLocked = (_milestone: MilestoneUI, milestoneIndex: number) => {
    // Tìm Quality Check milestone
    const qualityCheckMilestoneIndex = task.milestones.findIndex((m) => isQualityCheckMilestone(m.name))

    // Nếu có Quality Check milestone và milestone hiện tại ở sau Quality Check
    if (qualityCheckMilestoneIndex !== -1 && milestoneIndex > qualityCheckMilestoneIndex) {
      const qualityCheckMilestone = task.milestones[qualityCheckMilestoneIndex]
      const hasFailedTasks = qualityCheckMilestone.maternityDressTasks.some((t) => t.status === 'FAIL')
      const hasSeverityTasks = qualityCheckMilestone.maternityDressTasks.some((t) => t.status === 'FAIL' && t.severity)

      // Khóa nếu có FAIL nhưng không có severity
      return hasFailedTasks && !hasSeverityTasks
    }

    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>{task.preset.styleName}</DialogTitle>
          <DialogDescription>Order Code: {task.orderCode}</DialogDescription>
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
                const isLocked = isMilestoneLocked(milestone, index)

                // Nếu là Quality Check milestone, sử dụng component đặc biệt
                if (isQualityCheck) {
                  // Kiểm tra xem Quality Check đã hoàn thành chưa
                  const isQualityCheckDone = milestone.maternityDressTasks.every(
                    (t) => t.status === 'PASS' || t.status === 'FAIL'
                  )

                  // Nếu đã hoàn thành, hiển thị readonly view
                  if (isQualityCheckDone) {
                    const passedTasks = milestone.maternityDressTasks.filter((t) => t.status === 'PASS').length
                    const failedTasks = milestone.maternityDressTasks.filter((t) => t.status === 'FAIL').length
                    const severityTasks = milestone.maternityDressTasks.filter(
                      (t) => t.status === 'FAIL' && t.severity
                    ).length

                    return (
                      <Card key={`milestone-${index}`} className='overflow-hidden border-green-200 bg-green-50'>
                        <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50'>
                          <CardTitle className='flex items-center gap-2 text-green-800'>
                            <ShieldCheck className='h-5 w-5' />
                            Quality Check - Đã hoàn thành
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
                    )
                  }

                  // Nếu chưa hoàn thành, hiển thị form để input
                  const qualityCheckTasks = milestone.maternityDressTasks.map((task) => ({
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    sequenceOrder: task.sequenceOrder
                  }))

                  return (
                    <QualityCheckTaskManager
                      key={`milestone-${index}`}
                      tasks={qualityCheckTasks}
                      orderItemId={task.orderItemId}
                      onSubmitSuccess={handleQualityCheckSuccess}
                      isDisabled={isUpdating}
                      milestoneName={milestone.name}
                    />
                  )
                }

                // Render milestone thường
                return (
                  <Card
                    key={`milestone-${index}`}
                    className={`overflow-hidden ${isLocked ? 'opacity-60 bg-yellow-50 border-yellow-200' : ''}`}
                  >
                    <CardHeader
                      className={`bg-gradient-to-r ${
                        isLocked ? 'from-yellow-50 to-amber-50' : 'from-blue-50 to-indigo-50'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <CardTitle className={`text-lg flex items-center gap-2 ${isLocked ? 'text-yellow-800' : ''}`}>
                          {isLocked && <Lock className='h-4 w-4' />}
                          {milestone.sequenceOrder}. {milestone.name}
                          {isLocked && (
                            <Badge variant='secondary' className='ml-2'>
                              Bị khóa
                            </Badge>
                          )}
                        </CardTitle>
                        <Badge variant='outline'>
                          {milestoneCompleted}/{milestoneTotal} nhiệm vụ
                        </Badge>
                      </div>
                      <p className='text-sm text-muted-foreground'>{milestone.description}</p>
                      {isLocked && (
                        <p className='text-xs text-yellow-700 bg-yellow-100 p-2 rounded'>
                          ⚠️ Milestone này bị khóa do Quality Check có lỗi không nghiêm trọng. Chờ admin assign người
                          khác xử lý.
                        </p>
                      )}
                      <Progress value={milestoneProgress} className='w-full' />
                    </CardHeader>
                    <CardContent className='p-4'>
                      <div className='space-y-3'>
                        {milestone.maternityDressTasks
                          .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                          .map((taskItem) => (
                            <div
                              key={taskItem.id}
                              className={`flex items-start justify-between p-4 border rounded-lg transition-colors ${
                                isLocked ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50 border-gray-200'
                              }`}
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
                                      {!isLocked && taskItem.status === 'PENDING' && (
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

                                      {!isLocked && taskItem.status === 'IN_PROGRESS' && (
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

                                      {isLocked && (
                                        <Badge variant='secondary' className='gap-1 self-start'>
                                          <Lock className='h-3 w-3' />
                                          Bị khóa
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
