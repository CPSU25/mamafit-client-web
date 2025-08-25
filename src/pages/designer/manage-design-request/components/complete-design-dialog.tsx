import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Calendar, Camera, User, DollarSign, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { CompleteDesignDialogProps } from '../types'

export const CompleteDesignDialog = ({
  isOpen,
  onClose,
  request,
  note,
  onNoteChange,
  image,
  onImageChange,
  onConfirm
}: CompleteDesignDialogProps) => {
  if (!request) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onImageChange(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            Hoàn thành thiết kế
          </DialogTitle>
          <DialogDescription>
            Xác nhận hoàn thành thiết kế cho yêu cầu này. Hãy cung cấp ghi chú và hình ảnh thiết kế hoàn thành.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Request Summary */}
          <div className='bg-muted/30 rounded-lg p-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium text-foreground'>Thông tin yêu cầu</h4>
              <Badge variant='secondary' className='bg-green-100 text-green-700 border-green-200'>
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
                  <span className='font-medium'>{request.orderItem.price?.toLocaleString('vi-VN')} ₫</span>
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

          {/* Completion Form */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='note'>Ghi chú hoàn thành</Label>
              <Textarea
                id='note'
                placeholder='Nhập ghi chú về thiết kế đã hoàn thành, các thay đổi đã thực hiện, hoặc lưu ý cho khách hàng...'
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={4}
                className='resize-none'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='image'>Hình ảnh thiết kế hoàn thành</Label>
              <div className='space-y-3'>
                <Input
                  id='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='cursor-pointer'
                />
                {image && (
                  <div className='relative'>
                    <img
                      src={image}
                      alt='Thiết kế hoàn thành'
                      className='w-full max-w-md rounded-lg border shadow-sm'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onImageChange('')}
                      className='absolute top-2 right-2 bg-white/80 hover:bg-white'
                    >
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className='space-y-3'>
            <h4 className='font-medium text-foreground'>Trạng thái hiện tại</h4>
            <div className='flex items-center gap-2'>
              <AlertCircle className='w-4 h-4 text-blue-500' />
              <span className='text-sm text-muted-foreground'>
                Task đang ở trạng thái "Đang thiết kế". Bạn có muốn đánh dấu hoàn thành ngay bây giờ?
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
              disabled={!note.trim() || !image}
              className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Hoàn thành thiết kế
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
