import { OrderType } from '@/@types/admin.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { orderStatusOptions, paymentStatusOptions, getStatusColor, getStatusLabel } from '../data/data'
import { useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface OrderUpdateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderType | null
}

export function OrderUpdateStatusDialog({ open, onOpenChange, order }: OrderUpdateStatusDialogProps) {
  const [orderStatus, setOrderStatus] = useState(order?.status || '')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || '')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!order) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // TODO: Implement actual API call
      console.log('Updating order status:', {
        orderId: order.id,
        orderStatus,
        paymentStatus,
        notes
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onOpenChange(false)
      // TODO: Show success toast
      // TODO: Refetch orders data
    } catch (error) {
      console.error('Error updating order status:', error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOrderStatus(order?.status || '')
    setPaymentStatus(order?.paymentStatus || '')
    setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onOpenChange(false)}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <CheckCircle className='h-5 w-5 text-blue-600' />
            <span>Cập nhật trạng thái đơn hàng</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Current Status Display */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Đơn hàng #{order.code}</Label>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-muted-foreground'>Trạng thái hiện tại:</span>
              <Badge variant='secondary' className={`text-xs ${getStatusColor(order.status, 'order')}`}>
                {getStatusLabel(order.status, 'order')}
              </Badge>
              <span className='text-muted-foreground'>|</span>
              <Badge variant='secondary' className={`text-xs ${getStatusColor(order.paymentStatus || '', 'payment')}`}>
                {getStatusLabel(order.paymentStatus || '', 'payment')}
              </Badge>
            </div>
          </div>

          {/* Order Status Update */}
          <div className='space-y-2'>
            <Label htmlFor='order-status'>Trạng thái đơn hàng mới</Label>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn trạng thái...' />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className='flex items-center space-x-2'>
                      <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Update */}
          <div className='space-y-2'>
            <Label htmlFor='payment-status'>Trạng thái thanh toán mới</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn trạng thái thanh toán...' />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className='flex items-center space-x-2'>
                      <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`} />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Ghi chú (tùy chọn)</Label>
            <Textarea
              id='notes'
              placeholder='Thêm ghi chú về việc cập nhật trạng thái...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning if status change affects workflow */}
          {(orderStatus === 'CANCELLED' || orderStatus === 'RETURNED') && (
            <div className='flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5' />
              <div className='text-sm'>
                <p className='font-medium text-yellow-800'>Lưu ý quan trọng</p>
                <p className='text-yellow-700'>
                  Thay đổi trạng thái này có thể ảnh hưởng đến quy trình xử lý đơn hàng.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex space-x-2'>
          <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!orderStatus && !paymentStatus)}
            className='min-w-[100px]'
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
