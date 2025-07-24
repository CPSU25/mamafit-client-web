import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { VoucherBatch } from '../data/schema'
import { toast } from 'sonner'
import { useDeleteVoucherBatch } from '@/services/admin/manage-voucher.service'
import dayjs from 'dayjs'

interface VoucherBatchDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VoucherBatch | null
}

export function VoucherBatchDeleteDialog({ open, onOpenChange, currentRow }: VoucherBatchDeleteDialogProps) {
  const deleteVoucherBatchMutation = useDeleteVoucherBatch()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await deleteVoucherBatchMutation.mutateAsync(currentRow.id)
      toast.success('Xóa lô voucher thành công!')
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error deleting voucher batch:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa lô voucher'
      toast.error(errorMessage)
    }
  }

  if (!currentRow) return null

  // Calculate status for better context
  const now = dayjs()
  const start = dayjs(currentRow.startDate)
  const end = dayjs(currentRow.endDate)

  let statusLabel = 'Đang hoạt động'
  let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'

  if (currentRow.remainingQuantity === 0) {
    statusLabel = 'Hết voucher'
    statusVariant = 'destructive'
  } else if (now.isBefore(start)) {
    statusLabel = 'Chưa bắt đầu'
    statusVariant = 'secondary'
  } else if (now.isAfter(end)) {
    statusLabel = 'Hết hạn'
    statusVariant = 'outline'
  }

  const isLoading = deleteVoucherBatchMutation.isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa lô voucher</AlertDialogTitle>
          <AlertDialogDescription className='space-y-3'>
            <div>
              Bạn có chắc chắn muốn xóa lô voucher này? Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn lô voucher
              cùng tất cả voucher con liên quan.
            </div>

            <div className='rounded-lg border p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{currentRow.batchName}</span>
                <Badge variant={statusVariant} className='text-xs'>
                  {statusLabel}
                </Badge>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Mã lô:</span>
                  <div className='font-mono'>{currentRow.batchCode}</div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Số lượng còn lại:</span>
                  <div className='font-medium'>
                    {currentRow.remainingQuantity.toLocaleString('vi-VN')} /{' '}
                    {currentRow.totalQuantity.toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Thời gian:</span>
                  <div>
                    {dayjs(currentRow.startDate).format('DD/MM/YYYY')} -{' '}
                    {dayjs(currentRow.endDate).format('DD/MM/YYYY')}
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Giá trị giảm giá:</span>
                  <div className='font-medium'>
                    {currentRow.discountType === 'PERCENTAGE'
                      ? `${currentRow.discountValue}%`
                      : `${currentRow.discountValue.toLocaleString('vi-VN')} VND`}
                  </div>
                </div>
              </div>

              {currentRow.description && (
                <div>
                  <span className='text-muted-foreground text-sm'>Mô tả:</span>
                  <div className='text-sm'>{currentRow.description}</div>
                </div>
              )}
            </div>

            <div className='text-sm text-destructive font-medium'>
              ⚠️ Cảnh báo: Xóa lô voucher sẽ vô hiệu hóa tất cả voucher đã được tạo ra từ lô này.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa lô voucher'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
