import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Package, Loader2, ImageIcon } from 'lucide-react'

import { MaternityDress } from '../data/schema'
import { useCreateMaternityDress, useUpdateMaternityDress } from '@/services/admin/maternity-dress.service'
import { FirebaseImageUpload } from '@/components/firebase-image-upload'

const maternityDressFormSchema = z.object({
  styleId: z.string().min(1, 'Vui lòng chọn style'),
  name: z.string().min(1, 'Tên đầm bầu là bắt buộc').max(255, 'Tên không được vượt quá 255 ký tự'),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  images: z.array(z.string()).min(1, 'Ít nhất một hình ảnh là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc')
})

type MaternityDressFormData = z.infer<typeof maternityDressFormSchema>

interface MaternityDressFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: MaternityDress
}

export function MaternityDressFormDialog({ open, onOpenChange, currentRow }: MaternityDressFormDialogProps) {
  const [images, setImages] = useState<string[]>([])
  const isEdit = !!currentRow

  const createMutation = useCreateMaternityDress()
  const updateMutation = useUpdateMaternityDress()

  const form = useForm<MaternityDressFormData>({
    resolver: zodResolver(maternityDressFormSchema),
    defaultValues: {
      styleId: '',
      name: '',
      description: '',
      images: [],
      slug: ''
    }
  })

  // Reset form khi dialog đóng mở
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        form.reset({
          styleId: '', // Note: styleId không có trong MaternityDress, cần xử lý riêng
          name: currentRow.name,
          description: currentRow.description,
          images: currentRow.images,
          slug: currentRow.slug
        })
        setImages(currentRow.images)
      } else {
        form.reset({
          styleId: '',
          name: '',
          description: '',
          images: [],
          slug: ''
        })
        setImages([])
      }
    }
  }, [open, isEdit, currentRow, form])

  // Sync images với form
  useEffect(() => {
    form.setValue('images', images)
  }, [images, form])

  const onSubmit = async (data: MaternityDressFormData) => {
    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
          data
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-pink-500' />
            {isEdit ? 'Chỉnh sửa đầm bầu' : 'Thêm đầm bầu mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin đầm bầu. Các trường có dấu (*) là bắt buộc.'
              : 'Tạo một đầm bầu mới trong hệ thống. Các trường có dấu (*) là bắt buộc.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4'>
              {/* Style ID - Cần implement selector */}
              <FormField
                control={form.control}
                name='styleId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style ID *</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập style ID...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đầm bầu *</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên đầm bầu...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập slug...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Nhập mô tả...' className='min-h-[100px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Images */}
              <FormField
                control={form.control}
                name='images'
                render={() => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <ImageIcon className='h-4 w-4' />
                      Hình ảnh *
                    </FormLabel>
                    <FormControl>
                      <FirebaseImageUpload value={images} onChange={setImages} className='w-full' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading} className='bg-pink-500 hover:bg-pink-600'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
