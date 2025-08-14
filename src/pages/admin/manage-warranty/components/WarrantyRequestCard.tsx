import { Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from './StatusBadge'
import { RequestTypeBadge } from './RequestTypeBadge'
import { WarrantyRequestCardProps } from '../types'
import { StatusWarrantyRequest } from '@/@types/warranty-request.types'

const getStatusIcon = (status: StatusWarrantyRequest) => {
  switch (status) {
    case StatusWarrantyRequest.PENDING:
      return <Clock className='w-4 h-4 text-amber-600' />
    case StatusWarrantyRequest.APPROVED:
    case StatusWarrantyRequest.COMPLETED:
      return <CheckCircle className='w-4 h-4 text-green-600' />
    case StatusWarrantyRequest.REJECTED:
      return <XCircle className='w-4 h-4 text-red-600' />
    case StatusWarrantyRequest.PARTIALLY_REJECTED:
      return <AlertTriangle className='w-4 h-4 text-orange-600' />
    default:
      return <Clock className='w-4 h-4 text-gray-600' />
  }
}

const getCardBorderColor = (status: StatusWarrantyRequest) => {
  switch (status) {
    case StatusWarrantyRequest.PENDING:
      return 'border-l-amber-400'
    case StatusWarrantyRequest.APPROVED:
      return 'border-l-emerald-400'
    case StatusWarrantyRequest.REPAIRING:
      return 'border-l-orange-400'
    case StatusWarrantyRequest.COMPLETED:
      return 'border-l-green-400'
    case StatusWarrantyRequest.REJECTED:
    case StatusWarrantyRequest.PARTIALLY_REJECTED:
      return 'border-l-red-400'
    default:
      return 'border-l-gray-400'
  }
}

export const WarrantyRequestCard = ({ request, onViewDetail }: WarrantyRequestCardProps) => {
  const canQuickAction = request.status === StatusWarrantyRequest.PENDING

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-l-4 ${getCardBorderColor(request.status)} bg-gradient-to-br from-white to-gray-50/30`}
    >
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              {getStatusIcon(request.status)}
              <CardTitle className='text-xl font-bold text-gray-900 truncate'>{request.sku}</CardTitle>
            </div>
            <CardDescription className='text-sm text-gray-600'>
              <div className='space-y-1'>
                <div>👤 {request.customer.fullName}</div>
                <div>📞 {request.customer.phoneNumber}</div>
              </div>
            </CardDescription>
          </div>
          <div className='flex flex-col gap-2 items-end'>
            <StatusBadge status={request.status} />
            <RequestTypeBadge type={request.requestType} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0 space-y-4'>
        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='bg-white p-3 rounded-lg border border-gray-100'>
            <div className='text-xs text-gray-500 uppercase tracking-wide'>Sản phẩm</div>
            <div className='text-lg font-semibold text-gray-900'>{request.countItem}</div>
          </div>
          <div className='bg-white p-3 rounded-lg border border-gray-100'>
            <div className='text-xs text-gray-500 uppercase tracking-wide'>Tổng phí</div>
            <div className='text-lg font-semibold text-violet-700'>
              {request.totalFee ? `${request.totalFee.toLocaleString('vi-VN')}₫` : 'Chưa định'}
            </div>
          </div>
        </div>

        {/* Date */}
        <div className='text-xs text-gray-500'>
          📅 Tạo ngày:{' '}
          {new Date(request.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className='space-y-2'>
          {/* Quick Actions for PENDING status */}
          {canQuickAction && (
            <div className='flex gap-2'>
              <Button
                size='sm'
                className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                onClick={() => {
                  // TODO: Quick approve handler
                  console.log('Quick approve:', request.id)
                }}
              >
                <CheckCircle className='w-4 h-4 mr-1' />
                Duyệt nhanh
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='flex-1'
                onClick={() => {
                  // TODO: Quick reject handler
                  console.log('Quick reject:', request.id)
                }}
              >
                <XCircle className='w-4 h-4 mr-1' />
                Từ chối
              </Button>
            </div>
          )}

          {/* Main Actions */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onViewDetail(request)}
              className='flex-1 text-violet-700 border-violet-200 hover:bg-violet-50 font-medium'
            >
              <Eye className='w-4 h-4 mr-2' />
              {canQuickAction ? 'Xử lý' : 'Xem chi tiết'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
