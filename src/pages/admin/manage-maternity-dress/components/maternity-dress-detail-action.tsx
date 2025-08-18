import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Tiptap from '@/components/TipTap/TipTap'
import {
  FileText,
  ImageIcon,
  Loader2,
  Palette,
  Plus,
  Ruler,
  Save,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { MaternityDressDetailFormData } from '@/@types/manage-maternity-dress.types'
import { useCreateMaternityDressDetail } from '@/services/admin/maternity-dress.service'

interface MaternityDressDetailActionProps {
  maternityDressId: string
  colors?: string[]
  sizes?: string[]
  onClose: () => void
}

export const MaternityDressDetailAction: React.FC<MaternityDressDetailActionProps> = ({
  maternityDressId,
  colors = [],
  sizes = [],
  onClose
}) => {
  const createDetailMutation = useCreateMaternityDressDetail()

  const form = useForm<MaternityDressDetailFormData>({
    defaultValues: {
      maternityDressId: '',
      name: '',
      description: '',
      image: [],
      color: '',
      size: '',
      quantity: 0,
      price: 0
    }
  })

  // Set maternityDressId when maternityDressId changes
  useEffect(() => {
    if (maternityDressId) {
      form.setValue('maternityDressId', maternityDressId)
    }
  }, [maternityDressId, form])

  const handleAddDetail = async (data: MaternityDressDetailFormData) => {
    if (!maternityDressId) return

    try {
      await createDetailMutation.mutateAsync({
        ...data,
        maternityDressId: maternityDressId
      })
      toast.success('Thêm chi tiết thành công!')
      onClose()
      form.reset()
      form.setValue('maternityDressId', maternityDressId)
    } catch (error) {
      console.error('Error adding detail:', error)
      toast.error('Có lỗi xảy ra khi thêm chi tiết')
    }
  }

  return (
    <Card className='border-2 border-dashed border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-background dark:from-violet-950/20'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base flex items-center gap-2'>
          <div className='h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center'>
            <Plus className='h-4 w-4 text-white' aria-hidden='true' />
          </div>
          Thêm biến thể mới
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddDetail)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-medium flex items-center gap-2'>
                      <Sparkles className='h-4 w-4' aria-hidden='true' />
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
                      <Palette className='h-4 w-4' aria-hidden='true' />
                      Màu Sắc *
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Chọn màu sắc' />
                        </SelectTrigger>
                        <SelectContent>
                          {colors?.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Ruler className='h-4 w-4' aria-hidden='true' />
                      Kích Thước *
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Chọn size' />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes?.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <ShoppingBag className='h-4 w-4' aria-hidden='true' />
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
                      <TrendingUp className='h-4 w-4' aria-hidden='true' />
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

            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <FileText className='h-4 w-4 text-blue-500' />
                  Mô tả biến thể
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className='w-full'>
                          <Tiptap
                            onChange={(content: string) => {
                              field.onChange(content)
                            }}
                            initialValue={field.value || ''}
                            className='min-h-[200px] w-full'
                            placeholder='Mô tả chi tiết về biến thể: đặc điểm nổi bật, phù hợp với ai...'
                          />
                        </div>
                      </FormControl>
                      <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                        <span>Mô tả chi tiết giúp khách hàng hiểu rõ hơn về biến thể này</span>
                        <span>{field.value?.replace(/<[^>]*>/g, '').length || 0} ký tự</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-medium flex items-center gap-2'>
                    <ImageIcon className='h-4 w-4' aria-hidden='true' />
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
                disabled={createDetailMutation.isPending}
                className='h-10 bg-violet-500 hover:bg-violet-600'
              >
                {createDetailMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' aria-hidden='true' />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' aria-hidden='true' />
                    Thêm biến thể
                  </>
                )}
              </Button>
              <Button type='button' variant='outline' onClick={onClose} className='h-10'>
                <X className='h-4 w-4 mr-2' aria-hidden='true' />
                Hủy bỏ
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
