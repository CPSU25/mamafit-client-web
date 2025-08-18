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
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { applyForOptions } from '../data/data'
import { Milestone } from '../data/schema'
import { ApplyFor } from '@/@types/admin.types'
import { useCreateMilestone, useUpdateMilestone } from '@/services/admin/manage-milestone.service'

const milestoneFormSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(100, 'Milestone name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  applyFor: z.array(z.string()).min(1, 'Apply for is required'),
  sequenceOrder: z
    .number()
    .min(1, 'Sequence order must be greater than 0')
    .max(999, 'Sequence order must be less than 999')
})

type MilestoneFormData = z.infer<typeof milestoneFormSchema>

interface MilestoneFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Milestone
}

export function MilestoneFormDialog({ open, onOpenChange, currentRow }: MilestoneFormDialogProps) {
  const isEditing = !!currentRow

  const createMilestoneMutation = useCreateMilestone()
  const updateMilestoneMutation = useUpdateMilestone()

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: isEditing
      ? {
          name: currentRow?.name || '',
          description: currentRow?.description || '',
          applyFor: currentRow?.applyFor || [],
          sequenceOrder: currentRow?.sequenceOrder || 1
        }
      : {
          name: '',
          description: '',
          applyFor: [],
          sequenceOrder: 1
        }
  })

  const onSubmit = async (data: MilestoneFormData) => {
    try {
      if (isEditing && currentRow) {
        await updateMilestoneMutation.mutateAsync({
          id: currentRow.id,
          data: {
            ...data,
            applyFor: (data.applyFor || []) as ApplyFor[]
          }
        })
        toast.success('Milestone updated successfully!')
      } else {
        await createMilestoneMutation.mutateAsync({
          ...data,
          applyFor: (data.applyFor || []) as ApplyFor[]
        })
        toast.success('Milestone created successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while submitting the form'
      toast.error(errorMessage)
    }
  }

  const isLoading = createMilestoneMutation.isPending || updateMilestoneMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
            {currentRow ? 'Chỉnh Sửa Mốc Nhiệm Vụ' : 'Thêm Mốc Nhiệm Vụ Mới'}
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {currentRow ? 'Cập nhật thông tin mốc nhiệm vụ hiện tại.' : 'Tạo mốc nhiệm vụ mới cho hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <div className='-mr-4 h-[36rem] w-full overflow-y-auto py-2 pr-4'>
          <Form {...form}>
            <form id='milestone-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information Card */}
              <Card className='border-l-4 border-l-blue-500'>
                <CardContent className=''>
                  <h3 className='text-lg font-semibold mb-4 text-gray-800'>Thông tin cơ bản</h3>
                  <div className='grid grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium text-foreground'>Tên Mốc Nhiệm Vụ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Nhập tên mốc nhiệm vụ...'
                              {...field}
                              disabled={isLoading}
                              className='focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='sequenceOrder'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium'>Thứ tự *</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='1'
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              disabled={isLoading}
                              min={1}
                              max={999}
                              className='focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Apply For Card */}
              <Card className='border-l-4 border-l-green-500'>
                <CardContent className=''>
                  <FormField
                    control={form.control}
                    name='applyFor'
                    render={({ field }) => (
                      <FormItem>
                        <div className='space-y-4'>
                          <div>
                            <FormLabel className='text-lg font-semibold text-gray-800'>Áp dụng cho *</FormLabel>
                            <p className='text-sm text-gray-600 mt-1'>
                              Chọn một hoặc nhiều loại đơn hàng mà mốc này áp dụng
                            </p>
                          </div>

                          {/* Selected items display */}
                          {field.value && field.value.length > 0 && (
                            <div className='flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg'>
                              {field.value.map((value) => {
                                const option = applyForOptions.find((opt) => opt.value === value)
                                return (
                                  <Badge key={value} variant='secondary' className='px-3 py-1'>
                                    {option?.label || value}
                                  </Badge>
                                )
                              })}
                            </div>
                          )}

                          {/* Checkbox options */}
                          <div className='grid grid-cols-1 gap-3'>
                            {applyForOptions.map((option) => (
                              <div
                                key={option.value}
                                className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                              >
                                <Checkbox
                                  id={option.value}
                                  checked={field.value?.includes(option.value) || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), option.value])
                                    } else {
                                      field.onChange(field.value?.filter((value) => value !== option.value) || [])
                                    }
                                  }}
                                  disabled={isLoading}
                                  className='data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1'
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className='border-l-4 border-l-purple-500'>
                <CardContent className=''>
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-lg font-semibold text-gray-800'>Mô tả *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Nhập mô tả cho mốc thời gian'
                            className='min-h-[120px] focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        <DialogFooter className='gap-3 pt-4 border-t'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className='px-6'
          >
            Hủy
          </Button>
          <Button
            type='submit'
            form='milestone-form'
            disabled={isLoading}
            className='min-w-[140px] bg-blue-600 hover:bg-blue-700'
          >
            {isLoading ? (isEditing ? 'Đang lưu...' : 'Đang tạo...') : isEditing ? 'Lưu thay đổi' : 'Tạo mốc thời gian'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
