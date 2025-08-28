
import { AlertTriangle, MessageSquare } from 'lucide-react'
import { TicketCard } from './ticket-card'
import type { TicketList } from '@/@types/ticket.types'

interface TicketGridProps {
  tickets: TicketList[]
  isLoading?: boolean
  error?: string | null
  onTicketSelect: (ticket: TicketList) => void
}

export function TicketGrid({ tickets, isLoading, error, onTicketSelect }: TicketGridProps) {
  if (error) {
    return (
      <div className='rounded-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-950/10 dark:to-card'>
        <div className='flex items-center justify-center h-48'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto'>
              <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>
            <div>
              <p className='text-red-700 dark:text-red-300 mb-2 font-semibold text-lg'>
                Không thể tải danh sách ticket
              </p>
              <p className='text-red-600 dark:text-red-400 text-sm max-w-md'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className='rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card p-6 space-y-4'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-muted rounded-lg animate-pulse' />
                <div className='space-y-2'>
                  <div className='h-5 w-32 bg-muted rounded animate-pulse' />
                  <div className='h-4 w-20 bg-muted rounded animate-pulse' />
                </div>
              </div>
              <div className='h-8 w-24 bg-muted rounded animate-pulse' />
            </div>
            <div className='space-y-2'>
              <div className='h-4 w-full bg-muted rounded animate-pulse' />
              <div className='h-4 w-3/4 bg-muted rounded animate-pulse' />
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-4 w-20 bg-muted rounded animate-pulse' />
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className='rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card shadow-lg'>
        <div className='flex items-center justify-center h-48'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto'>
              <MessageSquare className='h-8 w-8 text-violet-600 dark:text-violet-400' />
            </div>
            <div>
              <p className='text-violet-700 dark:text-violet-300 mb-2 font-semibold text-lg'>Chưa có ticket nào</p>
              <p className='text-violet-600 dark:text-violet-400 text-sm max-w-md'>
                Hiện tại chưa có ticket báo cáo nào từ khách hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onTicketSelect={onTicketSelect} />
      ))}
    </div>
  )
}
