import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Package,
  Palette,
  Ruler,
  ShoppingBag,
  TrendingUp,
  FileText
} from 'lucide-react'
import React, { useState } from 'react'
import { MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'

interface MaternityDressDetailViewDialogProps {
  detail: MaternityDressDetailType
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Component để hiển thị hình ảnh
function DetailProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

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

// Component gallery cho hình ảnh
function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className='h-80 border-2 border-dashed rounded-2xl bg-muted/40 flex flex-col items-center justify-center text-muted-foreground'>
        <ImageIcon className='h-12 w-12 mb-3' />
        <h4 className='font-medium mb-1'>Chưa có hình ảnh</h4>
        <p className='text-sm'>Biến thể này chưa có hình ảnh</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Main image display */}
      <div className='relative overflow-hidden rounded-2xl'>
        <DetailProductImage
          src={images[currentImageIndex]}
          alt={`${productName} ${currentImageIndex + 1}`}
          className='w-full h-80 object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5'></div>

        {/* Image counter badge */}
        <div className='absolute top-4 left-4'>
          <Badge variant='secondary' className='backdrop-blur-sm bg-black/40 text-white border-0'>
            {currentImageIndex + 1} / {images.length}
          </Badge>
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              size='sm'
              variant='secondary'
              className='absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-background/80 hover:bg-background/90 backdrop-blur-sm'
              onClick={() => setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <Button
              size='sm'
              variant='secondary'
              className='absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 bg-background/80 hover:bg-background/90 backdrop-blur-sm'
              onClick={() => setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-2'>
          {images.map((image: string, index: number) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 relative group ${
                currentImageIndex === index
                  ? 'ring-2 ring-violet-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-violet-300 hover:ring-offset-1'
              } rounded-lg overflow-hidden transition-all duration-200`}
            >
              <DetailProductImage
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className='w-16 h-16 object-cover'
              />
              {currentImageIndex !== index && (
                <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200'></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const MaternityDressDetailViewDialog: React.FC<MaternityDressDetailViewDialogProps> = ({
  detail,
  trigger,
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <div className='h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center'>
              <Eye className='h-4 w-4 text-white' />
            </div>
            Chi tiết biến thể
          </DialogTitle>
          <DialogDescription>Xem thông tin chi tiết của biến thể "{detail.name}"</DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Image Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2 mb-4'>
              <ImageIcon className='h-5 w-5 text-violet-500' />
              <h3 className='font-semibold text-lg'>Hình ảnh sản phẩm</h3>
              <Badge variant='secondary' className='ml-auto'>
                {detail.image?.length || 0} ảnh
              </Badge>
            </div>
            <ImageGallery images={detail.image || []} productName={detail.name} />
          </div>

          {/* Information Section */}
          <div className='space-y-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg flex items-center gap-2'>
                <Package className='h-5 w-5 text-violet-500' />
                Thông tin cơ bản
              </h3>

              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Tên biến thể</label>
                  <p className='text-lg font-semibold mt-1'>{detail.name}</p>
                </div>

                {detail.sku && (
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>Mã SKU</label>
                    <p className='text-sm font-mono bg-muted px-3 py-2 rounded mt-1'>{detail.sku}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Attributes */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg'>Thuộc tính</h3>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Palette className='h-4 w-4 text-violet-500' />
                    <span className='text-sm font-medium text-muted-foreground'>Màu sắc</span>
                  </div>
                  <Badge variant='outline' className='text-sm font-semibold'>
                    {detail.color}
                  </Badge>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Ruler className='h-4 w-4 text-blue-500' />
                    <span className='text-sm font-medium text-muted-foreground'>Kích thước</span>
                  </div>
                  <Badge variant='outline' className='text-sm font-semibold'>
                    {detail.size}
                  </Badge>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <ShoppingBag className='h-4 w-4 text-green-500' />
                    <span className='text-sm font-medium text-muted-foreground'>Số lượng tồn kho</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl font-bold text-green-600'>{detail.quantity}</span>
                    <Badge
                      variant={detail.quantity > 10 ? 'default' : detail.quantity > 0 ? 'secondary' : 'destructive'}
                      className='text-xs'
                    >
                      {detail.quantity > 10 ? 'Còn nhiều' : detail.quantity > 0 ? 'Sắp hết' : 'Hết hàng'}
                    </Badge>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4 text-orange-500' />
                    <span className='text-sm font-medium text-muted-foreground'>Giá bán</span>
                  </div>
                  <span className='text-2xl font-bold text-orange-600'>{detail.price.toLocaleString()}₫</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {detail.description && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-violet-500' />
                  <h3 className='font-semibold text-lg'>Mô tả chi tiết</h3>
                </div>
                <div className='bg-muted/50 p-4 rounded-lg'>
                  <p className='text-sm leading-relaxed text-muted-foreground'>{detail.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
