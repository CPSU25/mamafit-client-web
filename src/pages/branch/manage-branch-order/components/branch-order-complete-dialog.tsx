import { useState } from 'react'
import { BranchOrderType } from '@/@types/branch-order.types'
import { OrderStatus } from '@/@types/manage-order.types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Star } from 'lucide-react'
import { toast } from 'sonner'

interface BranchOrderCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: BranchOrderType | null
}

export function BranchOrderCompleteDialog({ open, onOpenChange, order }: BranchOrderCompleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState('')

  if (!order) return null

  const handleCompleteOrder = async () => {
    try {
      setIsLoading(true)

      // TODO: Gọi API để hoàn thành đơn hàng
      // await completeBranchOrder(order.id, { notes })

      toast.success('Đã hoàn thành đơn hàng thành công')
      onOpenChange(false)

      // Refresh data if needed
      // queryClient.invalidateQueries(['branch-orders'])
    } catch (error) {
      console.error('Error completing order:', error)
      toast.error('Có lỗi xảy ra khi hoàn thành đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const canComplete = [OrderStatus.DELIVERING, OrderStatus.PICKUP_IN_PROGRESS, OrderStatus.RECEIVED_AT_BRANCH].includes(
    order.status
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5 text-green-600' />
            Hoàn thành đơn hàng
          </DialogTitle>
          <DialogDescription>
            Xác nhận rằng khách hàng đã nhận hàng hoặc dịch vụ bảo hành đã hoàn thành tại cửa hàng.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Order Info */}
          <div className='bg-green-50 dark:bg-green-950/20 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='font-semibold text-sm'>Mã đơn hàng:</span>
              <Badge variant='outline' className='font-mono'>
                #{order.code}
              </Badge>
            </div>
            <div className='flex items-center justify-between mb-2'>
              <span className='font-semibold text-sm'>Loại đơn hàng:</span>
              <Badge variant='secondary' className='text-xs'>
                {order.type === 'NORMAL'
                  ? 'Đơn hàng thường'
                  : order.type === 'WARRANTY'
                    ? 'Đơn bảo hành'
                    : 'Yêu cầu thiết kế'}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-sm'>Trạng thái hiện tại:</span>
              <Badge variant='secondary' className='text-xs'>
                {order.status === OrderStatus.DELIVERING
                  ? 'Đang giao hàng'
                  : order.status === OrderStatus.PICKUP_IN_PROGRESS
                    ? 'Đang lấy hàng'
                    : order.status === OrderStatus.RECEIVED_AT_BRANCH
                      ? 'Đã nhận tại cửa hàng'
                      : order.status}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-sm'>Tổng tiền:</span>
              <span className='font-bold text-green-600'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.totalAmount || 0)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes' className='text-sm font-medium'>
              Ghi chú hoàn thành (tùy chọn)
            </Label>
            <Textarea
              id='notes'
              placeholder='Thêm ghi chú về việc giao hàng hoặc dịch vụ bảo hành...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className='min-h-[80px]'
            />
          </div>

          {!canComplete && (
            <div className='bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3'>
              <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                ⚠️ Đơn hàng chưa ở trạng thái có thể hoàn thành
              </p>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleCompleteOrder}
            disabled={isLoading || !canComplete}
            className='bg-green-600 hover:bg-green-700'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 className='h-4 w-4 mr-2' />
                Hoàn thành đơn hàng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
