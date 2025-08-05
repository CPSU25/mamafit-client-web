import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { GHTKOrder } from '@/@types/ghtk.types'
import { DeliveryOrderDisplay } from './delivery-order-display'

interface DeliveryOrderSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: GHTKOrder | null
  message?: string
}

export const DeliveryOrderSuccessDialog: React.FC<DeliveryOrderSuccessDialogProps> = ({
  open,
  onOpenChange,
  order,
  message
}) => {
  if (!order) return null

  const handleCopyTrackingId = () => {
    navigator.clipboard.writeText(order.trackingId.toString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle2 className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <DialogTitle className='text-xl text-green-800'>Đơn giao hàng đã được tạo thành công!</DialogTitle>
              {message && <p className='text-sm text-muted-foreground mt-1'>{message}</p>}
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Thông tin tracking nhanh */}
          <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <div>
              <p className='text-sm text-blue-700 font-medium'>Mã theo dõi đơn hàng</p>
              <p className='text-lg font-mono font-bold text-blue-900'>{order.trackingId}</p>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={handleCopyTrackingId} className='gap-2'>
                Sao chép mã
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() =>
                  window.open(`https://ghtk.vn/khachhang/tra-cuu-don-hang?tracking_id=${order.trackingId}`, '_blank')
                }
              >
                <ExternalLink className='h-4 w-4' />
                Theo dõi
              </Button>
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <DeliveryOrderDisplay order={order} />

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
