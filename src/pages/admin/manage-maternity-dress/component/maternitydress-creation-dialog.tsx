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
import { MaternityDressFormData } from '@/@types/inventory.type'
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
      <DialogContent className='max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10 border-0 shadow-2xl'>
        {/* Enhanced Dialog Header */}
        <DialogHeader className='pb-8 border-b border-violet-200 dark:border-violet-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl'>
                <Sparkles className='h-8 w-8 text-white' />
              </div>
              <div>
                <DialogTitle className='text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
                  Tạo Đầm Bầu Mới
                </DialogTitle>
                <p className='text-violet-600 dark:text-violet-400 mt-2'>
                  Tạo sản phẩm đầm bầu cơ bản, sau đó thêm các biến thể chi tiết
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
              className='rounded-full h-10 w-10 p-0 hover:bg-violet-100 dark:hover:bg-violet-900/30'
            >
              <X className='h-5 w-5 text-violet-500' />
            </Button>
          </div>

          {/* Error Alert */}
          {stylesError && (
            <div className='mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-lg'>
                  <AlertCircle className='h-5 w-5 text-red-500' />
                </div>
                <div>
                  <h4 className='font-semibold text-red-700 dark:text-red-400'>Lỗi tải dữ liệu</h4>
                  <p className='text-sm text-red-600 dark:text-red-500'>
                    Không thể tải danh sách kiểu dáng. Vui lòng thử lại sau hoặc liên hệ support.
                  </p>
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
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-background/80 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg'>
                      <Heart className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Thông Tin Cơ Bản</h3>
                      <p className='text-sm text-gray-500'>Tên sản phẩm và kiểu dáng</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                            <Sparkles className='h-4 w-4' />
                            Tên Đầm Bầu *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='VD: Đầm bầu dạ tiệc sang trọng'
                              className='h-12 border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 rounded-xl bg-white dark:bg-gray-800'
                              {...field}
                            />
                          </FormControl>
                          <p className='text-xs text-violet-600 dark:text-violet-400'>
                            Tên sẽ tự động tạo slug URL thân thiện
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='styleId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                            <Palette className='h-4 w-4' />
                            Kiểu Dáng *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className='h-12 border-violet-200 dark:border-violet-700 focus:border-violet-400 rounded-xl bg-white dark:bg-gray-800'>
                                <SelectValue placeholder='Chọn kiểu dáng phù hợp' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='max-h-60'>
                              {stylesLoading ? (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <Loader2 className='h-8 w-8 animate-spin text-violet-500 mx-auto' />
                                    <p className='text-sm text-violet-600'>Đang tải kiểu dáng...</p>
                                  </div>
                                </div>
                              ) : stylesError ? (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <AlertCircle className='h-8 w-8 text-red-500 mx-auto' />
                                    <p className='text-sm text-red-600'>Lỗi tải dữ liệu</p>
                                  </div>
                                </div>
                              ) : stylesData?.data.items && stylesData.data.items.length > 0 ? (
                                stylesData.data.items.map((style) => (
                                  <SelectItem key={style.id} value={style.id} className='py-3'>
                                    <div className='flex items-center gap-2'>
                                      <div className='w-3 h-3 bg-violet-400 rounded-full'></div>
                                      {style.name}
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className='flex items-center justify-center py-8'>
                                  <div className='text-center space-y-3'>
                                    <Package className='h-8 w-8 text-gray-400 mx-auto' />
                                    <p className='text-sm text-gray-500'>Không có kiểu dáng nào</p>
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
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-background/80 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                      <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Mô Tả Sản Phẩm</h3>
                      <p className='text-sm text-gray-500'>Chi tiết về chất liệu, thiết kế và đặc điểm</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2'>
                          <FileText className='h-4 w-4' />
                          Mô Tả Chi Tiết *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Mô tả chi tiết về đầm bầu: chất liệu, thiết kế, form dáng, phù hợp cho dịp nào, đặc điểm nổi bật...'
                            rows={6}
                            className='border-blue-200 dark:border-blue-700 focus:border-blue-400 focus:ring-blue-400 rounded-xl bg-white dark:bg-gray-800 resize-none'
                            {...field}
                          />
                        </FormControl>
                        <p className='text-xs text-blue-600 dark:text-blue-400'>
                          Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* URL Slug Section */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-background/80 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
                      <Link className='h-5 w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>URL Thân Thiện</h3>
                      <p className='text-sm text-gray-500'>Đường dẫn hiển thị trên website</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-green-700 dark:text-green-300 font-semibold flex items-center gap-2'>
                          <Link className='h-4 w-4' />
                          URL Slug *
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              placeholder='dam-bau-da-tiec-sang-trong'
                              className='h-12 border-green-200 dark:border-green-700 focus:border-green-400 focus:ring-green-400 rounded-xl bg-white dark:bg-gray-800 pl-12'
                              {...field}
                            />
                            <div className='absolute left-4 top-1/2 -translate-y-1/2 text-green-500'>
                              <Link className='h-4 w-4' />
                            </div>
                          </div>
                        </FormControl>
                        <div className='flex items-start gap-2 mt-2'>
                          <Info className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                          <div className='text-xs text-green-600 dark:text-green-400 space-y-1'>
                            <p>
                              URL preview:{' '}
                              <code className='bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded'>
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
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-background/80 backdrop-blur-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                      <ImageIcon className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Hình Ảnh Sản Phẩm</h3>
                      <p className='text-sm text-gray-500'>Upload ảnh chất lượng cao để thu hút khách hàng</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name='images'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2'>
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
                        <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700'>
                          <div className='flex items-start gap-3'>
                            <ImageIcon className='h-5 w-5 text-purple-500 mt-0.5' />
                            <div className='space-y-2 text-sm text-purple-700 dark:text-purple-300'>
                              <p className='font-semibold'>💡 Lưu ý về hình ảnh:</p>
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
              <Card className='border-0 shadow-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-700'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='p-2 bg-violet-500 rounded-lg'>
                      <CheckCircle className='h-6 w-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-lg font-bold text-violet-700 dark:text-violet-300 mb-3'>
                        🎉 Bước tiếp theo sau khi tạo sản phẩm
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='bg-white dark:bg-gray-800 p-4 rounded-xl border border-violet-200 dark:border-violet-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='bg-violet-100 text-violet-700 text-xs'>Bước 1</Badge>
                          </div>
                          <h5 className='font-semibold text-gray-800 dark:text-gray-200'>Thêm biến thể</h5>
                          <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                            Click vào sản phẩm → tab "Chi tiết" để thêm màu sắc, size, giá
                          </p>
                        </div>

                        <div className='bg-white dark:bg-gray-800 p-4 rounded-xl border border-violet-200 dark:border-violet-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='bg-blue-100 text-blue-700 text-xs'>Bước 2</Badge>
                          </div>
                          <h5 className='font-semibold text-gray-800 dark:text-gray-200'>Quản lý tồn kho</h5>
                          <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                            Theo dõi số lượng và giá trị tồn kho qua tab "Tồn kho"
                          </p>
                        </div>

                        <div className='bg-white dark:bg-gray-800 p-4 rounded-xl border border-violet-200 dark:border-violet-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge className='bg-green-100 text-green-700 text-xs'>Bước 3</Badge>
                          </div>
                          <h5 className='font-semibold text-gray-800 dark:text-gray-200'>Bán hàng</h5>
                          <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                            Sản phẩm sẽ hiển thị trên website sau khi hoàn tất
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className='flex justify-end gap-4 pt-6 border-t border-violet-200 dark:border-violet-700'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className='border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl h-12 px-8'
                >
                  <X className='h-4 w-4 mr-2' />
                  Hủy bỏ
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8'
                >
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

        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(139, 92, 246, 0.5);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
