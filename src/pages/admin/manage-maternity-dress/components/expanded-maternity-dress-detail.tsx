/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  Info,
  BarChart3,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  Palette,
  Ruler,
  ShoppingBag,
  TrendingUp,
  Eye,
  Image as ImageIcon,
  FileText,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'
import { useGetMaternityDressDetail, useDeleteMaternityDressDetail } from '@/services/admin/maternity-dress.service'
import { toast } from 'sonner'
import { MaternityDressDetailAction } from './maternity-dress-detail-action'
import { MaternityDressDetailEditDialog } from './maternity-dress-detail-edit-dialog'
import { MaternityDressDetailViewDialog } from './maternity-dress-detail-view-dialog'
import { useGetConfigs } from '@/services/global/system-config.service'

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

export function ExpandedMaternityDressDetails({ maternityDressId }: ExpandedMaternityDressDetailsProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [showAddForm, setShowAddForm] = useState(false)
  const { data: variant } = useGetConfigs()
  const sizes = variant?.data.fields.sizes
  const colors = variant?.data.fields.colors

  // React Query hooks - Get maternity dress detail by ID
  const { data: maternityDressDetailData, isLoading: isLoadingDetail } = useGetMaternityDressDetail(
    maternityDressId || ''
  )
  const deleteDetailMutation = useDeleteMaternityDressDetail()

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

  // Safe calculation with fallback values
  const totalStock = maternityDressDetails.reduce(
    (sum: number, detail: MaternityDressDetailType) => sum + (detail.quantity || 0),
    0
  )
  const totalValue = maternityDressDetails.reduce(
    (sum: number, detail: MaternityDressDetailType) => sum + (detail.quantity || 0) * (detail.price || 0),
    0
  )

  return (
    <div className='bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
      <div className='p-4 lg:p-6 max-w-7xl mx-auto'>
        {/* Enhanced Header Section */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                <Package className='h-5 w-5 text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-foreground'>{maternityDress.name || 'Chưa có tên'}</h2>
                <p className='text-sm text-muted-foreground'>Chi tiết sản phẩm và quản lý biến thể</p>
              </div>
            </div>
            <Badge variant='secondary' className='px-3 py-1'>
              {maternityDressDetails.length} biến thể
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className='space-y-6'>
          {/* Enhanced TabsList */}
          <div className='flex justify-center'>
            <TabsList className='grid w-full max-w-xl grid-cols-3 rounded-xl p-1 h-12 bg-muted/50'>
              <TabsTrigger
                value='info'
                className='flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 font-medium h-9'
              >
                <Info className='h-4 w-4' />
                <span className='hidden sm:inline'>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger
                value='details'
                className='flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 font-medium h-9'
              >
                <Settings className='h-4 w-4' />
                <span className='hidden sm:inline'>Biến thể</span>
                <Badge variant='secondary' className='ml-1 h-5 px-1.5 text-xs'>
                  {maternityDressDetails.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='inventory'
                className='flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 font-medium h-9'
              >
                <BarChart3 className='h-4 w-4' />
                <span className='hidden sm:inline'>Tồn kho</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Enhanced Product Information */}
          <TabsContent value='info' className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Product Images - Left Side */}
              <div className='lg:col-span-1'>
                <Card className='shadow-sm border-0 bg-gradient-to-br from-background to-violet-50/30 dark:to-violet-950/10'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between text-base'>
                      <div className='flex items-center gap-2'>
                        <ImageIcon className='h-4 w-4 text-violet-500' />
                        <span>Hình ảnh</span>
                      </div>
                      <Badge variant='secondary' className='text-xs'>
                        {maternityDress.images?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <ImageGallery images={maternityDress.images || []} productName={maternityDress.name || 'Đầm bầu'} />
                  </CardContent>
                </Card>
              </div>

              {/* Product Info - Right Side */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Basic Info Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <Card className='p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider'>
                          Mã sản phẩm
                        </p>
                        <p className='text-lg font-bold text-violet-700 dark:text-violet-300 font-mono'>
                          #{maternityDress.id?.slice(-8) || 'N/A'}
                        </p>
                      </div>
                      <div className='h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center'>
                        <Sparkles className='h-5 w-5 text-violet-600' />
                      </div>
                    </div>
                  </Card>

                  <Card className='p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider'>
                          Biến thể
                        </p>
                        <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                          {maternityDressDetails.length}
                        </p>
                      </div>
                      <div className='h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center'>
                        <Settings className='h-5 w-5 text-blue-600' />
                      </div>
                    </div>
                  </Card>

                  <Card className='p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider'>
                          Tổng tồn kho
                        </p>
                        <p className='text-2xl font-bold text-green-700 dark:text-green-300'>{totalStock}</p>
                      </div>
                      <div className='h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center'>
                        <ShoppingBag className='h-5 w-5 text-green-600' />
                      </div>
                    </div>
                  </Card>

                  <Card className='p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider'>
                          Tổng giá trị
                        </p>
                        <p className='text-lg font-bold text-orange-700 dark:text-orange-300'>
                          {totalValue.toLocaleString()}₫
                        </p>
                      </div>
                      <div className='h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center'>
                        <TrendingUp className='h-5 w-5 text-orange-600' />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Product Details */}
                <Card className='shadow-sm border-0'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Info className='h-4 w-4 text-violet-500' />
                      Chi tiết sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0 space-y-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='p-3 rounded-lg border bg-muted/30'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Heart className='h-4 w-4 text-muted-foreground' />
                          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            Kiểu dáng
                          </span>
                        </div>
                        <p className='text-sm font-semibold'>{maternityDress.styleName || 'Chưa xác định'}</p>
                      </div>

                      <div className='p-3 rounded-lg border bg-muted/30'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Package className='h-4 w-4 text-muted-foreground' />
                          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                            URL Slug
                          </span>
                        </div>
                        <p className='text-sm font-mono'>{maternityDress.slug || 'Chưa có slug'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className='p-3 rounded-lg border bg-muted/30'>
                      <div className='flex items-center gap-2 mb-2'>
                        <FileText className='h-4 w-4 text-muted-foreground' />
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                          Mô tả
                        </span>
                      </div>
                      {maternityDress.description ? (
                        <p className='text-sm leading-relaxed text-muted-foreground'>{maternityDress.description}</p>
                      ) : (
                        <p className='text-sm italic text-muted-foreground'>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Enhanced Maternity Dress Details */}
          <TabsContent value='details' className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Settings className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>Quản lý biến thể</h3>
                  <p className='text-sm text-muted-foreground'>Thêm và quản lý các biến thể màu sắc, kích thước</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={deleteDetailMutation.isPending}
                className='bg-violet-500 hover:bg-violet-600'
              >
                {showAddForm ? (
                  <>
                    <X className='h-4 w-4 mr-2' />
                    Đóng
                  </>
                ) : (
                  <>
                    <Plus className='h-4 w-4 mr-2' />
                    Thêm biến thể
                  </>
                )}
              </Button>
            </div>
            {/* Enhanced Add Detail Form */}
            {showAddForm && (
              <MaternityDressDetailAction
                maternityDressId={maternityDressId}
                colors={colors}
                sizes={sizes}
                onClose={() => setShowAddForm(false)}
              />
            )}

            {/* Enhanced Details List */}
            {maternityDressDetails.length === 0 ? (
              <div className='text-center py-16'>
                <div className='max-w-md mx-auto space-y-6'>
                  <div className='w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-violet-100 dark:bg-violet-900/30'>
                    <Settings className='h-10 w-10 text-violet-500' />
                  </div>
                  <div className='space-y-3'>
                    <h3 className='text-xl font-bold'>Chưa có biến thể nào</h3>
                    <p className='text-muted-foreground leading-relaxed'>
                      Tạo các biến thể với màu sắc, kích thước và giá khác nhau để hoàn thiện sản phẩm
                    </p>
                  </div>
                  <Button onClick={() => setShowAddForm(true)} className='h-10 bg-violet-500 hover:bg-violet-600'>
                    <Plus className='h-4 w-4 mr-2' />
                    Tạo biến thể đầu tiên
                  </Button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {maternityDressDetails.map((detail: MaternityDressDetailType) => (
                  <Card
                    key={detail.id}
                    className='relative group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background via-background to-violet-50/20 dark:to-violet-950/10'
                  >
                    {/* Delete Button */}
                    <div className='absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200'>
                      <Button
                        size='sm'
                        variant='destructive'
                        className='h-8 w-8 p-0 rounded-full shadow-lg'
                        onClick={() => handleRemoveDetail(detail.id)}
                        disabled={deleteDetailMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    {/* Image Section */}
                    <div className='relative h-64 overflow-hidden'>
                      {detail.image && detail.image.length > 0 ? (
                        <div className='relative h-full'>
                          <DetailProductImage
                            src={detail.image[0]}
                            alt={detail.name}
                            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent'></div>

                          {/* Image count badge */}
                          {detail.image.length > 1 && (
                            <Badge
                              variant='secondary'
                              className='absolute bottom-3 left-3 backdrop-blur-sm bg-black/40 text-white border-0'
                            >
                              <ImageIcon className='h-3 w-3 mr-1' />
                              {detail.image.length}
                            </Badge>
                          )}

                          {/* Stock status badge */}
                          <Badge
                            variant={
                              (detail.quantity || 0) > 10
                                ? 'default'
                                : (detail.quantity || 0) > 0
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className='absolute top-3 left-3 backdrop-blur-sm'
                          >
                            {(detail.quantity || 0) > 10
                              ? 'Còn hàng'
                              : (detail.quantity || 0) > 0
                                ? 'Sắp hết'
                                : 'Hết hàng'}
                          </Badge>
                        </div>
                      ) : (
                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60'>
                          <div className='text-center space-y-3'>
                            <Package className='h-12 w-12 text-muted-foreground/40 mx-auto' />
                            <p className='text-sm text-muted-foreground font-medium'>Chưa có hình ảnh</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className='p-6 space-y-5'>
                      {/* Title and SKU */}
                      <div className='space-y-2'>
                        <h4 className='font-bold text-lg leading-tight line-clamp-2 min-h-[3.5rem] text-foreground'>
                          {detail.name}
                        </h4>
                        {detail.sku && (
                          <div className='flex items-center gap-2'>
                            <Package className='h-3.5 w-3.5 text-muted-foreground' />
                            <span className='text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded'>
                              SKU: {detail.sku}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Attributes Grid */}
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Palette className='h-4 w-4 text-violet-500' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Màu sắc
                            </span>
                          </div>
                          <Badge variant='outline' className='w-fit text-xs font-semibold'>
                            {detail.color || 'Chưa xác định'}
                          </Badge>
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Ruler className='h-4 w-4 text-blue-500' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Kích thước
                            </span>
                          </div>
                          <Badge variant='outline' className='w-fit text-xs font-semibold'>
                            {detail.size || 'Chưa xác định'}
                          </Badge>
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <ShoppingBag className='h-4 w-4 text-green-500' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Tồn kho
                            </span>
                          </div>
                          <span className='text-lg font-bold text-green-600 dark:text-green-400'>
                            {detail.quantity || 0}
                          </span>
                        </div>

                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <TrendingUp className='h-4 w-4 text-orange-500' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Giá bán
                            </span>
                          </div>
                          <span className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                            {(detail.price || 0).toLocaleString()}₫
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {detail.description && (
                        <div className='pt-4 border-t space-y-2'>
                          <div className='flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-muted-foreground' />
                            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                              Mô tả
                            </span>
                          </div>
                          <p className='text-sm text-muted-foreground line-clamp-3 leading-relaxed'>
                            {detail.description}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className='flex gap-2 pt-2'>
                        <MaternityDressDetailEditDialog
                          detail={detail}
                          maternityDressId={maternityDressId}
                          colors={colors}
                          sizes={sizes}
                          trigger={
                            <Button variant='outline' size='sm' className='flex-1 h-9'>
                              <Settings className='h-4 w-4 mr-2' />
                              Chỉnh sửa
                            </Button>
                          }
                        />
                        <MaternityDressDetailViewDialog
                          detail={detail}
                          trigger={
                            <Button variant='outline' size='sm' className='flex-1 h-9'>
                              <Eye className='h-4 w-4 mr-2' />
                              Xem chi tiết
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Enhanced Inventory Management */}
          <TabsContent value='inventory' className='space-y-6'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Thống kê tồn kho</h3>
                <p className='text-sm text-muted-foreground'>Tổng quan inventory và giá trị sản phẩm</p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card className='p-4 bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider'>
                      Tổng biến thể
                    </p>
                    <p className='text-2xl font-bold text-violet-700 dark:text-violet-300'>
                      {maternityDressDetails.length}
                    </p>
                    <p className='text-xs text-muted-foreground'>Phiên bản khác nhau</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center'>
                    <Settings className='h-5 w-5 text-violet-600' />
                  </div>
                </div>
              </Card>

              <Card className='p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider'>
                      Tổng tồn kho
                    </p>
                    <p className='text-2xl font-bold text-green-700 dark:text-green-300'>{totalStock}</p>
                    <p className='text-xs text-muted-foreground'>Sản phẩm có sẵn</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center'>
                    <ShoppingBag className='h-5 w-5 text-green-600' />
                  </div>
                </div>
              </Card>

              <Card className='p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider'>
                      Tổng giá trị
                    </p>
                    <p className='text-xl font-bold text-orange-700 dark:text-orange-300'>
                      {totalValue.toLocaleString()}₫
                    </p>
                    <p className='text-xs text-muted-foreground'>Giá trị inventory</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center'>
                    <TrendingUp className='h-5 w-5 text-orange-600' />
                  </div>
                </div>
              </Card>
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
                        {detail.image && detail.image.length > 0 && (
                          <DetailProductImage
                            src={detail.image[0]}
                            alt={detail.name}
                            className='w-16 h-16 rounded-xl object-cover border'
                          />
                        )}
                        <div className='space-y-2'>
                          <h5 className='font-semibold text-lg'>{detail.name}</h5>
                          <div className='flex items-center gap-4 text-sm'>
                            <div className='flex items-center gap-2'>
                              <Palette className='h-4 w-4 text-muted-foreground' />
                              <span className='text-muted-foreground'>{detail.color || 'Chưa xác định'}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Ruler className='h-4 w-4 text-muted-foreground' />
                              <span className='text-muted-foreground'>{detail.size || 'Chưa xác định'}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <TrendingUp className='h-4 w-4 text-muted-foreground' />
                              <span className='font-semibold'>{(detail.price || 0).toLocaleString()}₫</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='text-right space-y-1'>
                        <p className='text-3xl font-bold'>{detail.quantity || 0}</p>
                        <p className='text-sm text-muted-foreground'>sản phẩm</p>
                        <Badge
                          variant={
                            (detail.quantity || 0) > 10
                              ? 'default'
                              : (detail.quantity || 0) > 0
                                ? 'secondary'
                                : 'destructive'
                          }
                          className='text-xs'
                        >
                          {(detail.quantity || 0) > 10
                            ? 'Còn nhiều'
                            : (detail.quantity || 0) > 0
                              ? 'Sắp hết'
                              : 'Hết hàng'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='text-center py-16'>
                <div className='max-w-md mx-auto space-y-6'>
                  <div className='w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-violet-100 dark:bg-violet-900/30'>
                    <BarChart3 className='h-10 w-10 text-violet-500' />
                  </div>
                  <div className='space-y-3'>
                    <h4 className='text-xl font-bold'>Chưa có dữ liệu tồn kho</h4>
                    <p className='text-muted-foreground leading-relaxed'>
                      Thêm các biến thể sản phẩm để xem thống kê tồn kho chi tiết
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('details')} className='h-10 bg-violet-500 hover:bg-violet-600'>
                    <Plus className='h-4 w-4 mr-2' />
                    Thêm biến thể
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
