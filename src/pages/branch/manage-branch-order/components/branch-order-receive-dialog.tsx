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
import { Package, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useReceiveAtBranch } from '@/services/branch/branch-order.service'

interface BranchOrderReceiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: BranchOrderType | null
}

export function BranchOrderReceiveDialog({ open, onOpenChange, order }: BranchOrderReceiveDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync } = useReceiveAtBranch(order?.id || '')
  if (!order) return null

  const handleReceiveOrder = async () => {
    try {
      setIsLoading(true)

      await mutateAsync()

      toast.success('Đã xác nhận nhận hàng thành công')
      onOpenChange(false)

      // Refresh data if needed
      // queryClient.invalidateQueries(['branch-orders'])
    } catch (error) {
      console.error('Error receiving order:', error)
      toast.error('Có lỗi xảy ra khi xác nhận nhận hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const canReceive = order.status === OrderStatus.DELIVERING || order.status === OrderStatus.PICKUP_IN_PROGRESS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-violet-600' />
            Xác nhận nhận hàng
          </DialogTitle>
          <DialogDescription>
            Xác nhận rằng đơn hàng đã được giao đến cửa hàng và sẵn sàng để khách hàng nhận.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Order Info */}
          <div className='bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='font-semibold text-sm'>Mã đơn hàng:</span>
              <Badge variant='outline' className='font-mono'>
                #{order.code}
              </Badge>
            </div>
            <div className='flex items-center justify-between mb-2'>
              <span className='font-semibold text-sm'>Trạng thái hiện tại:</span>
              <Badge variant='secondary' className='text-xs'>
                {order.status === 'DELIVERING'
                  ? 'Đang giao hàng'
                  : order.status === 'PICKUP_IN_PROGRESS'
                    ? 'Đang lấy hàng'
                    : order.status}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-semibold text-sm'>Tổng tiền:</span>
              <span className='font-bold text-violet-600'>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.totalAmount || 0)}
              </span>
            </div>
          </div>

          {!canReceive && (
            <div className='bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3'>
              <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                ⚠️ Đơn hàng chưa ở trạng thái có thể nhận hàng
              </p>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleReceiveOrder}
            disabled={isLoading || !canReceive}
            className='bg-violet-600 hover:bg-violet-700'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className='h-4 w-4 mr-2' />
                Xác nhận nhận hàng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
