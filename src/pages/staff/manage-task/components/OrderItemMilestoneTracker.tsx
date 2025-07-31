import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Clock, Play, Pause, Lock } from 'lucide-react'
import { MilestoneUI, TaskStatus } from '@/pages/staff/manage-task/tasks/types'
import { useUpdateTaskStatus } from '@/services/global/order-task.service'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'

interface OrderItemMilestoneTrackerProps {
  milestones: MilestoneUI[]
  orderItemId: string
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

export const OrderItemMilestoneTracker: React.FC<OrderItemMilestoneTrackerProps> = ({ milestones, orderItemId }) => {
  const updateTaskStatusMutation = useUpdateTaskStatus()

  // Sắp xếp milestones theo thứ tự
  const sortedMilestones = [...milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  // Tính toán milestone nào đang active (milestone đầu tiên chưa hoàn thành)
  const getActiveMilestoneIndex = () => {
    for (let i = 0; i < sortedMilestones.length; i++) {
      const milestone = sortedMilestones[i]
      const allTasksCompleted = milestone.maternityDressTasks.every((task) => task.status === 'DONE')
      if (!allTasksCompleted) {
        return i
      }
    }
    return sortedMilestones.length - 1 // Tất cả đã hoàn thành
  }

  const activeMilestoneIndex = getActiveMilestoneIndex()

  const handleTaskStatusChange = (taskId: string, status: TaskStatus, image?: string, note?: string) => {
    updateTaskStatusMutation.mutate({
      dressTaskId: taskId,
      orderItemId: orderItemId,
      status,
      image,
      note
    })
  }

  const getMilestoneStatus = (milestoneIndex: number, milestone: MilestoneUI) => {
    const completedTasks = milestone.maternityDressTasks.filter((task) => task.status === 'DONE').length
    const totalTasks = milestone.maternityDressTasks.length
    const allCompleted = completedTasks === totalTasks
    const hasInProgress = milestone.maternityDressTasks.some((task) => task.status === 'IN_PROGRESS')

    if (milestoneIndex < activeMilestoneIndex) {
      return { status: 'completed', label: 'Hoàn thành', variant: 'default' as const }
    } else if (milestoneIndex === activeMilestoneIndex) {
      if (allCompleted) {
        return { status: 'completed', label: 'Hoàn thành', variant: 'default' as const }
      } else if (hasInProgress) {
        return { status: 'in-progress', label: 'Đang thực hiện', variant: 'secondary' as const }
      } else {
        return { status: 'active', label: 'Sẵn sàng', variant: 'outline' as const }
      }
    } else {
      return { status: 'locked', label: 'Chờ', variant: 'secondary' as const }
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Quy trình thực hiện ({sortedMilestones.length} giai đoạn)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {sortedMilestones.map((milestone, milestoneIndex) => {
              const milestoneStatus = getMilestoneStatus(milestoneIndex, milestone)
              const isLocked = milestoneStatus.status === 'locked'
              const isCompleted = milestoneStatus.status === 'completed'

              const completedTasks = milestone.maternityDressTasks.filter((task) => task.status === 'DONE').length
              const totalTasks = milestone.maternityDressTasks.length
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

              return (
                <div key={`milestone-${milestone.sequenceOrder}`} className='relative'>
                  {/* Connector line */}
                  {milestoneIndex < sortedMilestones.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-16 ${isCompleted ? 'bg-green-300' : 'bg-muted'}`} />
                  )}

                  <div
                    className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
                      isLocked
                        ? 'bg-gray-50/50 border-gray-200 shadow-sm'
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
                            ? 'bg-gray-300'
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
                                ? 'bg-gray-300 text-gray-600 ring-gray-100'
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
                                  isCompleted ? 'text-green-700' : isLocked ? 'text-gray-600' : 'text-blue-700'
                                }`}
                              >
                                {milestone.name}
                              </h3>
                              <p className='text-gray-600 leading-relaxed'>{milestone.description}</p>
                            </div>
                            <Badge
                              variant={milestoneStatus.variant}
                              className={`px-3 py-1 text-sm font-medium ${
                                isCompleted
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : isLocked
                                    ? 'bg-gray-100 text-gray-600 border-gray-200'
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
                                        taskStatus === 'DONE'
                                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm'
                                          : taskStatus === 'IN_PROGRESS'
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                      }`}
                                    >
                                      {/* Status indicator line */}
                                      <div
                                        className={`absolute top-0 left-0 right-0 h-0.5 ${
                                          taskStatus === 'DONE'
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
                                                taskStatus === 'DONE'
                                                  ? 'bg-green-100 text-green-600'
                                                  : taskStatus === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-500'
                                              }`}
                                            >
                                              {taskStatus === 'DONE' ? (
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
                                              variant={
                                                taskStatus === 'DONE'
                                                  ? 'default'
                                                  : taskStatus === 'IN_PROGRESS'
                                                    ? 'secondary'
                                                    : 'outline'
                                              }
                                              className={`text-xs font-medium ${
                                                taskStatus === 'DONE'
                                                  ? 'bg-green-100 text-green-800 border-green-200'
                                                  : taskStatus === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                              }`}
                                            >
                                              {taskStatus === 'DONE'
                                                ? 'Hoàn thành'
                                                : taskStatus === 'IN_PROGRESS'
                                                  ? 'Đang làm'
                                                  : 'Chờ'}
                                            </Badge>
                                          </div>

                                          {task.description && (
                                            <p className='text-sm text-gray-600 pl-11'>{task.description}</p>
                                          )}

                                          {/* Show image and note if completed - Improved Design */}
                                          {taskStatus === 'DONE' && (task.image || task.note) && (
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

                                          <div className='flex gap-2 pl-11'>
                                            {taskStatus === 'PENDING' && canStart && (
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

                                            {taskStatus === 'IN_PROGRESS' && (
                                              <>
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

                                                <TaskCompletionDialog
                                                  taskId={task.id}
                                                  taskName={task.name}
                                                  onComplete={(taskId, image, note) =>
                                                    handleTaskStatusChange(taskId, 'DONE', image, note)
                                                  }
                                                  isLoading={updateTaskStatusMutation.isPending}
                                                />
                                              </>
                                            )}

                                            {taskStatus === 'DONE' && (
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
                              <p className='text-sm'>Cần hoàn thành giai đoạn trước để mở khóa</p>
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
    </div>
  )
}
