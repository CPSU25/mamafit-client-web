import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Phone,
  User,
  Calendar,
  DollarSign,
  ArrowRight,
  Building2,
  Factory
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { RequestTypeBadge } from './RequestTypeBadge'
import { WarrantyRequestCardProps } from '../types'
import { StatusWarrantyRequest, DestinationType } from '@/@types/warranty-request.types'

const getStatusIcon = (status: StatusWarrantyRequest) => {
  switch (status) {
    case StatusWarrantyRequest.PENDING:
      return <Clock className='w-4 h-4 text-amber-600 dark:text-amber-400' />
    case StatusWarrantyRequest.APPROVED:
    case StatusWarrantyRequest.COMPLETED:
      return <CheckCircle className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
    case StatusWarrantyRequest.REJECTED:
      return <XCircle className='w-4 h-4 text-red-600 dark:text-red-400' />
    case StatusWarrantyRequest.PARTIALLY_REJECTED:
      return <AlertTriangle className='w-4 h-4 text-orange-600 dark:text-orange-400' />
    default:
      return <Clock className='w-4 h-4 text-gray-600 dark:text-gray-400' />
  }
}

const getDestinationInfo = (destinationType: DestinationType) => {
  switch (destinationType) {
    case DestinationType.BRANCH:
      return {
        icon: <Building2 className='w-4 h-4' />,
        label: 'Chi nhánh',
        className:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800'
      }
    case DestinationType.FACTORY:
      return {
        icon: <Factory className='w-4 h-4' />,
        label: 'Xưởng sản xuất',
        className:
          'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-800'
      }
    default:
      return {
        icon: <Building2 className='w-4 h-4' />,
        label: 'Chưa xác định',
        className:
          'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800'
      }
  }
}

const getCardStyles = (status: StatusWarrantyRequest) => {
  switch (status) {
    case StatusWarrantyRequest.PENDING:
      return {
        gradient:
          'from-amber-50 via-white to-amber-50/50 dark:from-amber-950/10 dark:via-background dark:to-amber-950/5',
        border: 'border-amber-200 dark:border-amber-800',
        accent: 'bg-amber-400 dark:bg-amber-500'
      }
    case StatusWarrantyRequest.APPROVED:
      return {
        gradient:
          'from-violet-50 via-white to-violet-50/50 dark:from-violet-950/10 dark:via-background dark:to-violet-950/5',
        border: 'border-violet-200 dark:border-violet-800',
        accent: 'bg-violet-400 dark:bg-violet-500'
      }
    case StatusWarrantyRequest.REPAIRING:
      return {
        gradient: 'from-blue-50 via-white to-blue-50/50 dark:from-blue-950/10 dark:via-background dark:to-blue-950/5',
        border: 'border-blue-200 dark:border-blue-800',
        accent: 'bg-blue-400 dark:bg-blue-500'
      }
    case StatusWarrantyRequest.COMPLETED:
      return {
        gradient:
          'from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/10 dark:via-background dark:to-emerald-950/5',
        border: 'border-emerald-200 dark:border-emerald-800',
        accent: 'bg-emerald-400 dark:bg-emerald-500'
      }
    case StatusWarrantyRequest.REJECTED:
    case StatusWarrantyRequest.PARTIALLY_REJECTED:
      return {
        gradient: 'from-red-50 via-white to-red-50/50 dark:from-red-950/10 dark:via-background dark:to-red-950/5',
        border: 'border-red-200 dark:border-red-800',
        accent: 'bg-red-400 dark:bg-red-500'
      }
    default:
      return {
        gradient: 'from-gray-50 via-white to-gray-50/50 dark:from-gray-950/10 dark:via-background dark:to-gray-950/5',
        border: 'border-gray-200 dark:border-gray-800',
        accent: 'bg-gray-400 dark:bg-gray-500'
      }
  }
}

export const WarrantyRequestCard = ({ request, onViewDetail }: WarrantyRequestCardProps) => {
  const canQuickAction = request.status === StatusWarrantyRequest.PENDING
  const cardStyles = getCardStyles(request.status)

  return (
    <Card
      className={`group relative overflow-hidden bg-gradient-to-br ${cardStyles.gradient} ${cardStyles.border} border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Status Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${cardStyles.accent}`}></div>

      {/* Hover Glow Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-violet-400/0 via-purple-400/0 to-violet-400/0 group-hover:from-violet-400/5 group-hover:via-purple-400/3 group-hover:to-violet-400/5 dark:group-hover:from-violet-600/10 dark:group-hover:via-purple-600/5 dark:group-hover:to-violet-600/10 transition-all duration-300 rounded-lg'></div>

      <CardHeader className='pb-4 relative'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 backdrop-blur-sm'>
                {getStatusIcon(request.status)}
              </div>
              <div className='flex-1 min-w-0'>
                <CardTitle className='text-xl font-bold text-gray-900 dark:text-gray-100 truncate'>
                  {request.sku}
                </CardTitle>
                <div className='flex items-center gap-2 mt-1'>
                  <Calendar className='w-3 h-3 text-gray-400 dark:text-gray-500' />
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    {new Date(request.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2 items-end'>
            <StatusBadge status={request.status} />
            <RequestTypeBadge type={request.requestType} />
            {/* Destination Type Badge */}
            {(() => {
              const destinationInfo = getDestinationInfo(request.destinationType)
              return (
                <Badge
                  variant='outline'
                  className={`${destinationInfo.className} border flex items-center gap-1.5 px-2 py-1 text-xs font-medium`}
                >
                  {destinationInfo.icon}
                  {destinationInfo.label}
                </Badge>
              )
            })()}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0 space-y-4 relative'>
        {/* Customer Info */}
        <div className='bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 dark:border-gray-700/50 shadow-sm'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-violet-600 dark:text-violet-400' />
              <span className='font-medium text-gray-900 dark:text-gray-100 truncate'>{request.customer.fullName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-4 h-4 text-violet-600 dark:text-violet-400' />
              <span className='text-gray-600 dark:text-gray-300 text-sm'>{request.customer.phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg border border-white/50 dark:border-gray-700/50 shadow-sm'>
            <div className='flex items-center gap-2 mb-1'>
              <Package className='w-4 h-4 text-violet-600 dark:text-violet-400' />
              <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium'>
                Sản phẩm
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{request.countItem}</div>
          </div>
          <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg border border-white/50 dark:border-gray-700/50 shadow-sm'>
            <div className='flex items-center gap-2 mb-1'>
              <DollarSign className='w-4 h-4 text-violet-600 dark:text-violet-400' />
              <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium'>
                Tổng phí
              </div>
            </div>
            <div className='text-lg font-bold text-violet-700 dark:text-violet-300'>
              {request.totalFee ? `${request.totalFee.toLocaleString('vi-VN')}₫` : 'Miễn phí'}
            </div>
          </div>
        </div>

        <Separator className='opacity-30 dark:opacity-20' />

        {/* Action Buttons */}
        <div className='space-y-3'>
          {/* Main View Detail Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => onViewDetail(request)}
            className='w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-600 font-medium shadow-sm group'
          >
            <Eye className='w-4 h-4 mr-2' />
            {canQuickAction ? 'Xử lý chi tiết' : 'Xem chi tiết'}
            <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
