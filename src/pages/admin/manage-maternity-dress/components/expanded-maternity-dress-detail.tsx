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
  ChevronRight,
  Sparkles,
  Heart,
  Palette,
  Ruler,
  ShoppingBag,
  Star,
  TrendingUp,
  Eye,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MaternityDressDetailFormData, MaternityDressDetailType } from '@/@types/inventory.type'
import {
  useGetMaternityDressDetail,
  useCreateMaternityDressDetail,
  useDeleteMaternityDressDetail
} from '@/services/admin/maternity-dress.service'
import { toast } from 'sonner'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'

interface ExpandedMaternityDressDetailsProps {
  maternityDressId: string
}

// Enhanced Component riêng để xử lý hình ảnh tránh vòng lặp
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
      <div className={`flex items-center justify-center border ${className || 'w-16 h-16 rounded-xl'} bg-muted`}>
        <Package className='h-8 w-8 text-muted-foreground' />
      </div>
    )
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />
}

// Enhanced Component để hiển thị gallery hình ảnh
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className='h-80 border-2 border-dashed rounded-2xl bg-muted/40 flex flex-col items-center justify-center text-muted-foreground'>
        <ImageIcon className='h-8 w-8 mb-2' />
        <h4 className='font-medium mb-1'>Chưa có hình ảnh</h4>
        <p className='text-sm'>Thêm hình ảnh để khách hàng có thể xem sản phẩm</p>
      </div>
    )
  }

  if (showAllImages) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between p-4 bg-muted rounded-xl'>
          <div className='flex items-center gap-3'>
            <Eye className='h-5 w-5 text-muted-foreground' />
            <div>
              <p className='font-medium'>Tất cả hình ảnh</p>
              <p className='text-sm text-muted-foreground'>Hiển thị {images.length} ảnh</p>
            </div>
          </div>
          <Button size='sm' variant='outline' onClick={() => setShowAllImages(false)} className='rounded-lg'>
            <ChevronLeft className='h-4 w-4 mr-1' />
            Thu gọn
          </Button>
        </div>
        <div className='max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
          <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
            {images.map((image: string, index: number) => (
              <div key={`all-${index}`} className='relative group'>
                <DetailProductImage
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className='w-full h-40 object-cover rounded-xl border group-hover:shadow-sm transition-all duration-200'
                />
                <div className='absolute top-3 left-3'>
                  <Badge variant='secondary'>{index + 1}</Badge>
                </div>
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Enhanced Main image display */}
      <div className='relative overflow-hidden rounded-2xl'>
        <DetailProductImage
          src={images[currentImageIndex]}
          alt={`${productName} ${currentImageIndex + 1}`}
          className='w-full h-80 object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10'></div>

        {/* Image counter badge */}
        <div className='absolute top-4 left-4'>
          <Badge variant='secondary' className='backdrop-blur-sm'>
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              size='sm'
              variant='secondary'
              className='absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-background/70 hover:bg-background/90 text-foreground border'
              onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <Button
              size='sm'
              variant='secondary'
              className='absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 p-0 bg-background/70 hover:bg-background/90 text-foreground border'
              onClick={() => setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </>
        )}
      </div>

      {/* Enhanced Thumbnail navigation */}
      {images.length > 1 && (
        <div className='flex items-center gap-4'>
          <div className='flex gap-3 overflow-x-auto pb-2 flex-1 custom-scrollbar'>
            {images.map((image: string, index: number) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 relative group ${
                  currentImageIndex === index
                    ? 'ring-2 ring-pink-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-pink-300 hover:ring-offset-1'
                } rounded-xl overflow-hidden transition-all duration-200`}
              >
                <DetailProductImage
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className='w-20 h-20 object-cover'
                />
                {currentImageIndex !== index && (
                  <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200'></div>
                )}
              </button>
            ))}
          </div>
          {images.length > 5 && (
            <Button size='sm' variant='outline' onClick={() => setShowAllImages(true)} className='whitespace-nowrap'>
              <Eye className='h-4 w-4 mr-2' />
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

export function ExpandedMaternityDressDetails({ maternityDressId }: ExpandedMaternityDressDetailsProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [showAddForm, setShowAddForm] = useState(false)

  // React Query hooks - Get maternity dress detail by ID
  const { data: maternityDressDetailData, isLoading: isLoadingDetail } = useGetMaternityDressDetail(
    maternityDressId || ''
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
      setShowAddForm(false)
      form.reset()
      form.setValue('maternityDressId', maternityDressId)
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

  if (!maternityDressId) {
    return (
      <div className='p-12 text-center'>
        <div className='max-w-md mx-auto space-y-6'>
          <div className='w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-muted'>
            <Package className='h-8 w-8 text-muted-foreground' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-xl font-semibold'>Chọn đầm bầu để xem chi tiết</h3>
            <p className='text-muted-foreground'>
              Click vào một đầm bầu trong danh sách để xem thông tin chi tiết và quản lý variants
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Get data from detail API response
  const maternityDress = maternityDressDetailData?.data
  const maternityDressDetails: MaternityDressDetailType[] = maternityDressDetailData?.data?.details || []

  if (isLoadingDetail || !maternityDress) {
    return (
      <div className='p-12 text-center'>
        <div className='flex flex-col items-center gap-6'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <div className='space-y-2 text-center'>
            <h3 className='text-lg font-medium'>Đang tải thông tin đầm bầu</h3>
            <p className='text-muted-foreground'>Vui lòng chờ trong giây lát...</p>
          </div>
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
    <div className='min-h-screen'>
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className='space-y-8'>
          {/* Enhanced TabsList */}
          <div className='flex justify-center'>
            <TabsList className='grid w-full max-w-2xl grid-cols-3 rounded-2xl p-2 h-14'>
              <TabsTrigger
                value='info'
                className='flex items-center gap-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-xl transition-all duration-200 font-medium h-10'
              >
                <Info className='h-5 w-5' />
                <span className='hidden sm:inline'>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger
                value='details'
                className='flex items-center gap-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-xl transition-all duration-200 font-medium h-10'
              >
                <Settings className='h-5 w-5' />
                <span className='hidden sm:inline'>Chi tiết</span>
                <Badge variant='secondary' className='ml-1'>
                  {maternityDressDetails.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='inventory'
                className='flex items-center gap-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-xl transition-all duration-200 font-medium h-10'
              >
                <BarChart3 className='h-5 w-5' />
                <span className='hidden sm:inline'>Tồn kho</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Enhanced Product Information */}
          <TabsContent value='info' className='space-y-8'>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
              {/* Enhanced Basic Info */}
              <Card className='shadow-sm overflow-hidden'>
                <CardHeader className='p-4'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Info className='h-5 w-5 text-muted-foreground' />
                    Thông Tin Cơ Bản
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-4'>
                        <div className='p-4 rounded-xl border bg-muted/30'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Sparkles className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                              Mã sản phẩm
                            </span>
                          </div>
                          <p className='text-sm font-mono px-3 py-2 rounded-lg border bg-background'>
                            {maternityDress.id}
                          </p>
                        </div>

                        <div className='p-4 rounded-xl border bg-muted/30'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Heart className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                              Kiểu dáng
                            </span>
                          </div>
                          <p className='text-sm font-medium'>{maternityDress.styleName}</p>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div className='p-4 rounded-xl border bg-muted/30'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Star className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                              Biến thể
                            </span>
                          </div>
                          <p className='text-2xl font-bold'>{maternityDressDetails.length}</p>
                        </div>

                        <div className='p-4 rounded-xl border bg-muted/30'>
                          <div className='flex items-center gap-2 mb-2'>
                            <TrendingUp className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                              Tổng giá trị
                            </span>
                          </div>
                          <p className='text-lg font-bold'>{totalValue.toLocaleString()} VNĐ</p>
                        </div>
                      </div>
                    </div>

                    <div className='p-4 rounded-xl border bg-muted/30'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Package className='h-4 w-4 text-muted-foreground' />
                        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                          URL Slug
                        </span>
                      </div>
                      <p className='text-sm font-mono px-3 py-2 rounded-lg border bg-background'>
                        {maternityDress.slug}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Product Images */}
              <Card className='shadow-sm overflow-hidden'>
                <CardHeader className='p-4'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <ImageIcon className='h-5 w-5 text-muted-foreground' />
                    Hình Ảnh Sản Phẩm
                    <Badge variant='secondary' className='ml-auto'>
                      {maternityDress.images?.length || 0} ảnh
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <ImageGallery images={maternityDress.images || []} productName={maternityDress.name} />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Description */}
            <Card className='shadow-sm overflow-hidden'>
              <CardHeader className='p-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <Package className='h-5 w-5 text-muted-foreground' />
                  Mô Tả Sản Phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='relative'>
                  {maternityDress.description ? (
                    <div>
                      <Textarea
                        value={maternityDress.description}
                        readOnly
                        className='min-h-[150px] max-h-[400px] resize-none leading-relaxed'
                      />
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <div className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-muted'>
                        <Package className='h-6 w-6 text-muted-foreground' />
                      </div>
                      <p className='text-muted-foreground italic'>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Enhanced Maternity Dress Details */}
          <TabsContent value='details' className='space-y-8'>
            <Card className='shadow-sm overflow-hidden'>
              <CardHeader className='p-4'>
                <CardTitle className='flex items-center justify-between text-base'>
                  <div className='flex items-center gap-3'>
                    <Settings className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <h3 className='font-semibold'>Chi Tiết Sản Phẩm</h3>
                      <p className='text-sm text-muted-foreground'>Quản lý các biến thể màu sắc, size và giá</p>
                    </div>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={createDetailMutation.isPending}
                    className='h-9'
                  >
                    {showAddForm ? (
                      <>
                        <X className='h-4 w-4 mr-2' />
                        Đóng Form
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-2' />
                        Thêm Biến Thể
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                {/* Enhanced Add Detail Form */}
                {showAddForm && (
                  <Card className='mb-8 border-2 border-dashed overflow-hidden'>
                    <CardHeader className='p-4 border-b'>
                      <CardTitle className='text-base flex items-center gap-2'>
                        <Plus className='h-4 w-4 text-muted-foreground' />
                        Thêm Biến Thể Mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-6'>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddDetail)} className='space-y-6'>
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
                                  <FormLabel className='font-medium flex items-center gap-2'>
                                    <Ruler className='h-4 w-4' />
                                    Kích Thước *
                                  </FormLabel>
                                  <FormControl>
                                    <select className='w-full border px-3 py-2 text-sm rounded-md h-10' {...field}>
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
                                  <Textarea
                                    placeholder='Mô tả chi tiết...'
                                    rows={4}
                                    className='resize-none'
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
                                  Thêm tối đa 5 hình ảnh chất lượng cao để hiển thị chi tiết biến thể. Ảnh sẽ được tự
                                  động tối ưu để tải nhanh.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='flex gap-4 pt-6 border-t'>
                            <Button type='submit' disabled={createDetailMutation.isPending} className='h-10'>
                              {createDetailMutation.isPending ? (
                                <>
                                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                  Đang thêm...
                                </>
                              ) : (
                                <>
                                  <Save className='h-4 w-4 mr-2' />
                                  Thêm Biến Thể
                                </>
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => setShowAddForm(false)}
                              className='h-10'
                            >
                              <X className='h-4 w-4 mr-2' />
                              Hủy bỏ
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Details List */}
                {maternityDressDetails.length === 0 ? (
                  <div className='text-center py-16'>
                    <div className='max-w-md mx-auto space-y-6'>
                      <div className='w-32 h-32 rounded-full flex items-center justify-center mx-auto bg-muted'>
                        <Settings className='h-10 w-10 text-muted-foreground' />
                      </div>
                      <div className='space-y-3'>
                        <h3 className='text-2xl font-bold'>Chưa có biến thể nào</h3>
                        <p className='text-muted-foreground leading-relaxed'>
                          Tạo các biến thể với màu sắc, kích thước và giá khác nhau để hoàn thiện sản phẩm và bắt đầu
                          kinh doanh
                        </p>
                      </div>
                      <Button onClick={() => setShowAddForm(true)} className='h-10'>
                        <Plus className='h-4 w-4 mr-2' />
                        Tạo Biến Thể Đầu Tiên
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                      <Card
                        key={detail.id}
                        className='relative group transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md'
                      >
                        <Button
                          size='sm'
                          variant='destructive'
                          className='absolute top-4 right-4 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 rounded-lg'
                          onClick={() => handleRemoveDetail(detail.id)}
                          disabled={deleteDetailMutation.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>

                        <CardContent className='p-0'>
                          {detail.images && detail.images.length > 0 ? (
                            <div className='relative overflow-hidden'>
                              <DetailProductImage
                                src={detail.images[0]}
                                alt={detail.name}
                                className='w-full h-56 object-cover'
                              />
                              {detail.images.length > 1 && (
                                <Badge variant='secondary' className='absolute bottom-3 left-3 backdrop-blur-sm'>
                                  +{detail.images.length - 1} ảnh
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className='w-full h-56 flex items-center justify-center bg-muted'>
                              <div className='text-center space-y-2'>
                                <Package className='h-8 w-8 text-muted-foreground mx-auto' />
                                <p className='text-sm text-muted-foreground'>Chưa có ảnh</p>
                              </div>
                            </div>
                          )}

                          <div className='p-6 space-y-4'>
                            <h4 className='font-bold text-lg text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[3.5rem]'>
                              {detail.name}
                            </h4>

                            <div className='grid grid-cols-2 gap-3'>
                              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <Palette className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-xs font-medium'>Màu</span>
                                </div>
                                <Badge variant='outline' className='text-xs'>
                                  {detail.color}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <Ruler className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-xs font-medium'>Size</span>
                                </div>
                                <Badge variant='outline' className='text-xs'>
                                  {detail.size}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <ShoppingBag className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-xs font-medium'>Tồn</span>
                                </div>
                                <Badge
                                  variant={detail.quantity > 10 ? 'default' : 'destructive'}
                                  className='text-xs font-semibold'
                                >
                                  {detail.quantity}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-xs font-medium'>Giá</span>
                                </div>
                                <span className='font-bold text-sm'>{detail.price.toLocaleString()}₫</span>
                              </div>
                            </div>

                            {detail.description && (
                              <div className='pt-4 border-t'>
                                <p className='text-xs text-muted-foreground line-clamp-3 leading-relaxed'>
                                  {detail.description}
                                </p>
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

          {/* Tab 3: Enhanced Inventory Management */}
          <TabsContent value='inventory' className='space-y-8'>
            <Card className='shadow-sm overflow-hidden'>
              <CardHeader className='p-4'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <BarChart3 className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <h3 className='font-semibold'>Thống Kê Tồn Kho</h3>
                    <p className='text-sm text-muted-foreground'>Tổng quan inventory và giá trị sản phẩm</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-10'>
                  <div className='p-6 rounded-2xl border bg-muted'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Settings className='h-5 w-5 text-muted-foreground' />
                          <span className='text-sm font-semibold'>Tổng biến thể</span>
                        </div>
                        <p className='text-3xl font-bold'>{maternityDressDetails.length}</p>
                        <p className='text-sm text-muted-foreground'>Các phiên bản khác nhau</p>
                      </div>
                      <div className='w-12 h-12 rounded-full flex items-center justify-center bg-background border'>
                        <Package className='h-6 w-6 text-muted-foreground' />
                      </div>
                    </div>
                  </div>

                  <div className='p-6 rounded-2xl border bg-muted'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <ShoppingBag className='h-5 w-5 text-muted-foreground' />
                          <span className='text-sm font-semibold'>Tổng tồn kho</span>
                        </div>
                        <p className='text-3xl font-bold'>{totalStock}</p>
                        <p className='text-sm text-muted-foreground'>Sản phẩm có sẵn</p>
                      </div>
                      <div className='w-12 h-12 rounded-full flex items-center justify-center bg-background border'>
                        <BarChart3 className='h-6 w-6 text-muted-foreground' />
                      </div>
                    </div>
                  </div>

                  <div className='p-6 rounded-2xl border bg-muted'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <TrendingUp className='h-5 w-5 text-muted-foreground' />
                          <span className='text-sm font-semibold'>Tổng giá trị</span>
                        </div>
                        <p className='text-2xl font-bold'>{totalValue.toLocaleString()}₫</p>
                        <p className='text-sm text-muted-foreground'>Giá trị inventory</p>
                      </div>
                      <div className='w-12 h-12 rounded-full flex items-center justify-center bg-background border'>
                        <span className='text-xl font-bold'>₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                {maternityDressDetails.length > 0 ? (
                  <div className='space-y-6'>
                    <div className='flex items-center gap-3 mb-6'>
                      <BarChart3 className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <h4 className='text-base font-semibold'>Chi Tiết Tồn Kho</h4>
                        <p className='text-sm text-muted-foreground'>Thông tin chi tiết theo từng biến thể</p>
                      </div>
                    </div>

                    <div className='grid gap-4'>
                      {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                        <div
                          key={detail.id}
                          className='flex items-center justify-between p-6 rounded-2xl border hover:shadow-sm transition-all duration-200'
                        >
                          <div className='flex items-center gap-6'>
                            {detail.images && detail.images.length > 0 && (
                              <DetailProductImage
                                src={detail.images[0]}
                                alt={detail.name}
                                className='w-16 h-16 rounded-xl object-cover border'
                              />
                            )}
                            <div className='space-y-2'>
                              <h5 className='font-semibold text-lg'>{detail.name}</h5>
                              <div className='flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Palette className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-muted-foreground'>{detail.color}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Ruler className='h-4 w-4 text-muted-foreground' />
                                  <span className='text-muted-foreground'>{detail.size}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                  <span className='font-semibold'>{detail.price.toLocaleString()}₫</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='text-right space-y-1'>
                            <p className='text-3xl font-bold'>{detail.quantity}</p>
                            <p className='text-sm text-muted-foreground'>sản phẩm</p>
                            <Badge
                              variant={
                                detail.quantity > 10 ? 'default' : detail.quantity > 0 ? 'secondary' : 'destructive'
                              }
                              className='text-xs'
                            >
                              {detail.quantity > 10 ? 'Còn nhiều' : detail.quantity > 0 ? 'Sắp hết' : 'Hết hàng'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-16'>
                    <div className='max-w-md mx-auto space-y-6'>
                      <div className='w-32 h-32 rounded-full flex items-center justify-center mx-auto bg-muted'>
                        <BarChart3 className='h-10 w-10 text-muted-foreground' />
                      </div>
                      <div className='space-y-3'>
                        <h4 className='text-2xl font-bold'>Chưa có dữ liệu tồn kho</h4>
                        <p className='text-muted-foreground leading-relaxed'>
                          Thêm các biến thể sản phẩm để xem thống kê tồn kho chi tiết
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab('details')} className='h-10'>
                        <Plus className='h-4 w-4 mr-2' />
                        Thêm Biến Thể
                      </Button>
                    </div>
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
