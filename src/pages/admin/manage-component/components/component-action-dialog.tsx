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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FirebaseImageUpload } from '@/components/firebase-image-upload'
import { useCreateComponent, useUpdateComponent } from '@/services/admin/manage-component.service'
import { toast } from 'sonner'
import { Component } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Tên thành phần là bắt buộc' }),
  description: z.string().min(1, { message: 'Mô tả là bắt buộc' }),
  images: z.array(z.string()).optional()
})

export type ComponentForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  currentRow?: Component
  onOpenChange: (open: boolean) => void
}

export function ComponentFormDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createComponentMutation = useCreateComponent()
  const updateComponentMutation = useUpdateComponent()

  const form = useForm<ComponentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description,
          images: currentRow.images || []
        }
      : {
          name: '',
          description: '',
          images: []
        }
  })

  const onSubmit = async (data: ComponentForm) => {
    try {
      if (isEdit && currentRow) {
        await updateComponentMutation.mutateAsync({
          id: currentRow.id,
          data: {
            ...data,
            images: data.images || []
          }
        })
        toast.success('Cập nhật thành phần thành công!')
      } else {
        await createComponentMutation.mutateAsync({
          ...data,
          images: data.images || []
        })
        toast.success('Tạo thành phần thành công!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Không thể cập nhật' : 'Không thể tạo'} thành phần: ${errorMessage}`)
    }
  }

  const isSubmitting = createComponentMutation.isPending || updateComponentMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa Thành phần' : 'Tạo Thành phần Mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin thành phần. Các trường có dấu * là bắt buộc.'
              : 'Tạo thành phần mới cho hệ thống. Các trường có dấu * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>

        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='component-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Tên Thành phần *</FormLabel>
                    <FormControl>
                      <Input placeholder='vd: Nút bấm, Ô nhập, Thẻ' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Mô tả về thành phần...' rows={3} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='images'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Hình ảnh Thành phần</FormLabel>
                    <FormControl>
                      <FirebaseImageUpload
                        value={field.value || []}
                        onChange={(value) => field.onChange(value)}
                        maxFiles={5}
                        placeholder='Tải lên hình ảnh thành phần hoặc nhập URL'
                        disabled={isSubmitting}
                        uploadOptions={{
                          folder: 'components/', // Tổ chức ảnh theo thư mục
                          metadata: {
                            customMetadata: {
                              type: 'component'
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
          <Button type='submit' form='component-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
