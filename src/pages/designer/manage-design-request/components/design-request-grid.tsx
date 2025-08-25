import { DesignRequestCard } from './design-request-card'
import { ExtendedOrderTaskItem } from '../types'

interface DesignRequestGridProps {
  requests: ExtendedOrderTaskItem[]
  onViewDetail: (request: ExtendedOrderTaskItem) => void
  onStartChat: (request: ExtendedOrderTaskItem) => void
  onQuickStart: (request: ExtendedOrderTaskItem) => void
  onComplete: (request: ExtendedOrderTaskItem) => void
}

export const DesignRequestGrid = ({
  requests,
  onViewDetail,
  onStartChat,
  onQuickStart,
  onComplete
}: DesignRequestGridProps) => {
  if (requests.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4'>
          <svg className='w-12 h-12 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-muted-foreground mb-2'>Không có yêu cầu thiết kế</h3>
        <p className='text-sm text-muted-foreground'>Hiện tại không có yêu cầu thiết kế nào để hiển thị</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {requests.map((request) => (
        <DesignRequestCard
          key={request.orderItem.id}
          request={request}
          onViewDetail={onViewDetail}
          onStartChat={onStartChat}
          onQuickStart={onQuickStart}
          onComplete={onComplete}
        />
      ))}
    </div>
  )
}
