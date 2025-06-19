import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { MaternityDressFormData } from '@/@types/inventory.type'
import { useCreateMaternityDress } from '@/services/admin/maternity-dress/useMaternityDress'
import { useGetStyles } from '@/services/admin/catogories/useStyles'
import { toast } from 'sonner'

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
    pageSize: 50,
    sortBy: 'createdat_desc'
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
      <DialogContent className='max-w-4xl min-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Tạo Đầm Bầu Mới</DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Tạo đầm bầu cơ bản. Sau đó bạn có thể thêm các chi tiết như màu sắc, size, giá cả thông qua phần quản lý chi
            tiết.
          </p>
          {stylesError && (
            <div className='mt-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <div className='flex items-center gap-2 text-red-700'>
                <Package className='h-4 w-4' />
                <span className='text-sm'>Không thể tải danh sách kiểu dáng. Vui lòng thử lại sau.</span>
              </div>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Đầm Bầu *</FormLabel>
                    <FormControl>
                      <Input placeholder='Đầm bầu dạ tiệc sang trọng' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='styleId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu Dáng *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn kiểu dáng' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stylesLoading ? (
                          <div className='flex items-center justify-center py-4'>
                            <Loader2 className='h-4 w-4 animate-spin mr-2' />
                            <span className='text-sm text-gray-500'>Đang tải...</span>
                          </div>
                        ) : stylesError ? (
                          <div className='flex items-center justify-center py-4'>
                            <Package className='h-4 w-4 mr-2 text-red-500' />
                            <span className='text-sm text-red-500'>Lỗi tải dữ liệu</span>
                          </div>
                        ) : stylesData?.data.items && stylesData.data.items.length > 0 ? (
                          stylesData.data.items.map((style) => (
                            <SelectItem key={style.id} value={style.id}>
                              {style.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className='flex items-center justify-center py-4'>
                            <Package className='h-4 w-4 mr-2 text-gray-400' />
                            <span className='text-sm text-gray-500'>Không có style nào</span>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Mô Tả *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả chi tiết về đầm bầu, chất liệu, thiết kế, phù hợp cho dịp nào...'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder='dam-bau-da-tiec-sang-trong' {...field} />
                  </FormControl>
                  <p className='text-xs text-muted-foreground'>
                    URL thân thiện để hiển thị trên website. Sẽ tự động tạo từ tên sản phẩm.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình Ảnh Đầm Bầu *</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={10}
                      placeholder='Upload hình ảnh đầm bầu hoặc nhập URL'
                    />
                  </FormControl>
                  <p className='text-xs text-muted-foreground'>
                    Thêm tối đa 10 hình ảnh để khách hàng có thể xem đầm bầu từ nhiều góc độ.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Message */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h4 className='font-medium text-blue-800 mb-2'>💡 Bước tiếp theo:</h4>
              <ul className='text-sm text-blue-700 space-y-1'>
                <li>• Sau khi tạo đầm bầu cơ bản, bạn có thể click vào đầm bầu trong bảng để xem chi tiết</li>
                <li>• Thêm các phiên bản với màu sắc, kích thước và giá cả khác nhau</li>
                <li>• Quản lý số lượng tồn kho cho từng phiên bản</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo Đầm Bầu'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
