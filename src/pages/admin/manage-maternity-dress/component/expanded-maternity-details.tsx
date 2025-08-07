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
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { useMaternityDressStore } from '@/stores/admin/maternity-dress.store'
import { MaternityDressDetailFormData, MaternityDressDetailType } from '@/@types/inventory.type'
import {
  useGetMaternityDressDetail,
  useCreateMaternityDressDetail,
  useDeleteMaternityDressDetail
} from '@/services/admin/maternity-dress.service'
import { toast } from 'sonner'

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
      <div
        className={`bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center border border-violet-200 dark:border-violet-700 ${className || 'w-16 h-16 rounded-xl'}`}
      >
        <Package className='h-8 w-8 text-violet-400' />
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
      <div className='h-80 border-2 border-dashed border-violet-200 dark:border-violet-700 rounded-2xl bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10 flex flex-col items-center justify-center text-violet-400'>
        <div className='p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4'>
          <ImageIcon className='h-12 w-12' />
        </div>
        <h4 className='font-medium text-violet-600 dark:text-violet-400 mb-2'>Chưa có hình ảnh</h4>
        <p className='text-sm text-violet-500'>Thêm hình ảnh để khách hàng có thể xem sản phẩm</p>
      </div>
    )
  }

  if (showAllImages) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg'>
              <Eye className='h-5 w-5 text-violet-600' />
            </div>
            <div>
              <p className='font-medium text-violet-700 dark:text-violet-300'>Tất cả hình ảnh</p>
              <p className='text-sm text-violet-500'>Hiển thị {images.length} ảnh</p>
            </div>
          </div>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setShowAllImages(false)}
            className='border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg'
          >
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
                  className='w-full h-40 object-cover rounded-xl border-2 border-violet-200 dark:border-violet-700 group-hover:border-violet-400 transition-all duration-300 shadow-sm group-hover:shadow-lg'
                />
                <div className='absolute top-3 left-3'>
                  <Badge className='bg-violet-500 text-white shadow-lg'>{index + 1}</Badge>
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
          <Badge className='bg-black/50 text-white backdrop-blur-sm shadow-lg'>
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              size='sm'
              variant='secondary'
              className='absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm shadow-lg'
              onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <Button
              size='sm'
              variant='secondary'
              className='absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm shadow-lg'
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
                    ? 'ring-2 ring-violet-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-violet-300 hover:ring-offset-1'
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
            <Button
              size='sm'
              variant='outline'
              onClick={() => setShowAllImages(true)}
              className='whitespace-nowrap border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg'
            >
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
      <div className='p-12 text-center'>
        <div className='max-w-md mx-auto space-y-6'>
          <div className='w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto'>
            <Package className='h-12 w-12 text-violet-400' />
          </div>
          <div className='space-y-2'>
            <h3 className='text-xl font-semibold text-violet-700 dark:text-violet-300'>Chọn đầm bầu để xem chi tiết</h3>
            <p className='text-violet-500'>
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
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200'></div>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-500 border-t-transparent absolute inset-0'></div>
          </div>
          <div className='space-y-2 text-center'>
            <h3 className='text-lg font-medium text-violet-700 dark:text-violet-300'>Đang tải thông tin đầm bầu</h3>
            <p className='text-violet-500'>Vui lòng chờ trong giây lát...</p>
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
    <div className='bg-gradient-to-br from-violet-50/30 to-purple-50/20 dark:from-violet-950/10 dark:to-purple-950/5 min-h-screen'>
      <div className='p-6 lg:p-8 max-w-7xl mx-auto'>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className='space-y-8'>
          {/* Enhanced TabsList */}
          <div className='flex justify-center'>
            <TabsList className='grid w-full max-w-2xl grid-cols-3 bg-white/80 dark:bg-background/80 backdrop-blur-sm shadow-lg border border-violet-200 dark:border-violet-700 rounded-2xl p-2 h-16'>
              <TabsTrigger
                value='info'
                className='flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-medium h-12'
              >
                <Info className='h-5 w-5' />
                <span className='hidden sm:inline'>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger
                value='details'
                className='flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-medium h-12'
              >
                <Settings className='h-5 w-5' />
                <span className='hidden sm:inline'>Chi tiết</span>
                <Badge variant='secondary' className='ml-1 bg-violet-100 text-violet-700'>
                  {maternityDressDetails.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='inventory'
                className='flex items-center gap-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-medium h-12'
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
              <Card className='border-0 shadow-xl bg-white/90 dark:bg-background/90 backdrop-blur-sm overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6'>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 bg-white/20 rounded-lg'>
                      <Info className='h-6 w-6' />
                    </div>
                    Thông Tin Cơ Bản
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-4'>
                        <div className='p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Sparkles className='h-4 w-4 text-violet-500' />
                            <span className='text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider'>
                              Mã sản phẩm
                            </span>
                          </div>
                          <p className='text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg'>
                            {maternityDress.id}
                          </p>
                        </div>

                        <div className='p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border border-rose-200 dark:border-rose-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Heart className='h-4 w-4 text-rose-500' />
                            <span className='text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider'>
                              Kiểu dáng
                            </span>
                          </div>
                          <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                            {maternityDress.styleName}
                          </p>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div className='p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <Star className='h-4 w-4 text-emerald-500' />
                            <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'>
                              Biến thể
                            </span>
                          </div>
                          <p className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                            {maternityDressDetails.length}
                          </p>
                        </div>

                        <div className='p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700'>
                          <div className='flex items-center gap-2 mb-2'>
                            <TrendingUp className='h-4 w-4 text-amber-500' />
                            <span className='text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider'>
                              Tổng giá trị
                            </span>
                          </div>
                          <p className='text-lg font-bold text-amber-600 dark:text-amber-400'>
                            {totalValue.toLocaleString()} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700'>
                      <div className='flex items-center gap-2 mb-2'>
                        <Package className='h-4 w-4 text-blue-500' />
                        <span className='text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider'>
                          URL Slug
                        </span>
                      </div>
                      <p className='text-sm font-mono text-blue-800 dark:text-blue-200 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg'>
                        {maternityDress.slug}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Product Images */}
              <Card className='border-0 shadow-xl bg-white/90 dark:bg-background/90 backdrop-blur-sm overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6'>
                  <CardTitle className='flex items-center gap-3 text-xl'>
                    <div className='p-2 bg-white/20 rounded-lg'>
                      <ImageIcon className='h-6 w-6' />
                    </div>
                    Hình Ảnh Sản Phẩm
                    <Badge className='bg-white/20 text-white ml-auto'>{maternityDress.images?.length || 0} ảnh</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <ImageGallery images={maternityDress.images || []} productName={maternityDress.name} />
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Description */}
            <Card className='border-0 shadow-xl bg-white/90 dark:bg-background/90 backdrop-blur-sm overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-white/20 rounded-lg'>
                    <Package className='h-6 w-6' />
                  </div>
                  Mô Tả Sản Phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='relative'>
                  {maternityDress.description ? (
                    <div className='prose prose-violet max-w-none'>
                      <Textarea
                        value={maternityDress.description}
                        readOnly
                        className='min-h-[150px] max-h-[400px] resize-none border-violet-200 dark:border-violet-700 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10 text-gray-700 dark:text-gray-300 leading-relaxed focus:ring-0 focus:border-violet-300 rounded-xl'
                      />
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <div className='w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Package className='h-8 w-8 text-violet-400' />
                      </div>
                      <p className='text-violet-500 italic'>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Enhanced Maternity Dress Details */}
          <TabsContent value='details' className='space-y-8'>
            <Card className='border-0 shadow-xl bg-white/90 dark:bg-background/90 backdrop-blur-sm overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6'>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-white/20 rounded-lg'>
                      <Settings className='h-6 w-6' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold'>Chi Tiết Sản Phẩm</h3>
                      <p className='text-violet-100 text-sm font-normal'>Quản lý các biến thể màu sắc, size và giá</p>
                    </div>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={createDetailMutation.isPending}
                    className='bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 h-10'
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
                  <Card className='mb-8 border-2 border-dashed border-violet-300 dark:border-violet-600 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-900/10 dark:to-purple-900/10 overflow-hidden'>
                    <CardHeader className='bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-b border-violet-200 dark:border-violet-700 p-6'>
                      <CardTitle className='text-xl text-violet-700 dark:text-violet-300 flex items-center gap-3'>
                        <div className='p-2 bg-violet-200 dark:bg-violet-800 rounded-lg'>
                          <Plus className='h-5 w-5' />
                        </div>
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
                                  <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                    <Sparkles className='h-4 w-4' />
                                    Tên Biến Thể *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Đầm bầu màu đỏ size M'
                                      className='border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 rounded-xl h-12 bg-white dark:bg-gray-800'
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
                                  <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                    <Palette className='h-4 w-4' />
                                    Màu Sắc *
                                  </FormLabel>
                                  <FormControl>
                                    <select
                                      className='w-full border border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 bg-white dark:bg-gray-800 px-4 py-3 text-sm rounded-xl h-12 transition-colors'
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
                                  <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                    <Ruler className='h-4 w-4' />
                                    Kích Thước *
                                  </FormLabel>
                                  <FormControl>
                                    <select
                                      className='w-full border border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 bg-white dark:bg-gray-800 px-4 py-3 text-sm rounded-xl h-12 transition-colors'
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
                                  <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                    <ShoppingBag className='h-4 w-4' />
                                    Số Lượng *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      min='0'
                                      placeholder='10'
                                      className='border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 rounded-xl h-12 bg-white dark:bg-gray-800'
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
                                  <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                    <TrendingUp className='h-4 w-4' />
                                    Giá (VNĐ) *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      min='0'
                                      step='1000'
                                      placeholder='299000'
                                      className='border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 rounded-xl h-12 bg-white dark:bg-gray-800'
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
                                <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                  <Package className='h-4 w-4' />
                                  Mô Tả Chi Tiết
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='Mô tả chi tiết về biến thể này: chất liệu, đặc điểm, phù hợp cho...'
                                    rows={4}
                                    className='border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400 rounded-xl bg-white dark:bg-gray-800 resize-none'
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
                                <FormLabel className='text-violet-700 dark:text-violet-300 font-semibold flex items-center gap-2'>
                                  <ImageIcon className='h-4 w-4' />
                                  Hình Ảnh Biến Thể *
                                </FormLabel>
                                <FormControl>
                                  <CloudinaryImageUpload
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    maxFiles={5}
                                    placeholder='Upload hình ảnh biến thể hoặc nhập URL'
                                    disabled={createDetailMutation.isPending}
                                    uploadOptions={{
                                      folder: 'maternity-dress-details',
                                      tags: ['maternity-dress-detail', 'product-variant'],
                                      width: 600,
                                      height: 600,
                                      crop: 'limit',
                                      quality: 'auto',
                                      format: 'auto'
                                    }}
                                  />
                                </FormControl>
                                <p className='text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700'>
                                  💡 Thêm tối đa 5 hình ảnh chất lượng cao để hiển thị chi tiết màu sắc, form dáng của
                                  biến thể này. Ảnh sẽ được tự động tối ưu để tải nhanh.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='flex gap-4 pt-6 border-t border-violet-200 dark:border-violet-700'>
                            <Button
                              type='submit'
                              disabled={createDetailMutation.isPending}
                              className='bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8'
                            >
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
                              className='border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl h-12 px-8'
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
                      <div className='w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto'>
                        <Settings className='h-16 w-16 text-violet-400' />
                      </div>
                      <div className='space-y-3'>
                        <h3 className='text-2xl font-bold text-violet-700 dark:text-violet-300'>
                          Chưa có biến thể nào
                        </h3>
                        <p className='text-violet-500 leading-relaxed'>
                          Tạo các biến thể với màu sắc, kích thước và giá khác nhau để hoàn thiện sản phẩm và bắt đầu
                          kinh doanh
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className='bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8'
                      >
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
                        className='relative group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:-translate-y-1'
                      >
                        <Button
                          size='sm'
                          variant='destructive'
                          className='absolute top-4 right-4 h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg rounded-lg'
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
                              <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
                              {detail.images.length > 1 && (
                                <Badge className='absolute bottom-3 left-3 bg-black/50 text-white backdrop-blur-sm'>
                                  +{detail.images.length - 1} ảnh
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className='w-full h-56 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center'>
                              <div className='text-center space-y-2'>
                                <Package className='h-12 w-12 text-violet-400 mx-auto' />
                                <p className='text-sm text-violet-500'>Chưa có ảnh</p>
                              </div>
                            </div>
                          )}

                          <div className='p-6 space-y-4'>
                            <h4 className='font-bold text-lg text-gray-800 dark:text-gray-200 line-clamp-2 min-h-[3.5rem]'>
                              {detail.name}
                            </h4>

                            <div className='grid grid-cols-2 gap-3'>
                              <div className='flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <Palette className='h-4 w-4 text-violet-500' />
                                  <span className='text-xs font-medium text-violet-600 dark:text-violet-400'>Màu</span>
                                </div>
                                <Badge
                                  variant='outline'
                                  className='bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700 text-xs'
                                >
                                  {detail.color}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <Ruler className='h-4 w-4 text-blue-500' />
                                  <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>Size</span>
                                </div>
                                <Badge
                                  variant='outline'
                                  className='bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs'
                                >
                                  {detail.size}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <ShoppingBag className='h-4 w-4 text-emerald-500' />
                                  <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                                    Tồn
                                  </span>
                                </div>
                                <Badge
                                  variant={detail.quantity > 10 ? 'default' : 'destructive'}
                                  className='text-xs font-semibold'
                                >
                                  {detail.quantity}
                                </Badge>
                              </div>

                              <div className='flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg'>
                                <div className='flex items-center gap-2'>
                                  <TrendingUp className='h-4 w-4 text-orange-500' />
                                  <span className='text-xs font-medium text-orange-600 dark:text-orange-400'>Giá</span>
                                </div>
                                <span className='font-bold text-orange-600 dark:text-orange-400 text-sm'>
                                  {detail.price.toLocaleString()}₫
                                </span>
                              </div>
                            </div>

                            {detail.description && (
                              <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                                <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed'>
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
            <Card className='border-0 shadow-xl bg-white/90 dark:bg-background/90 backdrop-blur-sm overflow-hidden'>
              <CardHeader className='bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-white/20 rounded-lg'>
                    <BarChart3 className='h-6 w-6' />
                  </div>
                  <div>
                    <h3 className='text-xl font-bold'>Thống Kê Tồn Kho</h3>
                    <p className='text-emerald-100 text-sm font-normal'>Tổng quan về inventory và giá trị sản phẩm</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-8'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-10'>
                  <div className='bg-gradient-to-br from-violet-500 to-purple-600 p-8 rounded-2xl text-white shadow-xl'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Settings className='h-5 w-5' />
                          <span className='text-sm font-semibold opacity-90'>Tổng biến thể</span>
                        </div>
                        <p className='text-4xl font-bold'>{maternityDressDetails.length}</p>
                        <p className='text-sm opacity-75'>Các phiên bản khác nhau</p>
                      </div>
                      <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center'>
                        <Package className='h-8 w-8' />
                      </div>
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-emerald-500 to-green-600 p-8 rounded-2xl text-white shadow-xl'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <ShoppingBag className='h-5 w-5' />
                          <span className='text-sm font-semibold opacity-90'>Tổng tồn kho</span>
                        </div>
                        <p className='text-4xl font-bold'>{totalStock}</p>
                        <p className='text-sm opacity-75'>Sản phẩm có sẵn</p>
                      </div>
                      <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center'>
                        <BarChart3 className='h-8 w-8' />
                      </div>
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-orange-500 to-amber-600 p-8 rounded-2xl text-white shadow-xl'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <TrendingUp className='h-5 w-5' />
                          <span className='text-sm font-semibold opacity-90'>Tổng giá trị</span>
                        </div>
                        <p className='text-2xl font-bold'>{totalValue.toLocaleString()}₫</p>
                        <p className='text-sm opacity-75'>Giá trị inventory</p>
                      </div>
                      <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center'>
                        <span className='text-2xl font-bold'>₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                {maternityDressDetails.length > 0 ? (
                  <div className='space-y-6'>
                    <div className='flex items-center gap-3 mb-6'>
                      <div className='p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg'>
                        <BarChart3 className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                      </div>
                      <div>
                        <h4 className='text-xl font-bold text-gray-800 dark:text-gray-200'>Chi Tiết Tồn Kho</h4>
                        <p className='text-sm text-gray-500'>Thông tin chi tiết theo từng biến thể</p>
                      </div>
                    </div>

                    <div className='grid gap-4'>
                      {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                        <div
                          key={detail.id}
                          className='flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300'
                        >
                          <div className='flex items-center gap-6'>
                            {detail.images && detail.images.length > 0 && (
                              <DetailProductImage
                                src={detail.images[0]}
                                alt={detail.name}
                                className='w-16 h-16 rounded-xl object-cover border-2 border-white dark:border-gray-600 shadow-md'
                              />
                            )}
                            <div className='space-y-2'>
                              <h5 className='font-semibold text-gray-800 dark:text-gray-200 text-lg'>{detail.name}</h5>
                              <div className='flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Palette className='h-4 w-4 text-violet-500' />
                                  <span className='text-gray-600 dark:text-gray-400'>{detail.color}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Ruler className='h-4 w-4 text-blue-500' />
                                  <span className='text-gray-600 dark:text-gray-400'>{detail.size}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <TrendingUp className='h-4 w-4 text-green-500' />
                                  <span className='font-semibold text-green-600 dark:text-green-400'>
                                    {detail.price.toLocaleString()}₫
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='text-right space-y-1'>
                            <p className='text-3xl font-bold text-gray-800 dark:text-gray-200'>{detail.quantity}</p>
                            <p className='text-sm text-gray-500'>sản phẩm</p>
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
                      <div className='w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto'>
                        <BarChart3 className='h-16 w-16 text-gray-400' />
                      </div>
                      <div className='space-y-3'>
                        <h4 className='text-2xl font-bold text-gray-600 dark:text-gray-400'>Chưa có dữ liệu tồn kho</h4>
                        <p className='text-gray-500 leading-relaxed'>
                          Thêm các biến thể sản phẩm để xem thống kê tồn kho chi tiết
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab('details')}
                        className='bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-12 px-8'
                      >
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
          background-color: rgba(6, 2, 16, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  )
}
