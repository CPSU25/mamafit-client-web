/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Package,
  Info,
  BarChart3,
  X,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { useMaternityDressStore } from '@/stores/admin/maternity-dress.store'
import { MaternityDressDetailFormData, MaternityDressDetailType } from '@/@types/inventory.type'
import {
  useGetMaternityDressDetail,
  useCreateMaternityDressDetail,
  useDeleteMaternityDressDetail
} from '@/services/admin/maternity-dress.service'
import { toast } from 'sonner'

// Component riêng để xử lý hình ảnh tránh vòng lặp
function DetailProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-image.jpg')
    }
  }

  if (hasError && imgSrc === '/placeholder-image.jpg') {
    return (
      <div className={`bg-muted flex items-center justify-center ${className || 'w-16 h-16 rounded-xl'}`}>
        <Package className='h-6 w-6 text-muted-foreground' />
      </div>
    )
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />
}

// Component để hiển thị gallery hình ảnh
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className='h-60 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground'>
        <Package className='h-12 w-12 mb-2 opacity-50' />
        <p className='text-sm'>Chưa có hình ảnh</p>
      </div>
    )
  }

  if (showAllImages) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>Hiển thị tất cả {images.length} hình ảnh</p>
          <Button size='sm' variant='outline' onClick={() => setShowAllImages(false)} className='text-xs'>
            Thu gọn
          </Button>
        </div>
        <div className='max-h-96 overflow-y-auto space-y-3 pr-2'>
          <div className='grid grid-cols-2 gap-3'>
            {images.map((image: string, index: number) => (
              <div key={`all-${index}`} className='relative group'>
                <DetailProductImage
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className='w-full h-32 object-cover rounded-lg border-2 border-border group-hover:border-primary transition-colors'
                />
                <div className='absolute top-2 left-2'>
                  <Badge variant='secondary' className='text-xs'>
                    {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Main image display */}
      <div className='relative'>
        <DetailProductImage
          src={images[currentImageIndex]}
          alt={`${productName} ${currentImageIndex + 1}`}
          className='w-full h-64 object-cover rounded-lg border-2 border-border'
        />
        <div className='absolute top-2 left-2'>
          <Badge variant='secondary' className='text-xs'>
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              size='sm'
              variant='secondary'
              className='absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-background/80 hover:bg-background'
              onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='secondary'
              className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-background/80 hover:bg-background'
              onClick={() => setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className='flex items-center gap-2'>
          <div className='flex gap-2 overflow-x-auto pb-2 flex-1'>
            {images.map((image: string, index: number) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 relative ${
                  currentImageIndex === index ? 'ring-2 ring-primary' : ''
                } rounded-lg overflow-hidden`}
              >
                <DetailProductImage
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className='w-16 h-16 object-cover'
                />
              </button>
            ))}
          </div>
          {images.length > 4 && (
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowAllImages(true)}
              className='text-xs whitespace-nowrap'
            >
              Xem tất cả
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colors = ['Đỏ', 'Xanh Navy', 'Đen', 'Trắng', 'Hồng', 'Xanh Dương', 'Xám', 'Be', 'Nâu', 'Vàng', 'Tím', 'Xanh Lá']

export default function ExpendMaternityDressDetails() {
  const { expandedMaternityDressId, activeTab, setActiveTab } = useMaternityDressStore()

  const [showAddForm, setShowAddForm] = useState(false)

  // React Query hooks - Get maternity dress detail by ID
  const { data: maternityDressDetailData, isLoading: isLoadingDetail } = useGetMaternityDressDetail(
    expandedMaternityDressId || ''
  )
  const createDetailMutation = useCreateMaternityDressDetail()
  const deleteDetailMutation = useDeleteMaternityDressDetail()

  const form = useForm<MaternityDressDetailFormData>({
    defaultValues: {
      maternityDressId: '',
      name: '',
      description: '',
      images: [],
      color: '',
      size: '',
      quantity: 0,
      price: 0
    }
  })

  // Set maternityDressId when expandedMaternityDressId changes
  useEffect(() => {
    if (expandedMaternityDressId) {
      form.setValue('maternityDressId', expandedMaternityDressId)
    }
  }, [expandedMaternityDressId, form])

  const handleAddDetail = async (data: MaternityDressDetailFormData) => {
    if (!expandedMaternityDressId) return

    try {
      await createDetailMutation.mutateAsync({
        ...data,
        maternityDressId: expandedMaternityDressId
      })
      toast.success('Thêm chi tiết thành công!')
      setShowAddForm(false)
      form.reset()
      // Reset maternityDressId
      form.setValue('maternityDressId', expandedMaternityDressId)
    } catch (error) {
      console.error('Error adding detail:', error)
      toast.error('Có lỗi xảy ra khi thêm chi tiết')
    }
  }

  const handleRemoveDetail = async (detailId: string) => {
    try {
      await deleteDetailMutation.mutateAsync(detailId)
      toast.success('Xóa chi tiết thành công!')
    } catch (error) {
      console.error('Error removing detail:', error)
      toast.error('Có lỗi xảy ra khi xóa chi tiết')
    }
  }

  if (!expandedMaternityDressId) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <Package className='h-16 w-16 text-muted-foreground' />
          <p className='text-muted-foreground'>Chọn một đầm bầu để xem chi tiết</p>
        </div>
      </div>
    )
  }

  // Get data from detail API response
  const maternityDress = maternityDressDetailData?.data
  const maternityDressDetails: MaternityDressDetailType[] = maternityDressDetailData?.data?.details || []

  if (isLoadingDetail || !maternityDress) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='text-muted-foreground'>Đang tải thông tin đầm bầu...</p>
        </div>
      </div>
    )
  }

  const totalStock = maternityDressDetails.reduce(
    (sum: number, detail: MaternityDressDetailType) => sum + detail.quantity,
    0
  )
  const totalValue = maternityDressDetails.reduce(
    (sum: number, detail: MaternityDressDetailType) => sum + detail.quantity * detail.price,
    0
  )

  return (
    <div className=''>
      <div className='p-8'>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3 bg-background shadow-sm border border-border rounded-xl p-1'>
            <TabsTrigger
              value='info'
              className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all'
            >
              <Info className='h-4 w-4' />
              Thông tin
            </TabsTrigger>
            <TabsTrigger
              value='details'
              className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all'
            >
              <Settings className='h-4 w-4' />
              Chi tiết ({maternityDressDetails.length})
            </TabsTrigger>
            <TabsTrigger
              value='inventory'
              className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all'
            >
              <BarChart3 className='h-4 w-4' />
              Tồn kho
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Product Information */}
          <TabsContent value='info' className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 '>
              {/* Basic Info */}
              <Card className='border-0 shadow-xl bg-background py-0 gap-1'>
                <CardHeader className='bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg py-2'>
                  <CardTitle className='flex items-center gap-2'>
                    <Info className='h-5 w-5' />
                    Thông Tin Cơ Bản
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-1 gap-4'>
                    <div className='grid grid-cols-2 gap-6'>
                      <div className='space-y-3'>
                        <div className='p-3 bg-muted rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                            Mã đầm bầu
                          </span>
                          <p className='text-sm font-mono text-foreground mt-1'>{maternityDress.id}</p>
                        </div>
                        <div className='p-3 bg-muted rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                            Style
                          </span>
                          <p className='text-sm text-foreground mt-1'>{maternityDress.styleName}</p>
                        </div>
                        <div className='p-3 bg-muted rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                            Slug URL
                          </span>
                          <p className='text-sm font-mono text-foreground mt-1'>{maternityDress.slug}</p>
                        </div>
                      </div>
                      <div className='space-y-3'>
                        <div className='p-3 bg-primary/10 rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-primary uppercase tracking-wide'>Thành Phần</span>
                          <p className='text-sm font-bold text-primary mt-1'>{maternityDressDetails.length}</p>
                        </div>
                        <div className='p-3 bg-accent/10 rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-accent uppercase tracking-wide'>
                            Tổng số lượng sản phẩm
                          </span>
                          <p className='text-sm font-bold text-accent mt-1'>{totalStock}</p>
                        </div>
                        <div className='p-3 bg-secondary/10 rounded-lg shadow-md'>
                          <span className='text-xs font-medium text-secondary-foreground uppercase tracking-wide'>
                            Tổng giá trị sản phẩm
                          </span>
                          <p className='text-sm font-bold text-secondary-foreground mt-1'>
                            {totalValue.toLocaleString()} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images - Updated */}
              <Card className='border-0 shadow-xl bg-background py-0 gap-1'>
                <CardHeader className='bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-t-lg py-2'>
                  <CardTitle className='flex items-center gap-2'>
                    <Package className='h-5 w-5' />
                    Hình Ảnh Đầm Bầu ({maternityDress.images?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-4'>
                  <ImageGallery images={maternityDress.images || []} productName={maternityDress.name} />
                </CardContent>
              </Card>
            </div>

            {/* Description - Updated with scrollable textarea */}
            <Card className='border-0 shadow-xl bg-background py-0 gap-1'>
              <CardHeader className='bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground rounded-t-lg py-2'>
                <CardTitle>Mô Tả Đầm Bầu</CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='relative'>
                  <Textarea
                    value={maternityDress.description || 'Chưa có mô tả chi tiết cho đầm bầu này.'}
                    readOnly
                    className='min-h-[120px] max-h-[300px] resize-none border-border bg-muted text-foreground leading-relaxed focus:ring-0 focus:border-border'
                    placeholder='Chưa có mô tả chi tiết cho đầm bầu này.'
                  />
                  {!maternityDress.description && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <span className='text-muted-foreground italic text-sm'>
                        Chưa có mô tả chi tiết cho đầm bầu này.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Maternity Dress Details */}
          <TabsContent value='details' className='space-y-6'>
            <Card className='border-0 shadow-xl py-0 bg-background gap-1'>
              <CardHeader className='bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg my-auto py-1'>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center justify-center'>
                    <Settings className='h-5 w-5' />
                    Chi Tiết Đầm Bầu ({maternityDressDetails.length})
                  </div>
                  <Button
                    size='sm'
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={createDetailMutation.isPending}
                    className='bg-background text-primary hover:bg-accent border border-border'
                  >
                    {showAddForm ? (
                      <>
                        <X className='h-4 w-4 mr-2' />
                        Đóng Form
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-2' />
                        Thêm Chi Tiết
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                {/* Add Detail Form */}
                {showAddForm && (
                  <Card className='mb-6 border-2 border-dashed border-primary/30 bg-primary/5'>
                    <CardHeader className='pb-4'>
                      <CardTitle className='text-lg text-primary flex items-center gap-2'>
                        <Plus className='h-5 w-5' />
                        Thêm Chi Tiết Mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddDetail)} className='space-y-6'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <FormField
                              control={form.control}
                              name='name'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-foreground font-medium'>Tên Chi Tiết *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Đầm bầu màu đỏ size M'
                                      className='border-border focus:border-primary focus:ring-primary'
                                      {...field}
                                    />
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
                                  <FormLabel className='text-foreground font-medium'>Màu Sắc *</FormLabel>
                                  <FormControl>
                                    <select
                                      className='w-full border border-border focus:border-primary focus:ring-primary bg-background px-3 py-2 text-sm rounded-md'
                                      {...field}
                                    >
                                      <option value=''>Chọn màu sắc</option>
                                      {colors.map((color) => (
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
                                  <FormLabel className='text-foreground font-medium'>Kích Thước *</FormLabel>
                                  <FormControl>
                                    <select
                                      className='w-full border border-border focus:border-primary focus:ring-primary bg-background px-3 py-2 text-sm rounded-md'
                                      {...field}
                                    >
                                      <option value=''>Chọn size</option>
                                      {sizes.map((size) => (
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
                                  <FormLabel className='text-foreground font-medium'>Số Lượng *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      placeholder='10'
                                      className='border-border focus:border-primary focus:ring-primary'
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
                                  <FormLabel className='text-foreground font-medium'>Giá *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      placeholder='29.99'
                                      className='border-border focus:border-primary focus:ring-primary'
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
                                <FormLabel className='text-foreground font-medium'>Mô Tả</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='Mô tả chi tiết về phiên bản này...'
                                    className='border-border focus:border-primary focus:ring-primary'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='images'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-foreground font-medium'>Hình Ảnh Chi Tiết *</FormLabel>
                                <FormControl>
                                  <CloudinaryImageUpload
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    maxFiles={5}
                                    placeholder='Upload hình ảnh chi tiết của phiên bản này'
                                    disabled={createDetailMutation.isPending}
                                    uploadOptions={{
                                      folder: 'maternity-dress-details', // Tổ chức ảnh theo thư mục chi tiết
                                      tags: ['maternity-dress-detail', 'product-variant'], // Tags để phân loại
                                      width: 600, // Resize phù hợp cho chi tiết
                                      height: 600,
                                      crop: 'limit', // Giữ tỷ lệ, resize trong giới hạn
                                      quality: 'auto', // Tự động tối ưu chất lượng
                                      format: 'auto' // Tự động chọn format tốt nhất
                                    }}
                                  />
                                </FormControl>
                                <p className='text-xs text-muted-foreground'>
                                  Thêm tối đa 5 hình ảnh để hiển thị chi tiết màu sắc, kích thước của phiên bản này.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='flex gap-3 pt-4 border-t border-border'>
                            <Button
                              type='submit'
                              disabled={createDetailMutation.isPending}
                              className='bg-primary hover:bg-primary/90 text-primary-foreground'
                            >
                              {createDetailMutation.isPending ? (
                                <>
                                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                  Đang thêm...
                                </>
                              ) : (
                                <>
                                  <Save className='h-4 w-4 mr-2' />
                                  Thêm Chi Tiết
                                </>
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => setShowAddForm(false)}
                              className='border-border hover:bg-muted'
                            >
                              <X className='h-4 w-4 mr-2' />
                              Hủy
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {/* Details List */}
                {maternityDressDetails.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='max-w-sm mx-auto'>
                      <Settings className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
                      <h3 className='text-lg font-medium text-foreground mb-2'>Chưa có chi tiết nào</h3>
                      <p className='text-muted-foreground mb-6'>
                        Thêm các chi tiết như màu sắc, size, giá để hoàn thiện đầm bầu và bắt đầu bán hàng
                      </p>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className='bg-primary hover:bg-primary/90 text-primary-foreground'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Thêm Chi Tiết Đầu Tiên
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                      <Card
                        key={detail.id}
                        className='relative group hover:shadow-lg transition-shadow border border-border'
                      >
                        <Button
                          size='sm'
                          variant='destructive'
                          className='absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10'
                          onClick={() => handleRemoveDetail(detail.id)}
                          disabled={deleteDetailMutation.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>

                        <CardContent className='p-0'>
                          {detail.images && detail.images.length > 0 ? (
                            <DetailProductImage
                              src={detail.images[0]}
                              alt={detail.name}
                              className='w-full h-48 object-cover rounded-t-lg'
                            />
                          ) : (
                            <div className='w-full h-48 bg-gradient-to-br from-muted to-muted/80 rounded-t-lg flex items-center justify-center'>
                              <Package className='h-12 w-12 text-muted-foreground' />
                            </div>
                          )}

                          <div className='p-4'>
                            <h4 className='font-semibold text-foreground mb-3 text-lg'>{detail.name}</h4>

                            <div className='space-y-2 mb-4'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Màu sắc:</span>
                                <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20'>
                                  {detail.color}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Kích thước:</span>
                                <Badge variant='outline' className='bg-accent/10 text-accent border-accent/20'>
                                  {detail.size}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Số lượng:</span>
                                <Badge
                                  variant={detail.quantity > 10 ? 'default' : 'destructive'}
                                  className='font-semibold'
                                >
                                  {detail.quantity}
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Giá:</span>
                                <span className='font-semibold text-secondary'>${detail.price}</span>
                              </div>
                            </div>

                            {detail.description && (
                              <div className='pt-3 border-t border-border'>
                                <p className='text-xs text-muted-foreground line-clamp-2'>{detail.description}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Inventory Management */}
          <TabsContent value='inventory' className='space-y-6'>
            <Card className='border-0 shadow-md bg-background'>
              <CardHeader className='bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-t-lg'>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Thống Kê Tồn Kho
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                  <div className='bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-xl border border-primary/20'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-sm font-medium text-primary'>Tổng chi tiết</span>
                        <p className='text-3xl font-bold text-primary mt-1'>{maternityDressDetails.length}</p>
                      </div>
                      <Package className='h-10 w-10 text-primary' />
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-xl border border-accent/20'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-sm font-medium text-accent'>Tổng tồn kho</span>
                        <p className='text-3xl font-bold text-accent mt-1'>{totalStock}</p>
                      </div>
                      <BarChart3 className='h-10 w-10 text-accent' />
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-secondary/10 to-secondary/20 p-6 rounded-xl border border-secondary/20'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-sm font-medium text-secondary-foreground'>Giá trị tồn kho</span>
                        <p className='text-3xl font-bold text-secondary-foreground mt-1'>
                          ${totalValue.toLocaleString()}
                        </p>
                      </div>
                      <div className='h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center'>
                        <span className='text-secondary-foreground font-bold text-lg'>$</span>
                      </div>
                    </div>
                  </div>
                </div>

                {maternityDressDetails.length > 0 ? (
                  <div className='space-y-4'>
                    <h4 className='text-lg font-semibold text-foreground mb-4'>Chi Tiết Tồn Kho Theo Phiên Bản</h4>
                    <div className='space-y-3'>
                      {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                        <div
                          key={detail.id}
                          className='flex items-center justify-between p-4 bg-muted rounded-lg border'
                        >
                          <div className='flex items-center gap-4'>
                            {detail.images && detail.images.length > 0 && (
                              <DetailProductImage
                                src={detail.images[0]}
                                alt={detail.name}
                                className='w-12 h-12 rounded-lg object-cover border'
                              />
                            )}
                            <div>
                              <p className='font-medium text-foreground'>{detail.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {detail.color} • {detail.size} • ${detail.price}
                              </p>
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-semibold text-foreground'>{detail.quantity}</p>
                            <p className='text-sm text-muted-foreground'>đơn vị</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <BarChart3 className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
                    <h4 className='text-lg font-medium text-foreground mb-2'>Chưa có dữ liệu tồn kho</h4>
                    <p className='text-muted-foreground'>Thêm chi tiết đầm bầu để xem thống kê tồn kho</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
