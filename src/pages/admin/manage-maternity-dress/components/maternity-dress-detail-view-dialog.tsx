import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Eye, Image as ImageIcon, Package, Palette, Ruler, ShoppingBag, TrendingUp, FileText } from 'lucide-react'
import React from 'react'
import { MaternityDressDetailType } from '@/@types/manage-maternity-dress.types'
import { ImageGallery } from './expanded-maternity-dress-detail'
import ExpandableHtmlContent from '@/components/expandable-html-content'

interface MaternityDressDetailViewDialogProps {
  detail: MaternityDressDetailType
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
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
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
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
          </div>
        </div>
        <Separator />

        {/* Description */}
        {detail.description && (
          <div className='sm:max-w-3xl'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-violet-500' />
              <h3 className='font-semibold text-lg'>Mô tả chi tiết</h3>
            </div>
            <div className='bg-muted/50 p-4 rounded-lg'>
              <ExpandableHtmlContent content={detail.description} maxLength={300} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
