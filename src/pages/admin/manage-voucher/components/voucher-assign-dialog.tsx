import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { VoucherBatch } from '../data/schema'
import { useAssignVoucher } from '@/services/admin/manage-voucher.service'
import { AssignVoucher } from '@/@types/admin.types'
import { Badge } from '@/components/ui/badge'
import { Ticket, User, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import { useGetListUser } from '@/services/admin/manage-user.service'

const assignVoucherFormSchema = z.object({
  userId: z.string().min(1, 'Vui lòng chọn người dùng'),
  voucherBatchId: z.string().min(1, 'Mã lô voucher là bắt buộc')
})

type AssignVoucherFormData = z.infer<typeof assignVoucherFormSchema>

interface VoucherAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucherBatch: VoucherBatch | null
}

export function VoucherAssignDialog({ open, onOpenChange, voucherBatch }: VoucherAssignDialogProps) {
  const assignVoucherMutation = useAssignVoucher()

  // Fetch users list
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetListUser({
    index: 0,
    pageSize: 100, // Get more users for selection
    nameSearch: ''
  })

  const users = usersResponse?.data?.items || []

  const form = useForm<AssignVoucherFormData>({
    resolver: zodResolver(assignVoucherFormSchema),
    defaultValues: {
      userId: '',
      voucherBatchId: voucherBatch?.id || ''
    }
  })

  // Update voucherBatchId when voucherBatch changes
  React.useEffect(() => {
    if (voucherBatch?.id) {
      form.setValue('voucherBatchId', voucherBatch.id)
    }
  }, [voucherBatch?.id, form])

  const onSubmit = async (data: AssignVoucherFormData) => {
    try {
      const assignData: AssignVoucher = {
        voucherBatchId: data.voucherBatchId,
        userId: data.userId
      }

      await assignVoucherMutation.mutateAsync(assignData)
      toast.success('Assign voucher thành công!')
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error assigning voucher:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi assign voucher'
      toast.error(errorMessage)
    }
  }

  const isLoading = assignVoucherMutation.isPending || isLoadingUsers

  if (!voucherBatch) return null

  // Calculate status for display
  const now = dayjs()
  const start = dayjs(voucherBatch.startDate)
  const end = dayjs(voucherBatch.endDate)

  let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
  let statusLabel = 'Đang hoạt động'

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

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Assign Voucher cho người dùng</DialogTitle>
          <DialogDescription>
            Chọn người dùng để assign voucher từ lô voucher này. Voucher sẽ được tự động tạo và gán cho người dùng.
          </DialogDescription>
        </DialogHeader>

        {/* Voucher Batch Info */}
        <div className='rounded-lg border p-4 space-y-3 bg-muted/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center'>
                <Ticket className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <h4 className='font-medium'>{voucherBatch.batchName}</h4>
                <p className='text-sm text-muted-foreground'>{voucherBatch.batchCode}</p>
              </div>
            </div>
            <Badge variant={statusVariant} className='text-xs'>
              {statusLabel}
            </Badge>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-muted-foreground'>Giá trị giảm giá:</span>
              <div className='font-medium'>
                {voucherBatch.discountType === 'PERCENTAGE'
                  ? `${voucherBatch.discountValue}%`
                  : `${voucherBatch.discountValue.toLocaleString('vi-VN')} VND`}
              </div>
            </div>
            <div>
              <span className='text-muted-foreground'>Số lượng còn lại:</span>
              <div className='font-medium'>
                {voucherBatch.remainingQuantity.toLocaleString('vi-VN')} /{' '}
                {voucherBatch.totalQuantity.toLocaleString('vi-VN')}
              </div>
            </div>
            <div className='col-span-2'>
              <span className='text-muted-foreground'>Thời gian có hiệu lực:</span>
              <div className='flex items-center gap-1'>
                <Calendar className='h-3 w-3 text-muted-foreground' />
                <span className='text-sm'>
                  {dayjs(voucherBatch.startDate).format('DD/MM/YYYY')} -{' '}
                  {dayjs(voucherBatch.endDate).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='userId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    Chọn người dùng *
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn người dùng để assign voucher' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-[300px]'>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{user.fullName}</span>
                            <span className='text-xs text-muted-foreground'>{user.userEmail}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type='submit' onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Assign Voucher'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
