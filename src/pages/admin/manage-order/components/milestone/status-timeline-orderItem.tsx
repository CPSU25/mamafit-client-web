import { useGetStatusTimelineOfOrderItem } from '@/services/admin/manage-milestone.service'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

// Status Timeline Component
interface StatusOrderTimelineProps {
  orderItemId: string
}

function StatusOrderTimeline({ orderItemId }: StatusOrderTimelineProps) {
  const { data: statusTimeline, isLoading } = useGetStatusTimelineOfOrderItem(orderItemId)
  console.log('statusTimeline', statusTimeline?.data[1])
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
      // Nếu đã có Quality Check Failed, hiển thị nó (hoặc milestone tiếp theo nếu nó đã xong)
      if (qualityCheckFailed.progress === 100) {
        // Quality Check Failed đã xong, tìm milestone tiếp theo
        const nextAfterQCFailed = sortedMilestones.find(
          (milestone) =>
            milestone.milestone.sequenceOrder > qualityCheckFailed.milestone.sequenceOrder && milestone.progress === 0
        )
        displayMilestone = nextAfterQCFailed || qualityCheckFailed
      } else {
        // Quality Check Failed chưa xong
        displayMilestone = qualityCheckFailed
      }
    } else {
      // Chưa có Quality Check Failed, hiển thị Quality Check pending
      displayMilestone = qualityCheckPending
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
    // Tất cả milestone đã hoàn thành
    return (
      <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3'>
        <div className='flex items-center space-x-2'>
          <CheckCircle2 className='w-4 h-4 text-green-600 dark:text-green-400' />
          <span className='text-xs font-medium text-green-700 dark:text-green-300'>All milestones completed</span>
        </div>
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

  return (
    <div className={`${bgColor} ${borderColor} rounded-lg p-3 space-y-3 border`}>
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
    </div>
  )
}
export default StatusOrderTimeline
