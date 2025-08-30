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
import { FirebaseImageUpload } from '@/components/firebase-image-upload'
import { useCreatePosition, useUpdatePosition } from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { PositionSchema } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const positionFormSchema = z.object({
  name: z.string().min(1, { message: 'Tên position là bắt buộc' }),
  image: z.string().nullable().optional()
})

export type PositionForm = z.infer<typeof positionFormSchema>

interface Props {
  open: boolean
  currentRow?: PositionSchema
  onOpenChange: (open: boolean) => void
}

export function PositionActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createPositionMutation = useCreatePosition()
  const updatePositionMutation = useUpdatePosition()

  const form = useForm<PositionForm>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          image: currentRow.image || null
        }
      : {
          name: '',
          image: null
        }
  })

  const onSubmit = async (data: PositionForm) => {
    try {
      if (isEdit && currentRow) {
        await updatePositionMutation.mutateAsync({
          id: currentRow.id,
          data: {
            name: data.name,
            image: data.image ?? null
          }
        })
        toast.success('Cập nhật position thành công!')
      } else {
        await createPositionMutation.mutateAsync({
          name: data.name,
          image: data.image ?? null
        })
        toast.success('Tạo position thành công!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Không thể cập nhật' : 'Không thể tạo'} position: ${errorMessage}`)
    }
  }

  const isSubmitting = createPositionMutation.isPending || updatePositionMutation.isPending

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
          <DialogTitle>{isEdit ? 'Chỉnh sửa Position' : 'Tạo Position mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin position. Các trường có * là bắt buộc.'
              : 'Tạo position mới cho hệ thống. Các trường có * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <Form {...form}>
            <form id='position-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Position *</FormLabel>
                    <FormControl>
                      <Input placeholder='VD: Trên cùng, Giữa, Dưới cùng...' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh mẫu</FormLabel>
                    <FormControl>
                      <FirebaseImageUpload
                        value={field.value ? [field.value] : []}
                        onChange={(urls) => field.onChange(urls[0] || null)}
                        maxFiles={1}
                        placeholder='Upload hình ảnh mẫu cho position'
                        disabled={isSubmitting}
                        uploadOptions={{
                          folder: 'positions/',
                          metadata: {
                            customMetadata: {
                              type: 'position'
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='position-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
