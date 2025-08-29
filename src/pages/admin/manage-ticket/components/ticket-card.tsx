import { AlertTriangle, MessageSquare, Package, Clock, Eye, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import type { TicketList, TicketType } from '@/@types/ticket.types'

interface TicketCardProps {
  ticket: TicketList
  onTicketSelect: (ticket: TicketList) => void
}

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

export function TicketCard({ ticket, onTicketSelect }: TicketCardProps) {
  const TypeIcon = getTicketTypeIcon(ticket.type)
  const hasMedia = ticket.images.length > 0 || ticket.videos.length > 0

  return (
    <Card className='hover:shadow-lg transition-all duration-300 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-card dark:via-violet-950/10 dark:to-card'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg ${getTicketTypeColor(ticket.type)}`}>
              <TypeIcon className='h-5 w-5' />
            </div>
            <div>
              <h3 className='font-semibold text-lg'>{ticket.title}</h3>
              <Badge className={`${getTicketTypeColor(ticket.type)} mt-2`}>
                <TypeIcon className='h-3 w-3 mr-1' />
                {getTicketTypeLabel(ticket.type)}
              </Badge>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onTicketSelect(ticket)}
            className='flex items-center gap-2 shrink-0'
          >
            <Eye className='h-4 w-4' />
            Xem chi tiết
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Description */}
        <div>
          <p className='text-sm text-muted-foreground'>{ticket.description}</p>
        </div>

        {/* Order Info */}
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <MessageSquare className='h-4 w-4' />
            <span>#{ticket.order.code || 'N/A'}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4' />
            <span>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Media Preview */}
        {hasMedia && (
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-muted-foreground'>Tài liệu:</span>
            {ticket.images.length > 0 && (
              <Badge variant='outline' className='text-xs'>
                {ticket.images.length} ảnh
              </Badge>
            )}
            {ticket.videos.length > 0 && (
              <Badge variant='outline' className='text-xs'>
                {ticket.videos.length} video
              </Badge>
            )}
          </div>
        )}

        {/* Status */}
        <div className='flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700'>
          <div className='text-xs text-muted-foreground'>Tạo bởi: {ticket.createdBy || 'N/A'}</div>
          <div className='flex items-center gap-2'>
            {ticket.status && (
              <Badge variant='secondary' className='text-xs'>
                {ticket.status}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
