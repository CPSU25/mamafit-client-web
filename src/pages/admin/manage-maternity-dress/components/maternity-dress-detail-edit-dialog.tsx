import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ImageIcon, Loader2, Package, Palette, Ruler, Save, ShoppingBag, Sparkles, TrendingUp, X } from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { MaternityDressDetailFormData, MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'
import { useUpdateMaternityDressDetail } from '@/services/admin/maternity-dress.service'

interface MaternityDressDetailEditDialogProps {
  detail: MaternityDressDetailType
  maternityDressId: string
  colors?: string[]
  sizes?: string[]
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const MaternityDressDetailEditDialog: React.FC<MaternityDressDetailEditDialogProps> = ({
  detail,
  maternityDressId,
  colors = [],
  sizes = [],
  trigger,
  open,
  onOpenChange
}) => {
  const updateDetailMutation = useUpdateMaternityDressDetail()

  const form = useForm<MaternityDressDetailFormData>({
    defaultValues: {
      maternityDressId: maternityDressId,
      name: detail.name || '',
      description: detail.description || '',
      image: detail.image || [],
      color: detail.color || '',
      size: detail.size || '',
      quantity: detail.quantity || 0,
      price: detail.price || 0
    }
  })

  // Reset form when detail changes
  useEffect(() => {
    if (detail) {
      form.reset({
        maternityDressId: maternityDressId,
        name: detail.name || '',
        description: detail.description || '',
        image: detail.image || [],
        color: detail.color || '',
        size: detail.size || '',
        quantity: detail.quantity || 0,
        price: detail.price || 0
      })
    }
  }, [detail, maternityDressId, form])

  const handleUpdateDetail = async (data: MaternityDressDetailFormData) => {
    try {
      await updateDetailMutation.mutateAsync({
        id: detail.id,
        data
      })
      toast.success('Cập nhật biến thể thành công!')
      onOpenChange?.(false)
    } catch (error) {
      console.error('Error updating detail:', error)
      toast.error('Có lỗi xảy ra khi cập nhật biến thể')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center'>
              <Sparkles className='h-4 w-4 text-white' />
            </div>
            Chỉnh sửa biến thể
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết của biến thể "{detail.name}"</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateDetail)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <Sparkles className='h-4 w-4' />
                      Tên Biến Thể *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='VD: Đầm bầu màu đỏ size M' className='h-10' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <Palette className='h-4 w-4' />
                      Màu Sắc *
                    </FormLabel>
                    <FormControl>
                      <select className='w-full border px-3 py-2 text-sm rounded-md h-10' {...field}>
                        <option value=''>Chọn màu sắc</option>
                        {colors?.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <FormField
                control={form.control}
                name='size'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <Ruler className='h-4 w-4' />
                      Kích Thước *
                    </FormLabel>
                    <FormControl>
                      <select className='w-full border px-3 py-2 text-sm rounded-md h-10' {...field}>
                        <option value=''>Chọn size</option>
                        {sizes?.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <ShoppingBag className='h-4 w-4' />
                      Số Lượng *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        placeholder='10'
                        className='h-10'
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <TrendingUp className='h-4 w-4' />
                      Giá (VNĐ) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='0'
                        step='1000'
                        placeholder='299000'
                        className='h-10'
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                  <FormLabel className='font-medium flex items-center gap-2'>
                    <Package className='h-4 w-4' />
                    Mô Tả Chi Tiết
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder='Mô tả chi tiết...' rows={4} className='resize-none' {...field} />
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
                  <FormLabel className='font-medium flex items-center gap-2'>
                    <ImageIcon className='h-4 w-4' />
                    Hình Ảnh Biến Thể *
                  </FormLabel>
                  <FormControl>
                    <CloudinaryImageUpload
                      value={field.value || []}
                      onChange={field.onChange}
                      maxFiles={5}
                      className='w-full'
                    />
                  </FormControl>
                  <p className='text-xs text-muted-foreground bg-muted p-3 rounded-lg border'>
                    Thêm tối đa 5 hình ảnh chất lượng cao để hiển thị chi tiết biến thể. Ảnh sẽ được tự động tối ưu để
                    tải nhanh.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-4 pt-6 border-t'>
              <Button
                type='submit'
                disabled={updateDetailMutation.isPending}
                className='h-10 bg-violet-500 hover:bg-violet-600'
              >
                {updateDetailMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Cập nhật biến thể
                  </>
                )}
              </Button>
              <Button type='button' variant='outline' onClick={() => onOpenChange?.(false)} className='h-10'>
                <X className='h-4 w-4 mr-2' />
                Hủy bỏ
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
