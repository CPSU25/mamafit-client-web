/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MapPin, Package, Store, Users, Clock, Loader2, Building2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'
import { useAssignQuantityForBranch } from '@/services/admin/branch-maternity-dress.service'
import manageBranchAPI from '@/apis/manage-branch.api'

// Schema validation cho form
const branchAllocationSchema = z.object({
  branchId: z.string().min(1, 'Vui lòng chọn chi nhánh'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0').max(1000, 'Số lượng không được vượt quá 1000')
})

type BranchAllocationForm = z.infer<typeof branchAllocationSchema>

interface BranchAllocationDialogProps {
  detail: MaternityDressDetailType
  trigger: React.ReactNode
}

export function BranchAllocationDialog({ detail, trigger }: BranchAllocationDialogProps) {
  const [open, setOpen] = useState(false)

  // Form hook
  const form = useForm<BranchAllocationForm>({
    resolver: zodResolver(branchAllocationSchema),
    defaultValues: {
      branchId: '',
      quantity: 1
    }
  })

  // Query để lấy danh sách chi nhánh
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => manageBranchAPI.getBranchs({ pageSize: 100 })
  })

  // Mutation để phân bổ số lượng
  const allocateMutation = useAssignQuantityForBranch()

  const onSubmit = (data: BranchAllocationForm) => {
    allocateMutation.mutate(
      {
        maternityDressDetailId: detail.id,
        branchId: data.branchId,
        quantity: data.quantity
      },
      {
        onSuccess: () => {
          toast.success('Phân bổ số lượng thành công!')
          setOpen(false)
          form.reset()
        },
        onError: (error: any) => {
          console.error('Error allocating quantity:', error)
          toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi phân bổ số lượng')
        }
      }
    )
  }

  const branches = branchesData?.data.data.items || []
  const selectedBranch = branches.find((branch: any) => branch.id === form.watch('branchId'))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
              <Store className='h-4 w-4 text-white' />
            </div>
            Phân bổ cho chi nhánh
          </DialogTitle>
          <DialogDescription>Chọn chi nhánh và số lượng cần phân bổ cho biến thể này</DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pr-4'>
          <div className='space-y-6'>
            {/* Thông tin biến thể */}
            <Card className='border-0 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Package className='h-4 w-4 text-violet-500' />
                  Thông tin biến thể
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0 space-y-4'>
                <div className='flex items-start gap-4'>
                  {detail.image && detail.image.length > 0 ? (
                    <div className='relative'>
                      <img
                        src={detail.image[0]}
                        alt='Product variant'
                        className='w-20 h-20 rounded-xl object-cover border shadow-sm'
                      />
                      {detail.image.length > 1 && (
                        <Badge
                          variant='secondary'
                          className='absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs'
                        >
                          +{detail.image.length - 1}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className='w-20 h-20 rounded-xl bg-muted flex items-center justify-center border'>
                      <Package className='h-8 w-8 text-muted-foreground' />
                    </div>
                  )}
                  <div className='flex-1 space-y-3'>
                    {/* Tên biến thể */}
                    <div>
                      <h4 className='font-semibold text-base leading-tight'>{detail.name}</h4>
                      {detail.sku && <p className='text-xs text-muted-foreground font-mono mt-1'>SKU: {detail.sku}</p>}
                    </div>

                    {/* Thuộc tính */}
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-violet-500'></div>
                        <span className='text-sm'>{detail.color || 'Chưa xác định'}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded bg-blue-500'></div>
                        <span className='text-sm'>Size {detail.size || 'Chưa xác định'}</span>
                      </div>
                    </div>

                    {/* Thông tin số lượng và giá */}
                    <div className='grid grid-cols-2 gap-4 pt-2 border-t border-violet-200/50'>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground uppercase tracking-wider'>Tồn kho</p>
                        <p className='text-lg font-bold text-green-600'>{detail.quantity || 0}</p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground uppercase tracking-wider'>Giá bán</p>
                        <p className='text-lg font-bold text-orange-600'>{detail.price?.toLocaleString('vi-VN')}₫</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mô tả biến thể (nếu có) */}
                {detail.description && (
                  <div className='pt-3 border-t border-violet-200/50'>
                    <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2'>Mô tả</p>
                    <div
                      className='text-sm text-muted-foreground bg-background/50 p-3 rounded-lg max-h-20 overflow-y-auto'
                      dangerouslySetInnerHTML={{
                        __html:
                          detail.description.length > 150
                            ? detail.description.substring(0, 150) + '...'
                            : detail.description
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Form phân bổ */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Chọn chi nhánh */}
                <FormField
                  control={form.control}
                  name='branchId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <Building2 className='h-4 w-4' />
                        Chọn chi nhánh
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingBranches}>
                        <FormControl>
                          <SelectTrigger className='h-11'>
                            <SelectValue
                              placeholder={isLoadingBranches ? 'Đang tải...' : 'Chọn chi nhánh cần phân bổ'}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div className='flex items-center gap-3 py-1'>
                                <Store className='h-4 w-4 text-muted-foreground' />
                                <div>
                                  <p className='font-medium'>{branch.name}</p>
                                  <p className='text-xs text-muted-foreground'>
                                    {branch.ward}, {branch.district}, {branch.province}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Thông tin chi nhánh được chọn */}
                {selectedBranch && (
                  <Card className='border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <MapPin className='h-4 w-4 text-blue-500' />
                        Thông tin chi nhánh
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0 space-y-3'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          <span>QL: {selectedBranch.branchManager.fullName}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-muted-foreground' />
                          <span>
                            {selectedBranch.openingHour} - {selectedBranch.closingHour}
                          </span>
                        </div>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        <MapPin className='h-4 w-4 inline mr-1' />
                        {selectedBranch.street}, {selectedBranch.ward}, {selectedBranch.district},{' '}
                        {selectedBranch.province}
                      </div>
                      {selectedBranch.description && (
                        <div className='text-sm text-muted-foreground bg-background/50 p-3 rounded-lg'>
                          {selectedBranch.description}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Nhập số lượng */}
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <Package className='h-4 w-4' />
                        Số lượng phân bổ
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='Nhập số lượng cần phân bổ'
                          min={1}
                          max={detail.quantity}
                          className='h-11'
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span>Tối thiểu: 1</span>
                        <span>Tối đa: {detail.quantity} (tồn kho hiện tại)</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className='flex gap-3 pt-4 border-t'>
          <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={allocateMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={allocateMutation.isPending || !form.formState.isValid}
            className='bg-blue-500 hover:bg-blue-600'
          >
            {allocateMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Đang phân bổ...
              </>
            ) : (
              <>
                <Store className='h-4 w-4 mr-2' />
                Phân bổ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
