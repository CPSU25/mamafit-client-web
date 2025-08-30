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
import { useCreateAddOn, useUpdateAddOn } from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { AddOn } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const addOnFormSchema = z.object({
  name: z.string().min(1, { message: 'Tên add-on là bắt buộc' }),
  description: z.string().min(1, { message: 'Mô tả là bắt buộc' })
})

export type AddOnForm = z.infer<typeof addOnFormSchema>

interface Props {
  open: boolean
  currentRow?: AddOn
  onOpenChange: (open: boolean) => void
}

export function AddOnActionDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createAddOnMutation = useCreateAddOn()
  const updateAddOnMutation = useUpdateAddOn()

  const form = useForm<AddOnForm>({
    resolver: zodResolver(addOnFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description
        }
      : {
          name: '',
          description: ''
        }
  })

  const onSubmit = async (data: AddOnForm) => {
    try {
      if (isEdit && currentRow) {
        await updateAddOnMutation.mutateAsync({
          id: currentRow.id,
          data
        })
        toast.success('Cập nhật add-on thành công!')
      } else {
        await createAddOnMutation.mutateAsync(data)
        toast.success('Tạo add-on thành công!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Không thể cập nhật' : 'Không thể tạo'} add-on: ${errorMessage}`)
    }
  }

  const isSubmitting = createAddOnMutation.isPending || updateAddOnMutation.isPending

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
          <DialogTitle>{isEdit ? 'Chỉnh sửa Add-on' : 'Tạo Add-on mới'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin add-on. Các trường có * là bắt buộc.'
              : 'Tạo add-on mới cho hệ thống. Các trường có * là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <Form {...form}>
            <form id='add-on-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Add-on *</FormLabel>
                    <FormControl>
                      <Input placeholder='VD: Logo, Text, Pattern...' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Mô tả chi tiết về add-on...' rows={3} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='add-on-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
