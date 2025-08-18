import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Loader2,
  Package,
  Sparkles,
  Heart,
  Image as ImageIcon,
  Link,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  Palette,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { MaternityDressFormData } from '@/@types/manage-maternity-dress.types'
import { useCreateMaternityDress } from '@/services/admin/maternity-dress.service'
import { useGetStyles } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SingleStepProductCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export default function MaternityDressCreationDialog({
  open,
  onOpenChange,
  onComplete
}: SingleStepProductCreationDialogProps) {
  // React Query hooks
  const createMaternityDressMutation = useCreateMaternityDress()
  const {
    data: stylesData,
    isLoading: stylesLoading,
    error: stylesError
  } = useGetStyles({
    index: 1,
    pageSize: 50
  })

  const form = useForm<MaternityDressFormData>({
    defaultValues: {
      styleId: '',
      name: '',
      description: '',
      images: [],
      slug: ''
    }
  })

  const watchedName = form.watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setValue('slug', slug)
    }
  }, [watchedName, form])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  const handleSubmit = async (data: MaternityDressFormData) => {
    try {
      await createMaternityDressMutation.mutateAsync(data)
      toast.success('Tạo đầm bầu thành công!')
      onComplete?.()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error creating maternity dress:', error)
      toast.error('Có lỗi xảy ra khi tạo đầm bầu')
    }
  }

  const isLoading = createMaternityDressMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl max-h-[95vh] overflow-hidden border shadow-xl'>
        {/* Enhanced Dialog Header */}
        <DialogHeader className='pb-6 border-b'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-muted'>
                <Sparkles className='h-6 w-6 text-muted-foreground' />
              </div>
              <div>
                <DialogTitle className='text-2xl font-semibold'>Tạo Đầm Bầu Mới</DialogTitle>
                <p className='text-sm text-muted-foreground mt-1'>Tạo sản phẩm cơ bản, sau đó thêm các biến thể</p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
              className='rounded-full h-10 w-10 p-0'
            >
              <X className='h-5 w-5 text-muted-foreground' />
            </Button>
          </div>

          {/* Error Alert */}
          {stylesError && (
            <div className='mt-4 p-4 bg-destructive/10 border rounded-xl'>
              <div className='flex items-center gap-3'>
                <AlertCircle className='h-5 w-5 text-destructive' />
                <div>
                  <h4 className='font-semibold'>Lỗi tải dữ liệu</h4>
                  <p className='text-sm text-muted-foreground'>Không thể tải danh sách kiểu dáng. Vui lòng thử lại.</p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Form Content */}
        <div className='overflow-y-auto max-h-[calc(95vh-200px)] pr-2 custom-scrollbar'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8 py-2'>
              {/* Basic Information Section */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Heart className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='text-base font-semibold'>Thông Tin Cơ Bản</h3>
                      <p className='text-sm text-muted-foreground'>Tên sản phẩm và kiểu dáng</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='font-medium flex items-center gap-2'>
                            <Sparkles className='h-4 w-4' />
                            Tên Đầm Bầu *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder='VD: Đầm bầu dạ tiệc sang trọng' className='h-10' {...field} />
                          </FormControl>
                          <p className='text-xs text-muted-foreground'>Tên sẽ tự động tạo slug URL thân thiện</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='styleId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='font-medium flex items-center gap-2'>
                            <Palette className='h-4 w-4' />
                            Kiểu Dáng *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Chọn kiểu dáng phù hợp' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='max-h-60'>
                              {stylesLoading ? (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground mx-auto' />
                                    <p className='text-sm text-muted-foreground'>Đang tải kiểu dáng...</p>
                                  </div>
                                </div>
                              ) : stylesError ? (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <AlertCircle className='h-6 w-6 text-destructive mx-auto' />
                                    <p className='text-sm text-muted-foreground'>Lỗi tải dữ liệu</p>
                                  </div>
                                </div>
                              ) : stylesData?.data.items && stylesData.data.items.length > 0 ? (
                                stylesData.data.items.map((style) => (
                                  <SelectItem key={style.id} value={style.id} className='py-3'>
                                    {style.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <Package className='h-6 w-6 text-muted-foreground mx-auto' />
                                    <p className='text-sm text-muted-foreground'>Không có kiểu dáng nào</p>
                                  </div>
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description Section */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <FileText className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='text-base font-semibold'>Mô Tả Sản Phẩm</h3>
                      <p className='text-sm text-muted-foreground'>Chi tiết chất liệu, thiết kế và đặc điểm</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='font-medium flex items-center gap-2'>
                          <FileText className='h-4 w-4' />
                          Mô Tả Chi Tiết *
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder='Mô tả chi tiết...' rows={6} className='resize-none' {...field} />
                        </FormControl>
                        <p className='text-xs text-muted-foreground'>Mô tả chi tiết giúp khách hàng hiểu rõ sản phẩm</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* URL Slug Section */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <Link className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='text-base font-semibold'>URL Thân Thiện</h3>
                      <p className='text-sm text-muted-foreground'>Đường dẫn hiển thị trên website</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='font-medium flex items-center gap-2'>
                          <Link className='h-4 w-4' />
                          URL Slug *
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input placeholder='dam-bau-da-tiec-sang-trong' className='h-10 pl-9' {...field} />
                            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                              <Link className='h-4 w-4' />
                            </div>
                          </div>
                        </FormControl>
                        <div className='flex items-start gap-2 mt-2'>
                          <Info className='h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                          <div className='text-xs text-muted-foreground space-y-1'>
                            <p>
                              URL preview:{' '}
                              <code className='bg-muted px-2 py-1 rounded'>
                                mamafit.studio/products/{field.value || 'your-slug'}
                              </code>
                            </p>
                            <p>Tự động tạo từ tên sản phẩm, có thể chỉnh sửa thủ công</p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images Section */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <ImageIcon className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='text-base font-semibold'>Hình Ảnh Sản Phẩm</h3>
                      <p className='text-sm text-muted-foreground'>Upload ảnh chất lượng cao để thu hút khách hàng</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='images'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='font-medium flex items-center gap-2'>
                          <ImageIcon className='h-4 w-4' />
                          Hình Ảnh Đầm Bầu *
                        </FormLabel>
                        <FormControl>
                          <CloudinaryImageUpload
                            value={field.value || []}
                            onChange={field.onChange}
                            maxFiles={10}
                            placeholder='Upload hình ảnh đầm bầu hoặc kéo thả ảnh vào đây'
                            disabled={isLoading}
                            uploadOptions={{
                              folder: 'maternity-dresses',
                              tags: ['maternity-dress', 'product'],
                              width: 800,
                              height: 800,
                              crop: 'limit',
                              quality: 'auto',
                              format: 'auto'
                            }}
                          />
                        </FormControl>
                        <div className='bg-muted p-4 rounded-xl border'>
                          <div className='flex items-start gap-3'>
                            <ImageIcon className='h-5 w-5 text-muted-foreground mt-0.5' />
                            <div className='space-y-2 text-sm text-muted-foreground'>
                              <p className='font-semibold'>Lưu ý về hình ảnh</p>
                              <ul className='space-y-1 text-xs'>
                                <li>• Tối đa 10 hình ảnh, khuyến khích 5-8 ảnh từ nhiều góc độ</li>
                                <li>• Độ phân giải tối thiểu 800x800px để đảm bảo chất lượng</li>
                                <li>• Ảnh đầu tiên sẽ là ảnh đại diện chính của sản phẩm</li>
                                <li>• Hệ thống tự động tối ưu kích thước và chất lượng</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Next Steps Info */}
              <Card className='shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <CheckCircle className='h-5 w-5 text-muted-foreground mt-1' />
                    <div className='flex-1'>
                      <h4 className='text-base font-semibold mb-2'>Bước tiếp theo sau khi tạo sản phẩm</h4>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-background p-4 rounded-xl border'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='text-xs' variant='secondary'>
                              Bước 1
                            </Badge>
                          </div>
                          <h5 className='font-semibold'>Thêm biến thể</h5>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Click vào sản phẩm → tab "Chi tiết" để thêm màu sắc, size, giá
                          </p>
                        </div>

                        <div className='bg-background p-4 rounded-xl border'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='text-xs' variant='secondary'>
                              Bước 2
                            </Badge>
                          </div>
                          <h5 className='font-semibold'>Quản lý tồn kho</h5>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Theo dõi số lượng và giá trị tồn kho qua tab "Tồn kho"
                          </p>
                        </div>

                        <div className='bg-background p-4 rounded-xl border'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='text-xs' variant='secondary'>
                              Bước 3
                            </Badge>
                          </div>
                          <h5 className='font-semibold'>Bán hàng</h5>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Sản phẩm sẽ hiển thị trên website sau khi hoàn tất
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className='flex justify-end gap-4 pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className='h-10'
                >
                  <X className='h-4 w-4 mr-2' />
                  Hủy bỏ
                </Button>
                <Button type='submit' disabled={isLoading} className='h-10'>
                  {isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Đang tạo sản phẩm...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Tạo Đầm Bầu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
