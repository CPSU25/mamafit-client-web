import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Loader2, ImageIcon, Sparkles, FileText, Hash } from 'lucide-react'

import { MaternityDress } from '../data/schema'
import { useCreateMaternityDress, useUpdateMaternityDress } from '@/services/admin/maternity-dress.service'
import { useGetStyles, useGetStyleById } from '@/services/admin/category.service'
import { FirebaseImageUpload } from '@/components/firebase-image-upload'

// Function to generate slug from Vietnamese text
const generateSlug = (text: string): string => {
  if (!text) return ''

  return text
    .toLowerCase()
    .normalize('NFD') // Decompose Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd') // Replace đ
    .replace(/Đ/g, 'd') // Replace Đ
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

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

  // Fetch styles data
  const { data: stylesData, isLoading: stylesLoading } = useGetStyles({ pageSize: 100 })
  const styles = useMemo(() => stylesData?.data?.items || [], [stylesData])

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

  // Fetch current style detail by selected styleId (after form is created)
  const selectedStyleId = form.watch('styleId')
  const { data: selectedStyleData } = useGetStyleById(selectedStyleId)
  const selectedStyle = selectedStyleData?.data

  // Watch name field to auto-generate slug
  const watchedName = form.watch('name')

  // Reset form khi dialog đóng mở
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        const safeImages = Array.isArray(currentRow.images) ? (currentRow.images.filter(Boolean) as string[]) : []

        form.reset({
          styleId: '', // preselect separately after styles are loaded
          name: currentRow?.name ?? '',
          description: currentRow?.description ?? '',
          images: safeImages,
          slug: currentRow?.slug ?? ''
        })
        setImages(safeImages)
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

  // Preselect styleId based on currentRow.styleName when styles are loaded
  useEffect(() => {
    if (isEdit && currentRow && styles.length > 0) {
      const currentValue = form.getValues('styleId')
      if (!currentValue) {
        const matchedStyleId = styles.find((s) => s.name === currentRow.styleName)?.id
        if (matchedStyleId) {
          form.setValue('styleId', matchedStyleId, { shouldDirty: false, shouldValidate: true })
        }
      }
    }
  }, [isEdit, currentRow, styles, form])

  // Auto-generate slug when name changes (only for new items)
  useEffect(() => {
    if (!isEdit && watchedName) {
      const slug = generateSlug(watchedName)
      form.setValue('slug', slug)
    }
  }, [watchedName, isEdit, form])

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
      // Error already handled in mutation onError
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  // Avoid state update during child render by deferring updates
  const handleImagesChange = useMemo(
    () => (next: string[]) => {
      Promise.resolve().then(() => setImages(next))
    },
    []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
              <Package className='h-5 w-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>{isEdit ? 'Chỉnh sửa đầm bầu' : 'Thêm đầm bầu mới'}</h2>
              <p className='text-sm text-muted-foreground font-normal'>
                {isEdit
                  ? 'Cập nhật thông tin đầm bầu trong hệ thống'
                  : 'Tạo một đầm bầu mới với các thông tin chi tiết'}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {isEdit ? 'Chỉnh sửa thông tin đầm bầu' : 'Tạo đầm bầu mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Left Column - Basic Info */}
              <div className='space-y-6'>
                <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-background dark:from-violet-950/20'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Sparkles className='h-4 w-4 text-violet-500' />
                      Thông tin cơ bản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Style Selection */}
                    <FormField
                      control={form.control}
                      name='styleId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2 font-medium'>
                            <Package className='h-4 w-4 text-muted-foreground' />
                            Chọn style *
                          </FormLabel>
                          <FormControl>
                            <div>
                              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={stylesLoading}>
                                <SelectTrigger className='w-full h-auto min-h-[2.5rem]'>
                                  <SelectValue
                                    placeholder={stylesLoading ? 'Đang tải styles...' : 'Chọn style cho đầm bầu'}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {styles.map((style) => (
                                    <SelectItem key={style.id} value={style.id}>
                                      <div className='flex flex-col items-start gap-1 py-1'>
                                        <span className='font-medium text-sm'>{style.name}</span>
                                        {style.description && (
                                          <span className='text-xs text-muted-foreground leading-tight max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap'>
                                            {style.description}
                                          </span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          {selectedStyle && (
                            <div className='mt-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground'>
                              <div className='font-medium text-foreground'>{selectedStyle.name}</div>
                              {selectedStyle.description && (
                                <div className='line-clamp-2'>{selectedStyle.description}</div>
                              )}
                            </div>
                          )}
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
                          <FormLabel className='flex items-center gap-2 font-medium'>
                            <FileText className='h-4 w-4 text-muted-foreground' />
                            Tên đầm bầu *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='VD: Đầm bầu công sở thanh lịch...'
                              className='h-10'
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
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
                          <FormLabel className='flex items-center gap-2 font-medium'>
                            <Hash className='h-4 w-4 text-muted-foreground' />
                            URL Slug *
                            {!isEdit && (
                              <span className='text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-md'>
                                Tự động tạo
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='dam-bau-cong-so-thanh-lich'
                              className='h-10 font-mono text-sm'
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className='text-xs text-muted-foreground mt-1'>
                            URL thân thiện cho SEO.{' '}
                            {!isEdit ? 'Tự động tạo từ tên đầm bầu.' : 'Có thể chỉnh sửa thủ công.'}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Details */}
              <div className='space-y-6'>
                {/* Description */}
                <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <FileText className='h-4 w-4 text-blue-500' />
                      Mô tả sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder='Mô tả chi tiết về đầm bầu: chất liệu, phong cách, ưu điểm...'
                              className='min-h-[140px] resize-none leading-relaxed'
                              value={field.value ?? ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                            <span>Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm</span>
                            <span>{field.value?.length || 0} ký tự</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Images Section - Full Width */}
            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <ImageIcon className='h-4 w-4 text-green-500' />
                  Hình ảnh sản phẩm *
                  <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-md'>{images.length} ảnh</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='images'
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <FirebaseImageUpload value={images} onChange={handleImagesChange} className='w-full' />
                        </div>
                      </FormControl>
                      <div className='text-xs text-muted-foreground mt-2'>
                        Tải lên ít nhất 1 hình ảnh chất lượng cao cho sản phẩm. Khuyến nghị: 3-5 ảnh từ nhiều góc độ
                        khác nhau.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className='pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className='h-10'
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={isLoading || stylesLoading}
                className='h-10 bg-violet-500 hover:bg-violet-600 px-6'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {isEdit ? 'Đang cập nhật...' : 'Đang tạo mới...'}
                  </>
                ) : (
                  <>
                    <Package className='mr-2 h-4 w-4' />
                    {isEdit ? 'Cập nhật đầm bầu' : 'Tạo đầm bầu mới'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
