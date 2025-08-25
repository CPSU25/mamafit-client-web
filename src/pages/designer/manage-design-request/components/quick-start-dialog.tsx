import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Calendar, 
  Camera, 
  User, 
  DollarSign,
  AlertCircle
} from 'lucide-react'
import dayjs from 'dayjs'
import { QuickStartDialogProps } from '../types'

export const QuickStartDialog = ({
  isOpen,
  onClose,
  request,
  onConfirm
}: QuickStartDialogProps) => {
  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Play className='w-5 h-5 text-blue-600' />
            Bắt đầu thiết kế
          </DialogTitle>
          <DialogDescription>
            Xác nhận bắt đầu thiết kế cho yêu cầu này. Hành động này sẽ cập nhật trạng thái task thành "Đang thiết kế".
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Request Summary */}
          <div className='bg-muted/30 rounded-lg p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium text-foreground'>Thông tin yêu cầu</h4>
              <Badge variant='secondary' className='bg-blue-100 text-blue-700 border-blue-200'>
                {request.orderCode}
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <User className='w-4 h-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Khách hàng:</span>
                  <span className='font-medium'>{request.orderItem.designRequest.username || 'N/A'}</span>
                </div>
                
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar className='w-4 h-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Ngày tạo:</span>
                  <span className='font-medium'>{dayjs(request.orderItem.createdAt).format('DD/MM/YYYY')}</span>
                </div>
                
                <div className='flex items-center gap-2 text-sm'>
                  <DollarSign className='w-4 h-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Giá trị:</span>
                  <span className='font-medium'>
                    {request.orderItem.price?.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm'>
                  <Camera className='w-4 h-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Mô tả:</span>
                  <span className='font-medium'>{request.orderItem.designRequest.description || 'Không có mô tả'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className='space-y-3'>
            <h4 className='font-medium text-foreground'>Trạng thái hiện tại</h4>
            <div className='flex items-center gap-2'>
              <AlertCircle className='w-4 h-4 text-amber-500' />
              <span className='text-sm text-muted-foreground'>
                Task đang ở trạng thái "Chờ xử lý". Bạn có muốn bắt đầu thiết kế ngay bây giờ?
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button 
              onClick={onConfirm}
              className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            >
              <Play className='w-4 h-4 mr-2' />
              Bắt đầu thiết kế
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
