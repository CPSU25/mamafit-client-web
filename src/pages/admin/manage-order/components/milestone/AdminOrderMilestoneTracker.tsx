// =====================================================================
// File: src/pages/admin/manage-order/components/milestone/AdminOrderMilestoneTracker.tsx
// Mô tả: Component milestone tracker riêng cho Admin
// Chỉ hiển thị dữ liệu admin structure: milestones.tasks[].detail
// =====================================================================

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, Lock, UserCheck, AlertCircle } from 'lucide-react'
import { AdminMilestone, AdminTaskStatus } from '@/@types/admin-task.types'

/**
 * Helper functions cho admin task status display
 */
const getAdminStatusText = (status: AdminTaskStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Chờ'
    case 'IN_PROGRESS':
      return 'Đang thực hiện'
    case 'COMPLETED':
      return 'Hoàn thành'
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

const getAdminStatusColor = (status: AdminTaskStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'PASS':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'FAIL':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

interface AdminOrderMilestoneTrackerProps {
  milestones: AdminMilestone[]
  isReadOnly?: boolean // Admin có thể chỉ xem hoặc có quyền chỉnh sửa
}

export const AdminOrderMilestoneTracker: React.FC<AdminOrderMilestoneTrackerProps> = ({
  milestones,
  isReadOnly = false
}) => {
  // Sắp xếp milestones theo thứ tự
  const sortedMilestones = [...milestones].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  // Tính toán milestone nào đang active
  const getActiveMilestoneIndex = () => {
    for (let i = 0; i < sortedMilestones.length; i++) {
      const milestone = sortedMilestones[i]
      const allTasksCompleted = milestone.tasks.every(
        (task) => task.detail.status === 'COMPLETED' || task.detail.status === 'PASS' || task.detail.status === 'FAIL'
      )
      if (!allTasksCompleted) {
        return i
      }
    }
    return sortedMilestones.length - 1
  }

  const activeMilestoneIndex = getActiveMilestoneIndex()

  const getMilestoneStatus = (milestoneIndex: number, milestone: AdminMilestone) => {
    const completedTasks = milestone.tasks.filter(
      (task) => task.detail.status === 'COMPLETED' || task.detail.status === 'PASS' || task.detail.status === 'FAIL'
    ).length
    const totalTasks = milestone.tasks.length
    const allCompleted = completedTasks === totalTasks
    const hasInProgress = milestone.tasks.some((task) => task.detail.status === 'IN_PROGRESS')

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
          <CardTitle className='flex items-center justify-between'>
            <span>Quy trình thực hiện ({sortedMilestones.length} giai đoạn)</span>
            {isReadOnly && (
              <Badge variant='outline' className='text-xs'>
                <AlertCircle className='h-3 w-3 mr-1' />
                Chỉ xem
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {sortedMilestones.map((milestone, milestoneIndex) => {
              const milestoneStatus = getMilestoneStatus(milestoneIndex, milestone)
              const isLocked = milestoneStatus.status === 'locked'
              const isCompleted = milestoneStatus.status === 'completed'

              const completedTasks = milestone.tasks.filter(
                (task) =>
                  task.detail.status === 'COMPLETED' || task.detail.status === 'PASS' || task.detail.status === 'FAIL'
              ).length
              const totalTasks = milestone.tasks.length
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

              return (
                <div key={`admin-milestone-${milestone.id}`} className='relative'>
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
                        {/* Status Icon */}
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

                          {/* Progress bar */}
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

                          {/* Tasks - Admin structure */}
                          {!isLocked && (
                            <div className='space-y-3'>
                              {milestone.tasks
                                .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                                .map((task) => {
                                  const taskStatus = task.detail.status
                                  const canEdit = !isReadOnly

                                  return (
                                    <div
                                      key={task.id}
                                      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
                                        taskStatus === 'COMPLETED'
                                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm'
                                          : taskStatus === 'IN_PROGRESS'
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                      }`}
                                    >
                                      {/* Status indicator line */}
                                      <div
                                        className={`absolute top-0 left-0 right-0 h-0.5 ${
                                          taskStatus === 'COMPLETED'
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
                                                taskStatus === 'COMPLETED'
                                                  ? 'bg-green-100 text-green-600'
                                                  : taskStatus === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-500'
                                              }`}
                                            >
                                              {taskStatus === 'COMPLETED' ||
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
                                            <div className='flex items-center gap-2'>
                                              <Badge
                                                variant='outline'
                                                className={`text-xs font-medium ${getAdminStatusColor(taskStatus)}`}
                                              >
                                                {getAdminStatusText(taskStatus)}
                                              </Badge>
                                              {task.detail.chargeName && (
                                                <Badge variant='outline' className='text-xs'>
                                                  <UserCheck className='h-3 w-3 mr-1' />
                                                  {task.detail.chargeName}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>

                                          {task.description && (
                                            <p className='text-sm text-gray-600 pl-11'>{task.description}</p>
                                          )}

                                          {/* Show image and note if completed - Admin structure */}
                                          {(taskStatus === 'COMPLETED' ||
                                            taskStatus === 'PASS' ||
                                            taskStatus === 'FAIL') &&
                                            (task.detail.image || task.detail.note) && (
                                              <div className='ml-11 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200'>
                                                <div className='flex items-center gap-2 mb-3'>
                                                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                                                  <span className='text-sm font-medium text-green-800'>
                                                    Kết quả hoàn thành
                                                  </span>
                                                </div>

                                                <div className='space-y-3'>
                                                  {task.detail.image && (
                                                    <div className='space-y-2'>
                                                      <p className='text-xs font-medium text-green-700'>
                                                        Hình ảnh kết quả:
                                                      </p>
                                                      <div className='relative group'>
                                                        <img
                                                          src={task.detail.image}
                                                          alt='Kết quả công việc'
                                                          className='w-full max-w-xs h-32 object-cover rounded-lg shadow-sm border border-green-200 transition-transform group-hover:scale-105'
                                                        />
                                                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg' />
                                                      </div>
                                                    </div>
                                                  )}

                                                  {task.detail.note && (
                                                    <div className='space-y-2'>
                                                      <p className='text-xs font-medium text-green-700'>Ghi chú:</p>
                                                      <div className='bg-white/70 rounded-md p-3 border border-green-100'>
                                                        <p className='text-sm text-gray-700 leading-relaxed'>
                                                          {task.detail.note}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {/* Admin chỉ có thể giao việc và theo dõi, không điều khiển trạng thái */}
                                          {canEdit && !task.detail.chargeName && (
                                            <div className='pl-11'>
                                              <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => {
                                                  // TODO: Mở dialog giao việc cho Designer/Staff
                                                  console.log('Assign task to Designer/Staff:', task.id)
                                                }}
                                                className='gap-2'
                                              >
                                                <UserCheck className='h-4 w-4' />
                                                Giao việc
                                              </Button>
                                            </div>
                                          )}

                                          {/* Hiển thị trạng thái hiện tại */}
                                          {task.detail.chargeName && (
                                            <div className='pl-11'>
                                              <div className='flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                                                <UserCheck className='h-4 w-4 text-blue-600' />
                                                <div className='text-sm'>
                                                  <span className='text-blue-800 font-medium'>
                                                    Đã giao cho: {task.detail.chargeName}
                                                  </span>
                                                  <p className='text-blue-600 text-xs mt-1'>
                                                    Trạng thái: {getAdminStatusText(taskStatus)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
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
