import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoucherBatch, VoucherDiscount } from '../data/schema'
import { useVoucher } from '../contexts/voucher-context'
import { Ticket, Calendar, User, Tag, Hash, FileText, Clock, UserCheck } from 'lucide-react'
import dayjs from 'dayjs'

interface VoucherViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucherBatch: VoucherBatch | null
  voucherDiscount: VoucherDiscount | null
}

export function VoucherViewDialog({ open, onOpenChange, voucherBatch, voucherDiscount }: VoucherViewDialogProps) {
  const { setOpen, setCurrentVoucherBatch, setCurrentVoucherDiscount } = useVoucher()

  const handleAssignVoucher = () => {
    if (voucherBatch) {
      setCurrentVoucherBatch(voucherBatch)
      setOpen('assign-voucher')
    }
  }

  const handleDelete = () => {
    if (voucherBatch) {
      setCurrentVoucherBatch(voucherBatch)
      setOpen('delete-batch')
    } else if (voucherDiscount) {
      setCurrentVoucherDiscount(voucherDiscount)
      setOpen('delete-discount')
    }
  }

  const isVoucherBatch = !!voucherBatch
  const data = voucherBatch || voucherDiscount

  if (!data) return null

  // Calculate status for voucher batch
  let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
  let statusLabel = 'Đang hoạt động'

  if (isVoucherBatch && voucherBatch) {
    const now = dayjs()
    const start = dayjs(voucherBatch.startDate)
    const end = dayjs(voucherBatch.endDate)

    if (voucherBatch.remainingQuantity === 0) {
      statusVariant = 'destructive'
      statusLabel = 'Hết voucher'
    } else if (now.isBefore(start)) {
      statusVariant = 'secondary'
      statusLabel = 'Chưa bắt đầu'
    } else if (now.isAfter(end)) {
      statusVariant = 'outline'
      statusLabel = 'Hết hạn'
    }
  }

  // Calculate status for voucher discount
  if (!isVoucherBatch && voucherDiscount) {
    if (voucherDiscount.isDeleted) {
      statusVariant = 'destructive'
      statusLabel = 'Vô hiệu hóa'
    } else {
      switch (voucherDiscount.status) {
        case 'AVAILABLE':
          statusVariant = 'default'
          statusLabel = 'Khả dụng'
          break
        case 'USED':
          statusVariant = 'secondary'
          statusLabel = 'Đã sử dụng'
          break
        case 'EXPIRED':
          statusVariant = 'outline'
          statusLabel = 'Hết hạn'
          break
        case 'DISABLED':
          statusVariant = 'destructive'
          statusLabel = 'Vô hiệu hóa'
          break
        default:
          statusVariant = 'secondary'
          statusLabel = 'N/A'
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ticket className='h-5 w-5 text-purple-600' />
            {isVoucherBatch ? 'Thông tin lô voucher' : 'Thông tin voucher'}
          </DialogTitle>
          <DialogDescription>
            {isVoucherBatch
              ? 'Xem chi tiết thông tin lô voucher và các thiết lập giảm giá'
              : 'Xem chi tiết thông tin voucher và trạng thái sử dụng'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header Info */}
          <div className='rounded-lg border p-4 space-y-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isVoucherBatch ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'
                  }`}
                >
                  <Ticket className={`h-6 w-6 ${isVoucherBatch ? 'text-orange-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    {isVoucherBatch ? voucherBatch?.batchName : voucherDiscount?.code}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {isVoucherBatch ? voucherBatch?.batchCode : `Batch: ${voucherDiscount?.voucherBatchId.slice(-8)}`}
                  </p>
                </div>
              </div>
              <Badge variant={statusVariant} className='text-sm'>
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* Voucher Batch Details */}
          {isVoucherBatch && voucherBatch && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <FileText className='h-4 w-4' />
                    Mô tả
                  </div>
                  <p className='text-sm font-medium'>{voucherBatch.description}</p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='h-4 w-4' />
                    Loại giảm giá
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {voucherBatch.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 'Số tiền cố định'}
                  </Badge>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Hash className='h-4 w-4' />
                    Giá trị giảm giá
                  </div>
                  <p className='text-lg font-semibold text-purple-600'>
                    {voucherBatch.discountType === 'PERCENTAGE'
                      ? `${voucherBatch.discountValue}%`
                      : `${voucherBatch.discountValue.toLocaleString('vi-VN')} VND`}
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <User className='h-4 w-4' />
                    Số lượng
                  </div>
                  <p className='text-lg font-semibold'>
                    {voucherBatch.remainingQuantity.toLocaleString('vi-VN')} /{' '}
                    {voucherBatch.totalQuantity.toLocaleString('vi-VN')}
                  </p>
                  <p className='text-xs text-muted-foreground'>Còn lại / Tổng số</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='h-4 w-4' />
                    Giá trị đơn hàng tối thiểu
                  </div>
                  <p className='text-sm font-medium'>
                    {parseFloat(voucherBatch.minimumOrderValue).toLocaleString('vi-VN')} VND
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='h-4 w-4' />
                    Giảm giá tối đa
                  </div>
                  <p className='text-sm font-medium'>
                    {parseFloat(voucherBatch.maximumDiscountValue).toLocaleString('vi-VN')} VND
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Calendar className='h-4 w-4' />
                  Thời gian có hiệu lực
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Từ:</span>
                    <p className='font-medium'>{dayjs(voucherBatch.startDate).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Đến:</span>
                    <p className='font-medium'>{dayjs(voucherBatch.endDate).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voucher Discount Details */}
          {!isVoucherBatch && voucherDiscount && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Hash className='h-4 w-4' />
                    Mã voucher
                  </div>
                  <p className='text-sm font-mono font-medium'>{voucherDiscount.code}</p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <Tag className='h-4 w-4' />
                    Mã lô voucher
                  </div>
                  <p className='text-sm font-mono'>{voucherDiscount.voucherBatchId}</p>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  Thông tin thời gian
                </div>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Tạo lúc:</span>
                    <p className='font-medium'>{dayjs(voucherDiscount.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Cập nhật:</span>
                    <p className='font-medium'>{dayjs(voucherDiscount.updatedAt).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <User className='h-4 w-4' />
                    Người tạo
                  </div>
                  <p className='text-sm font-medium'>{voucherDiscount.createdBy}</p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <UserCheck className='h-4 w-4' />
                    Người cập nhật
                  </div>
                  <p className='text-sm font-medium'>{voucherDiscount.updatedBy}</p>
                </div>
              </div>
            </div>
          )}

          {/* Auto Generate Info for Voucher Batch */}
          {isVoucherBatch && voucherBatch && (
            <div className='rounded-lg border p-3 bg-blue-50 dark:bg-blue-950/20'>
              <div className='flex items-center gap-2 text-sm'>
                <div className='w-2 h-2 rounded-full bg-blue-500' />
                <span className='text-muted-foreground'>
                  {voucherBatch.isAutoGenerate
                    ? 'Voucher sẽ được tạo tự động khi assign cho người dùng'
                    : 'Voucher cần được tạo thủ công'}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='flex gap-2'>
          {isVoucherBatch && (
            <Button onClick={handleAssignVoucher} className='bg-orange-600 hover:bg-orange-700'>
              <User className='h-4 w-4 mr-2' />
              Assign Voucher
            </Button>
          )}
          <Button onClick={handleDelete} variant='destructive'>
            <Ticket className='h-4 w-4 mr-2' />
            {isVoucherBatch ? 'Xóa lô voucher' : 'Vô hiệu hóa'}
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
