'use client'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateSize, useUpdateSize } from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { SizeSchema } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const sizeFormSchema = z.object({
  name: z.string().min(1, { message: 'Tên size là bắt buộc' })
})

export type SizeForm = z.infer<typeof sizeFormSchema>

interface Props {
  open: boolean
  currentRow?: SizeSchema
  onOpenChange: (open: boolean) => void
}

export function SizeActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createSizeMutation = useCreateSize()
  const updateSizeMutation = useUpdateSize()

  const form = useForm<SizeForm>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name
        }
      : {
          name: ''
        }
  })

  const onSubmit = async (data: SizeForm) => {
    try {
      if (isEdit && currentRow) {
        await updateSizeMutation.mutateAsync({
          id: currentRow.id,
          data
        })
        toast.success('Cập nhật size thành công!')
      } else {
        await createSizeMutation.mutateAsync(data)
        toast.success('Tạo size thành công!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Không thể cập nhật' : 'Không thể tạo'} size: ${errorMessage}`)
    }
  }

  const isSubmitting = createSizeMutation.isPending || updateSizeMutation.isPending

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
          <DialogTitle>{isEdit ? 'Chỉnh sửa Size' : 'Tạo Size mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin size. Các trường có * là bắt buộc.'
              : 'Tạo size mới cho hệ thống. Các trường có * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <Form {...form}>
            <form id='size-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Size *</FormLabel>
                    <FormControl>
                      <Input placeholder='VD: Nhỏ, Vừa, Lớn, Tùy chỉnh...' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='size-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
