import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Package, Truck, Calendar, MapPin, DollarSign, Weight, Hash } from 'lucide-react'
import { GHTKOrder, GHTK_STATUS } from '@/@types/ghtk.types'

interface DeliveryOrderDisplayProps {
  order: GHTKOrder
  className?: string
}

export const DeliveryOrderDisplay: React.FC<DeliveryOrderDisplayProps> = ({ order, className }) => {
  const status = GHTK_STATUS[order.statusId] || { label: 'Không xác định', color: 'gray' }

  const getStatusBadgeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colorMap[color] || colorMap.gray
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(amount))
  }

  const totalWeight = order.products.reduce((sum, product) => sum + product.weight * product.quantity, 0)
  const totalValue = order.products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
    <Card className={`overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 ${className}`}>
      <CardHeader className='bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-green-800'>
            <Truck className='h-5 w-5' />
            Đơn giao hàng GHTK
          </CardTitle>
          <Badge className={getStatusBadgeColor(status.color)}>{status.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className='p-6 space-y-6'>
        {/* Thông tin cơ bản */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <Hash className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Mã đơn hàng:</span>
              <code className='bg-white px-2 py-1 rounded border text-xs font-mono'>{order.label}</code>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <Hash className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Tracking ID:</span>
              <code className='bg-white px-2 py-1 rounded border text-xs font-mono'>{order.trackingId}</code>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Khu vực:</span>
              <span>Khu vực {order.area}</span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-2 text-sm'>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Phí vận chuyển:</span>
              <span className='font-semibold text-green-700'>{formatCurrency(order.fee)}</span>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Phí bảo hiểm:</span>
              <span>{formatCurrency(order.insuranceFee)}</span>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <Weight className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Tổng khối lượng:</span>
              <span>{totalWeight}g</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Thời gian dự kiến */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-white/60 p-4 rounded-lg border border-green-100'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='h-4 w-4 text-blue-600' />
              <span className='font-medium text-blue-800'>Thời gian lấy hàng</span>
            </div>
            <p className='text-sm text-blue-700 font-semibold'>{order.estimatedPickTime}</p>
          </div>

          <div className='bg-white/60 p-4 rounded-lg border border-green-100'>
            <div className='flex items-center gap-2 mb-2'>
              <Calendar className='h-4 w-4 text-green-600' />
              <span className='font-medium text-green-800'>Thời gian giao hàng</span>
            </div>
            <p className='text-sm text-green-700 font-semibold'>{order.estimatedDeliverTime}</p>
          </div>
        </div>

        <Separator />

        {/* Thông tin sản phẩm */}
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <Package className='h-4 w-4 text-muted-foreground' />
            <span className='font-medium'>Sản phẩm ({order.products.length} mặt hàng)</span>
          </div>

          <div className='space-y-2'>
            {order.products.map((product, index) => (
              <div key={index} className='bg-white/80 p-3 rounded-md border border-green-100'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-sm'>{product.name}</h4>
                    <div className='flex items-center gap-4 text-xs text-muted-foreground mt-1'>
                      <span>Khối lượng: {product.weight}g</span>
                      <span>Số lượng: {product.quantity}</span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-sm'>{formatCurrency(product.price.toString())}</p>
                    <p className='text-xs text-muted-foreground'>/ sản phẩm</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng kết */}
          <div className='mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200'>
            <div className='flex justify-between items-center'>
              <span className='font-medium text-green-800'>Tổng giá trị đơn hàng:</span>
              <span className='font-bold text-green-800 text-lg'>{formatCurrency(totalValue.toString())}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
