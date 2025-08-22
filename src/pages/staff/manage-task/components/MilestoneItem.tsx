import React, { useState } from 'react'
import dayjs from 'dayjs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { MilestoneUI, TaskStatus } from '@/pages/staff/manage-task/tasks/types'

interface MilestoneItemProps {
  milestone: MilestoneUI
  isLast: boolean
  onTaskStatusChange: (taskId: string, status: TaskStatus, orderItemId?: string) => void
  orderItemId?: string
  isUpdating?: boolean // Loading state cho việc update
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  isLast,
  onTaskStatusChange,
  orderItemId,
  isUpdating = false
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const totalTasks = milestone.maternityDressTasks.length
  const completedTasks = milestone.maternityDressTasks.filter(
    (task) => task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL'
  ).length
  const inProgressTasks = milestone.maternityDressTasks.filter((task) => task.status === 'IN_PROGRESS').length

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const isCompleted = completedTasks === totalTasks && totalTasks > 0
  const hasStarted = completedTasks > 0 || inProgressTasks > 0

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
      case 'PASS':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAIL':
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
      case 'PASS':
        return 'Pass'
      case 'FAIL':
        return 'Fail'
      default:
        return 'Không xác định'
    }
  }

  const renderSLA = (task: MilestoneUI['maternityDressTasks'][number]) => {
    const deadline = task.deadline
    const estimate = task.estimateTimeSpan
    if (!deadline && !estimate) return null

    let badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'
    let label = 'Không có deadline'
    if (deadline) {
      const minutesLeft = dayjs(deadline).diff(dayjs(), 'minute')
      if (minutesLeft < 0) {
        badgeClass = 'bg-red-100 text-red-800 border-red-200'
        label = `Quá hạn ${Math.abs(minutesLeft)} phút`
      } else if (minutesLeft <= 60) {
        badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'
        label = `Còn ${minutesLeft} phút`
      } else if (minutesLeft <= 240) {
        badgeClass = 'bg-orange-100 text-orange-800 border-orange-200'
        const h = Math.floor(minutesLeft / 60)
        const m = minutesLeft % 60
        label = `Còn ${h} giờ ${m} phút`
      } else {
        badgeClass = 'bg-blue-50 text-blue-700 border-blue-200'
        const h = Math.floor(minutesLeft / 60)
        label = `Còn ~${h} giờ`
      }
    }

    return (
      <div className='flex items-center gap-2'>
        {deadline && (
          <Badge variant='outline' className={`text-xs ${badgeClass}`}>
            {dayjs(deadline).format('DD/MM/YYYY HH:mm')} • {label}
          </Badge>
        )}
        {typeof estimate === 'number' && (
          <Badge variant='outline' className='text-xs'>Ước tính: {estimate} phút</Badge>
        )}
      </div>
    )
  }

  return (
    <div className='relative'>
      {/* Timeline connector line */}
      {!isLast && <div className='absolute left-6 top-16 w-0.5 h-8 bg-border'></div>}

      <div className='flex gap-4'>
        {/* Timeline icon */}
        <div className='flex-shrink-0 mt-2'>
          <div
            className={`
            w-12 h-12 rounded-full border-2 flex items-center justify-center
            ${
              isCompleted
                ? 'bg-green-100 border-green-500 text-green-700'
                : hasStarted
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
            }
          `}
          >
            {isCompleted ? (
              <CheckCircle className='h-6 w-6' />
            ) : hasStarted ? (
              <Clock className='h-6 w-6' />
            ) : (
              <Circle className='h-6 w-6' />
            )}
          </div>
        </div>

        {/* Milestone content */}
        <div className='flex-1 pb-8'>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant='ghost' className='w-full justify-start p-0 h-auto hover:bg-transparent'>
                <div className='flex items-center justify-between w-full'>
                  <div className='text-left'>
                    <div className='flex items-center gap-3'>
                      <h4 className='text-lg font-semibold'>
                        {milestone.sequenceOrder}. {milestone.name}
                      </h4>
                      <Badge
                        variant='outline'
                        className={`
                          ${
                            isCompleted
                              ? 'border-green-500 text-green-700'
                              : hasStarted
                                ? 'border-blue-500 text-blue-700'
                                : 'border-gray-300 text-gray-600'
                          }
                        `}
                      >
                        {completedTasks}/{totalTasks} nhiệm vụ
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>{milestone.description}</p>

                    {/* Progress bar */}
                    <div className='flex items-center gap-3 mt-3'>
                      <Progress value={progress} className='flex-1 h-2' />
                      <span className='text-sm font-medium text-muted-foreground min-w-[3rem]'>
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  <div className='ml-4'>
                    {isOpen ? <ChevronDown className='h-5 w-5' /> : <ChevronRight className='h-5 w-5' />}
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-4'>
              <Card>
                <CardContent className='p-4'>
                  <h5 className='font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide'>
                    Chi tiết các nhiệm vụ
                  </h5>

                  <div className='space-y-3'>
                    {milestone.maternityDressTasks
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((task) => (
                        <div
                          key={`task-${orderItemId}-${task.id}`}
                          className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center gap-3'>
                            <Badge variant='outline' className='text-xs font-mono'>
                              #{task.sequenceOrder}
                            </Badge>
                            <div>
                              <p className='font-medium'>{task.name}</p>
                              <p className='text-sm text-muted-foreground'>{task.description}</p>
                              <div className='mt-1'>{renderSLA(task)}</div>
                              {task.note && <p className='text-xs text-blue-600 mt-1'>Ghi chú: {task.note}</p>}
                            </div>
                          </div>

                          <div className='flex items-center gap-3'>
                            {task.image && (
                              <img src={task.image} alt={task.name} className='w-12 h-12 rounded object-cover' />
                            )}

                            <Badge className={`${getStatusColor(task.status)} border`}>
                              {getStatusText(task.status)}
                            </Badge>

                            {/* Task action buttons */}
                            <div className='flex gap-1'>
                              {task.status === 'PENDING' && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => onTaskStatusChange(task.id, 'IN_PROGRESS', orderItemId)}
                                  disabled={isUpdating}
                                  className='text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50'
                                >
                                  {isUpdating ? 'Đang cập nhật...' : 'Bắt đầu'}
                                </Button>
                              )}

                              {task.status === 'IN_PROGRESS' && (
                                <>
                                  {/* Kiểm tra xem có phải Quality Check milestone không */}
                                  {milestone.name.toLowerCase().includes('quality') ? (
                                    // Quality Check tasks có 2 nút PASS/FAIL
                                    <>
                                      <Button
                                        size='sm'
                                        onClick={() => onTaskStatusChange(task.id, 'PASS', orderItemId)}
                                        disabled={isUpdating}
                                        className='bg-green-600 hover:bg-green-700 disabled:opacity-50'
                                      >
                                        {isUpdating ? 'Đang cập nhật...' : 'Pass'}
                                      </Button>
                                      <Button
                                        size='sm'
                                        onClick={() => onTaskStatusChange(task.id, 'FAIL', orderItemId)}
                                        disabled={isUpdating}
                                        className='bg-red-600 hover:bg-red-700 disabled:opacity-50'
                                      >
                                        {isUpdating ? 'Đang cập nhật...' : 'Fail'}
                                      </Button>
                                    </>
                                  ) : (
                                    // Task thường có nút Hoàn thành
                                    <Button
                                      size='sm'
                                      onClick={() => onTaskStatusChange(task.id, 'DONE', orderItemId)}
                                      disabled={isUpdating}
                                      className='bg-green-600 hover:bg-green-700 disabled:opacity-50'
                                    >
                                      {isUpdating ? 'Đang cập nhật...' : 'Hoàn thành'}
                                    </Button>
                                  )}
                                </>
                              )}

                              {(task.status === 'DONE' || task.status === 'PASS' || task.status === 'FAIL') && (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => onTaskStatusChange(task.id, 'IN_PROGRESS', orderItemId)}
                                  disabled={isUpdating}
                                  className='text-orange-600 border-orange-200 hover:bg-orange-50 disabled:opacity-50'
                                >
                                  {isUpdating ? 'Đang cập nhật...' : 'Mở lại'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {milestone.maternityDressTasks.length === 0 && (
                    <div className='text-center py-4 text-muted-foreground'>
                      <p>Chưa có nhiệm vụ nào trong giai đoạn này.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
