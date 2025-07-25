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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { discountTypeOptions } from '../data/data'
import { VoucherBatch } from '../data/schema'
import { useCreateVoucherBatch } from '@/services/admin/manage-voucher.service'
import { VoucherBatchFormData } from '@/@types/admin.types'
import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import dayjs from 'dayjs'

const voucherBatchFormSchema = z
  .object({
    batchName: z.string().min(1, 'Tên lô voucher là bắt buộc').max(100, 'Tên lô voucher phải ít hơn 100 ký tự'),
    batchCode: z.string().min(1, 'Mã lô voucher là bắt buộc').max(50, 'Mã lô voucher phải ít hơn 50 ký tự'),
    description: z.string().min(1, 'Mô tả là bắt buộc').max(500, 'Mô tả phải ít hơn 500 ký tự'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
    totalQuantity: z.number().min(1, 'Số lượng phải lớn hơn 0').max(10000, 'Số lượng phải nhỏ hơn 10.000'),
    discountType: z.enum(['PERCENTAGE', 'FIXED'], {
      required_error: 'Loại giảm giá là bắt buộc'
    }),
    discountValue: z.number().min(0.01, 'Giá trị giảm giá phải lớn hơn 0'),
    minimumOrderValue: z.number().min(0, 'Giá trị đơn hàng tối thiểu phải ≥ 0'),
    maximumDiscountValue: z.number().min(0, 'Giá trị giảm giá tối đa phải ≥ 0'),
    isAutoGenerate: z.boolean()
  })
  .refine(
    (data) => {
      const start = dayjs(data.startDate)
      const today = dayjs().startOf('day')
      return !start.isBefore(today)
    },
    {
      message: 'Ngày bắt đầu không được ở quá khứ',
      path: ['startDate']
    }
  )
  .refine(
    (data) => {
      const start = dayjs(data.startDate)
      const end = dayjs(data.endDate)
      return end.isAfter(start)
    },
    {
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['endDate']
    }
  )
  .refine(
    (data) => {
      if (data.discountType === 'PERCENTAGE') {
        return data.discountValue <= 100
      }
      return true
    },
    {
      message: 'Phần trăm giảm giá không được vượt quá 100%',
      path: ['discountValue']
    }
  )

type VoucherBatchFormDataType = z.infer<typeof voucherBatchFormSchema>

interface VoucherBatchFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VoucherBatch | null
}

export function VoucherBatchFormDialog({ open, onOpenChange, currentRow }: VoucherBatchFormDialogProps) {
  const isEditing = !!currentRow
  const [startCalendarOpen, setStartCalendarOpen] = useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState(false)

  const createVoucherBatchMutation = useCreateVoucherBatch()

  const form = useForm<VoucherBatchFormDataType>({
    resolver: zodResolver(voucherBatchFormSchema),
    defaultValues: isEditing
      ? {
          batchName: currentRow?.batchName || '',
          batchCode: currentRow?.batchCode || '',
          description: currentRow?.description || '',
          startDate: currentRow?.startDate || '',
          endDate: currentRow?.endDate || '',
          totalQuantity: currentRow?.totalQuantity || 1,
          discountType: (currentRow?.discountType as 'PERCENTAGE' | 'FIXED') || 'PERCENTAGE',
          discountValue: currentRow?.discountValue || 0,
          minimumOrderValue: 0,
          maximumDiscountValue: 0,
          isAutoGenerate: true
        }
      : {
          batchName: '',
          batchCode: '',
          description: '',
          startDate: '',
          endDate: '',
          totalQuantity: 1,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          minimumOrderValue: 0,
          maximumDiscountValue: 0,
          isAutoGenerate: true
        }
  })

  const onSubmit = async (data: VoucherBatchFormDataType) => {
    try {
      if (isEditing && currentRow) {
        // TODO: Implement update voucher batch when API is available
        toast.error('Chỉnh sửa voucher batch chưa được hỗ trợ')
      } else {
        // Transform data to match API format
        const apiData: VoucherBatchFormData = {
          ...data,
          startDate: dayjs(data.startDate).toISOString(),
          endDate: dayjs(data.endDate).toISOString()
        }

        await createVoucherBatchMutation.mutateAsync(apiData)
        toast.success('Tạo lô voucher thành công!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage = error instanceof Error ? error.message : 'Có lỗi không mong muốn xảy ra khi gửi form'
      toast.error(errorMessage)
    }
  }

  const isLoading = createVoucherBatchMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa lô voucher' : 'Tạo lô voucher mới'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin lô voucher. Nhấn lưu để áp dụng thay đổi.'
              : 'Nhập thông tin để tạo lô voucher mới. Nhấn tạo để hoàn thành.'}
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='voucher-batch-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='batchName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên lô voucher *</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập tên lô voucher' {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='batchCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã lô voucher *</FormLabel>
                      <FormControl>
                        <Input placeholder='Nhập mã lô voucher' {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập mô tả lô voucher'
                        className='min-h-[80px] resize-none'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu *</FormLabel>
                      <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen} modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              type='button'
                              className='w-full justify-start text-left font-normal'
                              disabled={isLoading}
                            >
                              <CalendarIcon className='mr-2 h-4 w-4' />
                              {field.value ? dayjs(field.value).format('DD/MM/YYYY') : 'Chọn ngày bắt đầu'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0 z-50' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                setStartCalendarOpen(false)
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return date < today
                            }}
                            initialFocus
                            defaultMonth={new Date()}
                            fromDate={new Date()}
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc *</FormLabel>
                      <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen} modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              type='button'
                              className='w-full justify-start text-left font-normal'
                              disabled={isLoading}
                            >
                              <CalendarIcon className='mr-2 h-4 w-4' />
                              {field.value ? dayjs(field.value).format('DD/MM/YYYY') : 'Chọn ngày kết thúc'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0 z-50' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(dayjs(date).format('YYYY-MM-DD'))
                                setEndCalendarOpen(false)
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const startDate = form.getValues('startDate')

                              // Disable dates before today
                              if (date < today) {
                                return true
                              }

                              // Disable dates before or equal to start date
                              if (startDate) {
                                const start = new Date(startDate)
                                start.setHours(0, 0, 0, 0)
                                return date <= start
                              }

                              return false
                            }}
                            initialFocus
                            defaultMonth={
                              form.getValues('startDate') ? new Date(form.getValues('startDate')) : new Date()
                            }
                            fromDate={
                              form.getValues('startDate')
                                ? (() => {
                                    const start = new Date(form.getValues('startDate'))
                                    start.setDate(start.getDate() + 1)
                                    return start
                                  })()
                                : new Date()
                            }
                            showOutsideDays={false}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='totalQuantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổng số lượng *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Nhập số lượng'
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='discountType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại giảm giá *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn loại giảm giá' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {discountTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='discountValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị giảm giá *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='Nhập giá trị'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='minimumOrderValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị đơn hàng tối thiểu *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='VD: 100000'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='maximumDiscountValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị giảm giá tối đa *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='VD: 50000'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type='submit' form='voucher-batch-form' disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
