import { AlertTriangle, MessageSquare, Package, Clock, Eye } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { TicketList, TicketType } from '@/@types/ticket.types'

interface TicketTableProps {
  tickets: TicketList[]
  isLoading?: boolean
  error?: string | null
  onTicketSelect: (ticket: TicketList) => void
}

// Helper functions
const getTicketTypeLabel = (type: TicketType): string => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return 'Bảo hành'
    case 'DELIVERY_SERVICE':
      return 'Giao hàng'
    case 'OTHER':
      return 'Khác'
    default:
      return 'Không xác định'
  }
}

const getTicketTypeIcon = (type: TicketType) => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return Package
    case 'DELIVERY_SERVICE':
      return Clock
    case 'OTHER':
      return AlertTriangle
    default:
      return MessageSquare
  }
}

const getTicketTypeColor = (type: TicketType): string => {
  switch (type) {
    case 'WARRANTY_SERVICE':
      return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
    case 'DELIVERY_SERVICE':
      return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'OTHER':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
  }
}

export function TicketTable({ tickets, isLoading, error, onTicketSelect }: TicketTableProps) {
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
      <div className='rounded-xl border-2 border-violet-200 dark:border-violet-800 overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card shadow-lg'>
        <Table>
          <TableHeader className='bg-gradient-to-r from-violet-100 via-violet-50 to-purple-100 dark:from-violet-950/30 dark:via-violet-950/20 dark:to-purple-950/30'>
            <TableRow className='border-b border-violet-200 dark:border-violet-800'>
              <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Loại</TableHead>
              <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Tiêu đề</TableHead>
              <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Mô tả</TableHead>
              <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Đơn hàng</TableHead>
              <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i} className='border-b border-violet-200 dark:border-violet-800'>
                <TableCell>
                  <div className='h-6 w-20 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-6 w-32 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-6 w-40 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-6 w-24 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-8 w-20 bg-muted rounded animate-pulse' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className='rounded-xl border-2 border-violet-200 dark:border-violet-800 overflow-hidden bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card shadow-lg'>
      <Table>
        <TableHeader className='bg-gradient-to-r from-violet-100 via-violet-50 to-purple-100 dark:from-violet-950/30 dark:via-violet-950/20 dark:to-purple-950/30'>
          <TableRow className='border-b border-violet-200 dark:border-violet-800'>
            <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Loại</TableHead>
            <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Tiêu đề</TableHead>
            <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Mô tả</TableHead>
            <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Đơn hàng</TableHead>
            <TableHead className='text-violet-700 dark:text-violet-300 font-semibold'>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            const TypeIcon = getTicketTypeIcon(ticket.type)
            return (
              <TableRow
                key={ticket.id}
                className='border-b border-violet-200 dark:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'
              >
                <TableCell>
                  <Badge className={`${getTicketTypeColor(ticket.type)} flex items-center gap-1`}>
                    <TypeIcon className='h-3 w-3' />
                    {getTicketTypeLabel(ticket.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='font-medium'>{ticket.title}</div>
                </TableCell>
                <TableCell>
                  <div className='max-w-xs truncate text-muted-foreground'>{ticket.description}</div>
                </TableCell>
                <TableCell>
                  <div className='text-sm text-muted-foreground'>#{ticket.order.code || 'N/A'}</div>
                </TableCell>
                <TableCell>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onTicketSelect(ticket)}
                    className='flex items-center gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    Xem chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
