import { useGetStatusTimelineOfOrderItem } from '@/services/admin/manage-milestone.service'
import { CheckCircle2, PlayCircle, StickyNote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { useAdminOrderItemsWithTasks } from '@/services/admin/admin-task.service'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

// Status Timeline Component
interface StatusOrderTimelineProps {
  orderItemId: string
}

function StatusOrderTimeline({ orderItemId }: StatusOrderTimelineProps) {
  const { data: statusTimeline, isLoading } = useGetStatusTimelineOfOrderItem(orderItemId)
  // Lấy chi tiết tasks (có note/image) của order item để hiển thị kết quả khi task đã hoàn thành
  const adminOrderItemQueries = useAdminOrderItemsWithTasks([orderItemId], true)
  const adminOrderItem = adminOrderItemQueries[0]?.data
  console.log(adminOrderItem)
  // State cho chế độ xem thêm khi tất cả milestones đã hoàn thành
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  // Helper: sort theo sequenceOrder (fallback 0 nếu thiếu)
  const sortBySequence = <T extends { sequenceOrder?: number }>(list: T[]) =>
    list.slice().sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0))
  if (isLoading) {
    return (
      <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
        <div className='w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin'></div>
        <span>Loading status...</span>
      </div>
    )
  }

  if (!statusTimeline?.data || statusTimeline.data.length === 0) {
    return <div className='text-xs text-muted-foreground/60 italic'>No milestones assigned</div>
  }

  // Sắp xếp milestones theo sequenceOrder
  const sortedMilestones = [...statusTimeline.data].sort(
    (a, b) => a.milestone.sequenceOrder - b.milestone.sequenceOrder
  )

  // Logic tìm milestone để hiển thị
  let displayMilestone = null

  // 1. Tìm milestone Quality Check đang pending (progress 100% nhưng isDone false)
  const qualityCheckPending = sortedMilestones.find(
    (milestone) =>
      milestone.milestone.name.toLowerCase().includes('quality check') &&
      !milestone.milestone.name.toLowerCase().includes('quality check failed') &&
      milestone.progress === 100 &&
      !milestone.isDone
  )

  if (qualityCheckPending) {
    // Nếu có Quality Check pending, kiểm tra xem đã có Quality Check Failed chưa
    const qualityCheckFailed = sortedMilestones.find((milestone) =>
      milestone.milestone.name.toLowerCase().includes('quality check failed')
    )

    if (qualityCheckFailed) {
      // Nếu QC Failed đang thực hiện (chưa xong) -> hiển thị QC Failed
      if (!(qualityCheckFailed.progress === 100 && qualityCheckFailed.isDone)) {
        displayMilestone = qualityCheckFailed
      } else {
        // QC Failed đã hoàn thành -> chọn milestone kế tiếp CHƯA hoàn thành
        const nextAfterQCFailed = sortedMilestones.find(
          (milestone) =>
            milestone.milestone.sequenceOrder > qualityCheckFailed.milestone.sequenceOrder &&
            !(milestone.progress === 100 && milestone.isDone)
        )
        displayMilestone = nextAfterQCFailed || null
      }
    } else {
      // Chưa có QC Failed -> chọn milestone ngay sau Quality Check nhưng CHƯA hoàn thành
      const nextAfterQCMilestone = sortedMilestones.find(
        (milestone) =>
          milestone.milestone.sequenceOrder > qualityCheckPending.milestone.sequenceOrder &&
          !(milestone.progress === 100 && milestone.isDone)
      )
      displayMilestone = nextAfterQCMilestone || null
    }
  } else {
    // 2. Tìm milestone hiện tại đang có progress (chưa hoàn thành)
    const currentMilestone = sortedMilestones.find((milestone) => milestone.progress > 0 && !milestone.isDone)

    if (currentMilestone) {
      displayMilestone = currentMilestone
    } else {
      // 3. Tìm milestone tiếp theo chưa bắt đầu
      const nextMilestone = sortedMilestones.find((milestone) => milestone.progress === 0)
      displayMilestone = nextMilestone
    }
  }

  console.log('displayMilestone', displayMilestone)

  if (!displayMilestone) {
    // Tất cả milestone đã hoàn thành -> hiển thị toàn bộ milestone và task (kèm note, image), có Xem thêm/Thu gọn
    const adminMilestones = adminOrderItem?.milestones?.slice()?.sort((a, b) => a.sequenceOrder - b.sequenceOrder) || []
    const completedStatusesAll = ['DONE', 'PASS', 'FAIL', 'COMPLETED'] as const
    type CompletedStatusAll = (typeof completedStatusesAll)[number]

    // Tổng số task đã hoàn thành
    const totalCompletedTasks = adminMilestones.reduce((sum, m) => {
      const ct = (m.tasks || []).filter((t) => completedStatusesAll.includes(t.detail.status as CompletedStatusAll))
      return sum + ct.length
    }, 0)

    const collapsed = !showAllCompleted && totalCompletedTasks > 6
    const maxMilestones = 2
    const maxTasksPerMilestone = 2

    const milestonesToRender = collapsed ? adminMilestones.slice(0, maxMilestones) : adminMilestones

    return (
      <div className='space-y-2'>
        <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-2'>
          <div className='flex items-center space-x-2'>
            <CheckCircle2 className='w-4 h-4 text-green-600 dark:text-green-400' />
            <span className='text-xs font-medium text-green-700 dark:text-green-300'>All milestones completed</span>
          </div>
        </div>

        <div className='space-y-2'>
          {milestonesToRender.map((m) => {
            const completedTasksOfMilestone = sortBySequence(
              (m.tasks || []).filter((t) => completedStatusesAll.includes(t.detail.status as CompletedStatusAll))
            )
            const tasksToShow = collapsed
              ? completedTasksOfMilestone.slice(0, maxTasksPerMilestone)
              : completedTasksOfMilestone
            if (completedTasksOfMilestone.length === 0) return null
            return (
              <div
                key={m.id}
                className='rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10 p-2'
              >
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                      <span className='text-xs font-bold text-white'>{m.sequenceOrder}</span>
                    </div>
                    <span className='text-xs font-semibold text-violet-700 dark:text-violet-300'>{m.name}</span>
                  </div>
                  <Badge
                    variant='secondary'
                    className='text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                  >
                    {completedTasksOfMilestone.length} tasks
                  </Badge>
                </div>

                <div className='space-y-2'>
                  {tasksToShow.map((t) => (
                    <div
                      key={t.id}
                      className='rounded-md border border-violet-200 dark:border-violet-700 bg-white/70 dark:bg-card/50 p-2'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-medium text-foreground truncate'>{t.name}</span>
                            <Badge
                              variant='outline'
                              className={`text-[10px] ${
                                t.detail.status === 'PASS'
                                  ? 'border-green-300 text-green-700'
                                  : t.detail.status === 'FAIL'
                                    ? 'border-red-300 text-red-700'
                                    : 'border-violet-300 text-violet-700'
                              }`}
                            >
                              {t.detail.status}
                            </Badge>
                          </div>
                          {t.detail.note && (
                            <div className='flex items-start gap-2 text-xs text-muted-foreground mt-1'>
                              <StickyNote className='w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0' />
                              <span className='leading-relaxed'>{t.detail.note}</span>
                            </div>
                          )}
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          {t.detail.image && (
                            <ProductImageViewer
                              src={t.detail.image}
                              alt={t.name}
                              containerClassName='w-16 h-16 rounded-md border-2 border-violet-200 dark:border-violet-700'
                              imgClassName='p-1'
                              fit='cover'
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {collapsed && completedTasksOfMilestone.length > maxTasksPerMilestone && (
                    <div className='text-[10px] text-muted-foreground mt-1'>
                      +{completedTasksOfMilestone.length - maxTasksPerMilestone} task khác trong milestone này
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {collapsed && (
          <div className='pt-1'>
            <Button size='sm' className='h-7 text-xs' onClick={() => setShowAllCompleted(true)}>
              Xem thêm {Math.max(totalCompletedTasks - maxMilestones * maxTasksPerMilestone, 0)} tasks
            </Button>
          </div>
        )}

        {!collapsed && totalCompletedTasks > 6 && (
          <div className='pt-1'>
            <Button size='sm' variant='outline' className='h-7 text-xs' onClick={() => setShowAllCompleted(false)}>
              Thu gọn
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Kiểm tra loại milestone để sử dụng theme phù hợp
  const isQualityCheckFailed = displayMilestone.milestone.name.toLowerCase().includes('quality check failed')
  const isQualityCheckPending =
    displayMilestone.milestone.name.toLowerCase().includes('quality check') &&
    !displayMilestone.milestone.name.toLowerCase().includes('quality check failed') &&
    displayMilestone.progress === 100 &&
    !displayMilestone.isDone

  const bgColor =
    isQualityCheckFailed || isQualityCheckPending
      ? 'bg-red-50 dark:bg-red-950/20'
      : 'bg-violet-50 dark:bg-violet-950/20'
  const borderColor =
    isQualityCheckFailed || isQualityCheckPending
      ? 'border-red-200 dark:border-red-800'
      : 'border-violet-200 dark:border-violet-800'
  const iconBgColor = isQualityCheckFailed || isQualityCheckPending ? 'bg-red-500' : 'bg-violet-500'
  const textColor =
    isQualityCheckFailed || isQualityCheckPending
      ? 'text-red-700 dark:text-red-300'
      : 'text-violet-700 dark:text-violet-300'
  const badgeBgColor =
    isQualityCheckFailed || isQualityCheckPending
      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      : 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'

  // Tìm task đã hoàn thành có note/image của milestone tương ứng (nếu có)
  const completedStatuses = ['DONE', 'PASS', 'FAIL', 'COMPLETED'] as const
  type CompletedStatus = (typeof completedStatuses)[number]
  // Chỉ lấy các task đã hoàn thành của đúng milestone đang hiển thị
  const matchedAdminMilestone = adminOrderItem?.milestones?.find(
    (m) => m.sequenceOrder === displayMilestone.milestone.sequenceOrder || m.id === displayMilestone.milestone.id
  )
  const completedTasksCurrent = (matchedAdminMilestone?.tasks || []).filter((t) =>
    completedStatuses.includes(t.detail.status as CompletedStatus)
  )

  return (
    <div className={`${bgColor} ${borderColor} rounded-lg p-2 space-y-2 border`}>
      {/* Milestone Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className={`w-5 h-5 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <span className='text-xs font-bold text-white'>{displayMilestone.milestone.sequenceOrder}</span>
          </div>
          <span className={`text-xs font-semibold ${textColor}`}>{displayMilestone.milestone.name}</span>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary' className={`text-xs ${badgeBgColor}`}>
            Step {displayMilestone.milestone.sequenceOrder}
          </Badge>
          {isQualityCheckPending ? (
            <Badge variant='destructive' className='text-xs'>
              Pending Review
            </Badge>
          ) : isQualityCheckFailed && displayMilestone.progress === 100 && displayMilestone.isDone ? (
            <Badge variant='destructive' className='text-xs'>
              Completed
            </Badge>
          ) : (
            <Badge variant='outline' className={`text-xs ${badgeBgColor}`}>
              {displayMilestone.progress}%
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className={`w-full ${isQualityCheckFailed || isQualityCheckPending ? 'bg-red-200 dark:bg-red-800' : 'bg-violet-200 dark:bg-violet-800'} rounded-full h-2`}
      >
        <div
          className={`${isQualityCheckFailed || isQualityCheckPending ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-violet-500 to-purple-600'} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${displayMilestone.progress}%` }}
        ></div>
      </div>

      {/* Current Task */}
      {displayMilestone.currentTask && (
        <div className='flex items-center space-x-2 pt-1'>
          <PlayCircle
            className={`w-4 h-4 ${isQualityCheckFailed || isQualityCheckPending ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'}`}
          />
          <span className='text-xs text-muted-foreground'>
            Current:{' '}
            <span
              className={`font-medium ${isQualityCheckFailed || isQualityCheckPending ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'}`}
            >
              {displayMilestone.currentTask.name}
            </span>
          </span>
        </div>
      )}

      {/* Special message for Quality Check Pending */}
      {isQualityCheckPending && (
        <div className='flex items-center space-x-2 pt-1'>
          <Clock className='w-4 h-4 text-red-600 dark:text-red-400' />
          <span className='text-xs text-red-600 dark:text-red-400 font-medium'>
            Quality check completed, waiting for review result
          </span>
        </div>
      )}

      {/* Special message for first milestone with 0 progress */}
      {displayMilestone.milestone.sequenceOrder === 1 && displayMilestone.progress === 0 && !isQualityCheckPending && (
        <div className='flex items-center space-x-2 pt-1'>
          <Clock className='w-4 h-4 text-amber-600 dark:text-amber-400' />
          <span className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
            Task is not started yet, please assign a task to the staff
          </span>
        </div>
      )}

      {/* Description if available */}
      {displayMilestone.milestone.description && (
        <p className='text-xs text-muted-foreground/80 leading-relaxed'>{displayMilestone.milestone.description}</p>
      )}

      {/* Danh sách task đã hoàn thành của milestone hiện tại */}
      {completedTasksCurrent.length > 0 && (
        <div className={`mt-1 p-2 rounded-lg border ${borderColor} ${bgColor}`}>
          <div className='flex items-center gap-2 mb-1'>
            <CheckCircle2 className={`w-4 h-4 ${isQualityCheckFailed ? 'text-red-600' : 'text-violet-600'}`} />
            <span className={`text-xs font-semibold ${textColor}`}>Các task đã hoàn thành</span>
          </div>
          <div className='space-y-2'>
            {completedTasksCurrent
              .slice()
              .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
              .map((task) => (
                <div
                  key={task.id}
                  className='rounded-md border border-violet-200 dark:border-violet-700 bg-white/70 dark:bg-card/50 p-2'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          className='text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                          variant='secondary'
                        >
                          #{task.sequenceOrder}
                        </Badge>
                        <span className='text-xs font-medium text-foreground truncate'>{task.name}</span>
                        <Badge
                          variant='outline'
                          className={`text-[10px] ${
                            task.detail.status === 'PASS'
                              ? 'border-green-300 text-green-700'
                              : task.detail.status === 'FAIL'
                                ? 'border-red-300 text-red-700'
                                : 'border-violet-300 text-violet-700'
                          }`}
                        >
                          {task.detail.status}
                        </Badge>
                      </div>
                      {task.detail.note && (
                        <div className='flex items-start gap-2 text-xs text-muted-foreground mt-1'>
                          <StickyNote className='w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0' />
                          <span className='leading-relaxed'>{task.detail.note}</span>
                        </div>
                      )}
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                      {task.detail.image && (
                        <ProductImageViewer
                          src={task.detail.image}
                          alt={task.name}
                          containerClassName='w-16 h-16 rounded-md border-2 border-violet-200 dark:border-violet-700'
                          imgClassName='p-1'
                          fit='cover'
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Các milestone đạt 100% theo sequenceOrder */}
      {(() => {
        const doneMilestones = sortedMilestones
          .filter((m) => m.progress === 100)
          .sort((a, b) => a.milestone.sequenceOrder - b.milestone.sequenceOrder)

        if (doneMilestones.length === 0) return null

        const entries = doneMilestones
          .map((sm) => {
            const am = adminOrderItem?.milestones?.find(
              (m) => m.sequenceOrder === sm.milestone.sequenceOrder || m.id === sm.milestone.id
            )
            const tasks = (am?.tasks || []).filter((t) =>
              completedStatuses.includes(t.detail.status as CompletedStatus)
            )
            return { sm, am, tasks }
          })
          .filter((e) => e.tasks.length > 0)

        if (entries.length === 0) return null

        return (
          <div className={`mt-1 p-2 rounded-lg border ${borderColor} ${bgColor}`}>
            <div className='flex items-center gap-2 mb-1'>
              <CheckCircle2 className={`w-4 h-4 ${isQualityCheckFailed ? 'text-red-600' : 'text-violet-600'}`} />
              <span className={`text-xs font-semibold ${textColor}`}>Các công việc đã hoàn thành </span>
            </div>
            <div className='space-y-2'>
              {entries.map(({ sm, am, tasks }) => (
                <div
                  key={am?.id || sm.milestone.id}
                  className='rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10 p-2'
                >
                  <div className='flex items-center justify-between mb-1'>
                    <div className='flex items-center gap-2'>
                      <div className='w-5 h-5 bg-violet-500 rounded-lg flex items-center justify-center'>
                        <span className='text-xs font-bold text-white'>{sm.milestone.sequenceOrder}</span>
                      </div>
                      <span className='text-xs font-semibold text-violet-700 dark:text-violet-300'>
                        {sm.milestone.name}
                      </span>
                    </div>
                    <Badge
                      variant='secondary'
                      className='text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                    >
                      {tasks.length} tasks
                    </Badge>
                  </div>

                  <div className='space-y-2'>
                    {tasks
                      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                      .map((task) => (
                        <div
                          key={task.id}
                          className='rounded-md border border-violet-200 dark:border-violet-700 bg-white/70 dark:bg-card/50 p-2'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0'>
                              <p className='text-xs font-medium text-foreground truncate'>{task.sequenceOrder}</p>

                              <div className='flex items-center gap-2'>
                                <span className='text-xs font-medium text-foreground truncate'>{task.name}</span>
                                <Badge
                                  variant='outline'
                                  className={`text-[10px] ${
                                    task.detail.status === 'PASS'
                                      ? 'border-green-300 text-green-700'
                                      : task.detail.status === 'FAIL'
                                        ? 'border-red-300 text-red-700'
                                        : 'border-violet-300 text-violet-700'
                                  }`}
                                >
                                  {task.detail.status}
                                </Badge>
                              </div>
                              {task.detail.note && (
                                <div className='flex items-start gap-2 text-xs text-muted-foreground mt-1'>
                                  <StickyNote className='w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0' />
                                  <span className='leading-relaxed'>{task.detail.note}</span>
                                </div>
                              )}
                            </div>
                            <div className='flex items-center gap-2 shrink-0'>
                              {task.detail.image && (
                                <ProductImageViewer
                                  src={task.detail.image}
                                  alt={task.name}
                                  containerClassName='w-16 h-16 rounded-md border-2 border-violet-200 dark:border-violet-700'
                                  imgClassName='p-1'
                                  fit='cover'
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
export default StatusOrderTimeline
